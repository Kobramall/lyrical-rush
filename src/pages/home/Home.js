import {useEffect, useState, useRef} from 'react'
import axios from 'axios';
import recordArm from "../../assets/recordArm.png"
import music from "../../assets/heroMusic.mp3"
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

import { db } from "../../firebase";
import {doc,  getDoc} from "firebase/firestore";

import { runONNXModel } from '../../OnnxUtils';


import "./Home.css"


export default function Home() {

    const [trackSearchName, setTrackSearchName] = useState("")
    const [searchTracks, setSearchTracks] = useState([])
    const [selectedTrack, setSelectedTrack] = useState({})
    const [recommedSearch, setRecommendSearch] = useState(false)
    const [recommedSearchTracks, setRecommedSearchTracks] = useState([])
    const [recommedTracksStats, setRecommedTracksStats] = useState([])
    const [loading, setLoading] = useState(false)
 
    const [recordPlaying, setRecordPlaying] = useState(false)
    const [recordArmStyle, setRecordArmStyle] = useState({
        transform: "rotate(-25deg)",
        transformOrigin: "top left", // Rotate around the top-left corner
        transition: "transform 1.0s", // Smooth rotation
    })
    const [recordAnimation, setRecordAnimation] = useState({})

    const audioRef = useRef(null)

    useEffect(()=> {
        if(trackSearchName !== ""){
           searchTrack(trackSearchName, 5)
        }

        if(trackSearchName === ""){
            setSearchTracks([])
        }
    }, [trackSearchName])


    const getData = async () => {

        const metadata = []
        const embedding = []
      try{
         const songRef = doc(db, "data", "data")
         const snapShot = await getDoc(songRef);

         if(snapShot.exists()){
            const songData = snapShot.data()
            const songs = songData['data1']
            
            songs.map(song => embedding.push(song.embedding));
            songs.map(song => metadata.push({
              title: song.title,
              artist: song.artist
          }));


        const songRef2 = doc(db, "data", "data2")
        const snapShot2 = await getDoc(songRef2);

        if(snapShot2.exists()){
           const songData = snapShot2.data()
           const songs = songData['data2']
            
           songs.map(song => embedding.push(song.embedding));
            songs.map(song => metadata.push({
              title: song.title,
              artist: song.artist
          }));
          return [metadata, embedding]
        }else{
           console.error("No song data for data 2 found")
        }
         }else{
            console.error("No song data for data 1 found")
         }
      }catch (error){
        console.error('Error fetching song data:', error)
      }

      try{
        
     }catch (error){
       console.error('Error fetching song data:', error)
     }

       
    }

    const playRecord = () => {
        
        if(!recordPlaying){
          setRecordAnimation({...recordAnimation, animation: "rotate 10s linear infinite", animationPlayState: "running"})
          audioRef.current.volume = .2
          audioRef.current.play()
          setRecordPlaying(true)
        }else{
            setRecordPlaying(false)
        }
    }

    const pauseRecord = () => {
        setRecordArmStyle({...recordArmStyle, transform: "rotate(-25deg)",})
        setRecordAnimation({...recordAnimation, animationPlayState: "paused"})
        audioRef.current.pause()
    }

    const getRecommendations = async () => {
         setLoading(true)
         const tracks = []
         const similarity = []
      try {
           
           let inputFeatures = []   

           let trackFeatures = await fetchAudioFeatures(selectedTrack.name, selectedTrack.artists[0].name)

           if(trackFeatures.message === "No data found for the provided MBID."){

            const features = trackFeatures.defaultData
             inputFeatures = [features.tempo, features.key, features.mood, ...features.timbre]
           }else{

           const tempo = approximateTempo(trackFeatures.highlevel.danceability, trackFeatures.highlevel.mood_party)
           const key = trackFeatures.highlevel.tonal_atonal.all.atonal
           const mood = trackFeatures.highlevel.timbre.all.bright > trackFeatures.highlevel.timbre.all.dark ? 1 : 0
           const trackTimbre = processTimbreData(trackFeatures.highlevel.timbre, "gradient")
          
           inputFeatures = [tempo, key, mood, ...trackTimbre]

           }

           const data = await getData()

           const output = await runONNXModel(inputFeatures, data[1], data[0]); 
          
          if(output.length){
            setRecommendSearch(true)
            for (const track of output) {
              const result = await searchTrack(`${track.artist},${track.title} `, 1);
              tracks.push(result);
              similarity.push(track.similarity)

            }
            setLoading(false)
            setRecommedSearchTracks([...tracks, selectedTrack])
            setRecommedTracksStats([...similarity, 1])

            
          }
          
      } catch (error) {
          console.error("Error fetching recommendations:", error);
      }
  };


    const searchTrack = async (query, limit) => {
        const url = 'https://api.spotify.com/v1/search';

        try {
          const response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("simpleToken")}`, 
            },
            params: {
              q: query, 
              type: 'track', 
              market: 'US',
              limit: limit, 
            },
          });
          
          if(limit === 1){
            return response.data.tracks.items[0]
          }else{
           setSearchTracks(response.data.tracks.items)
          }
        } catch (error) {
          console.error('Error fetching tracks:', error.response?.data || error.message);
          throw error;
        }
    }

    const selectTrack = (track) => {
        setSelectedTrack(track)
        setSearchTracks([])
        setTrackSearchName("")
    }

    const musicBrainzSearch = async (track, artist) => {
      try {
          const response = await axios.get("https://musicbrainz.org/ws/2/recording", {
              params: {
                  query: `track:${track} artist:${artist}`,
                  fmt: "json",
              },
          });
  
          const recordings = response.data.recordings;
          if (recordings && recordings.length > 0) {
            return recordings[0].id; // Return the MBID of the first match
          } else {
             console.log("Track not found on MusicBrainz.");
              return "4ad2ca2d-5a12-4142-8371-e402b3401be8";
          }
      } catch (error) {
          console.error("MusicBrainz Search Error:", error);

          if (error.response && error.response.status === 404) {
            // Send back a default response if AcousticBrainz API returns 404
            return "4ad2ca2d-5a12-4142-8371-e402b3401be8"
          }
        
      }
  };

  const acousticBrainzFeatures = async (mbid) => {
    
    try {
      const response = await fetch(`https://acousticbrainz.org/${mbid}/high-level`);
  
      if (!response.ok) {
        if (response.status === 404) {
         
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("No data found for the provided MBID. Using filler data instead");
      return {
        message: "No data found for the provided MBID.",
        defaultData: {
          tempo: 120.0,
          key: 0,
          mood: 1,
          timbre: [40.0, 20.0, -10.0, 0.0, -45.0, 15.0, 10.0, 2.0, 5.5,
            10.0, -15.0, 7.0],
        },
      };
    }
  };
// Combined Workflow
const fetchAudioFeatures = async (track, artist) => {
    try {
        const mbid = await musicBrainzSearch(track, artist);

        const features = await acousticBrainzFeatures(mbid);

        return features;
    } catch (error) {
        console.error("Error fetching audio features:", error);
    }
};

const processTimbreData = (timbreData, strategy = "simple") => {
  const { probability, value } = timbreData;
  const { bright, dark } = timbreData.all

  let timbreArray = new Array(12).fill(0);

  switch (strategy) {
    case "simple":
      timbreArray = [...Array(6).fill(bright), ...Array(6).fill(dark)];
      break;

    case "gradient":
      timbreArray = Array.from({ length: 12 }, (_, i) =>
        bright + (dark - bright) * (i / 11)
      );
      break;

    case "weighted":
      const dominantValue = value === "dark" ? dark : bright;
      timbreArray = new Array(12).fill(probability * dominantValue);
      break;

    default:
      throw new Error("Invalid strategy specified");
  }

  return timbreArray;
};

const approximateTempo = (danceabilityData, moodPartyData) => {
  const danceableProbability = danceabilityData.all?.danceable || 0;
  const partyProbability = moodPartyData.all?.party || 0;

  // Scale tempo based on probabilities
  const minTempo = 60; // Slow ballads
  const maxTempo = 180; // Fast dance tracks
  const tempo =
    minTempo +
    (maxTempo - minTempo) * Math.max(danceableProbability, partyProbability);

  return tempo;
};

const startOver = () => {
   setSearchTracks([])
   setRecommedSearchTracks([])
   setSelectedTrack("")
}


    return (
    <div>
    <div className={loading ? "loading" : "hidden"}>
      <h2>Loading</h2>
    </div>
      <div className="homeMainContainer">
        <div className='heroContainer left'>
          {recommedSearchTracks.length ? null :
          <div className='heroContainer'>
            <h1>Type a song name to get similiar songs</h1>
             {!selectedTrack.name ? <input value={trackSearchName} placeholder='Title' onChange={(evt)=> setTrackSearchName(evt.target.value)}/>
               : <div className='searchTracksContainer'>
                   <img src={selectedTrack.album.images[0].url} alt="album cover" width={70} height={70}/>
                   <div className='searchTracksInfo'>
                      <h2>{selectedTrack.name}</h2>
                      <h3>{selectedTrack.artists[0].name}</h3> 
                   </div>
                   <div className='closeIconContainer'>
                     <IconButton onClick={() => setSelectedTrack({})}>
                       <CloseIcon />
                     </IconButton>
                   </div>
                 </div>  
               }
         </div>
         }
          {searchTracks.length > 0 && !recommedSearch ? searchTracks.map((track) => {
              return(
                 <div className='searchTracksContainer' style={{justifyContent: 'flex-start'}} key={track.id} onClick={() => selectTrack(track)}>
                    <img src={track.album.images[0].url} alt="album cover" width={70} height={70}/>
                    <div className='searchTracksInfo'>
                      <h2>{track.name}</h2>
                      <h3>{track.artists[0].name}</h3>
                    </div>
                 </div>   
              )
          })
             
            : null}
          {recommedSearchTracks.length > 0 && recommedSearch ? 
          <div className='grindDisplay'>
            {recommedSearchTracks.map((track, i) => {
              return(
                <div className='tooltip-container'>
                 <div className='recommendTracksContainer' style={{justifyContent: 'flex-start'}} key={track.id}>
                    <img src={track.album.images[0].url} alt="album cover" width={70} height={70}/>
                    <div className='recommendTracksInfo'>
                      <h2>{track.name}</h2>
                      <h3>{track.artists[0].name}</h3>
                    </div>
                 </div>
                 <div className="tooltip-box">Similarity: {Math.ceil(recommedTracksStats[i] * 100)}%</div>
                </div>    
               )
            })}
            <button onClick={()=> startOver()}>Start Over</button>
            <div className='tooltip-container'>
              <button className='playlistButton'>Make a Playlist!</button>
              <div className="tooltip-box">Coming Soon</div>
            </div>
          </div>
            :
            <div>
               <button disabled={!selectedTrack.name} onClick={async () => getRecommendations()}> Submit </button>
             </div>
             }
        </div>
        <div className='heroContainer right'>
          <div className='recordOuter'>
             <div className='recordInner'>
               <div className='recordContainer'>
                  <div style={recordAnimation} className='recordPurple'>
                     <div className='recordYellow'>
                        <h3>Lyrical</h3>
                        <div className='pin'></div>
                        <h3>Rush</h3>
                     </div>
                  </div>
               </div>
               <div className='controlsContainer'>
                 <div className="armContainer">
                   <img style={recordArmStyle} src={recordArm} alt="Record Arm" onTransitionEnd={() => playRecord()}/>
                 </div>
                 <div className='dialContainer'>
                    <div className='dial'></div>
                    <div className='dial'>
                     <IconButton onClick={()=> recordPlaying? pauseRecord() : setRecordArmStyle({...recordArmStyle, transform: "rotate(0deg)" })}>
                       <PlayArrowIcon fontSize="inherit" />
                     </IconButton>
                    </div>
                 </div>
               </div>
             </div>
          </div>
        </div>
        <audio ref={audioRef} controls loop>
           <source src={music} type="audio/mpeg" />
        </audio>
     </div>
    </div>
  )
}
