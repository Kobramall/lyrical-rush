import {useEffect, useState, useRef} from 'react'
import axios from 'axios';
import recordArm from "../../assets/recordArm.png"
import music from "../../assets/heroMusic.mp3"
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

import { db } from "../../firebase";
import {collection, doc,  getDoc} from "firebase/firestore";

import { getTokenOnLoad } from '../../getToken';


import "./Home.css"


export default function Home({ token }) {

    const [songName, setSongName] = useState("");
    const [trackSearchName, setTrackSearchName] = useState("")
    const [searchTracks, setSearchTracks] = useState([])
    const [selectedTrack, setSelectedTrack] = useState({})

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
           searchTrack(token, trackSearchName)
        }

        if(trackSearchName === ""){
            setSearchTracks([])
        }
    }, [trackSearchName])




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

    const submitSongTitle = () => {
         
    }


    const searchTrack = async (accessToken, query) => {
        const url = 'https://api.spotify.com/v1/search';

        try {
          const response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${accessToken}`, // Add the token to the Authorization header
            },
            params: {
              q: query, // Search query
              type: 'track', // Specify search type (e.g., track, artist, album)
              market: 'US',
              limit: 5, // Number of results to return (optional, default is 20)
            },
          });
      
          // Response data
          setSearchTracks(response.data.tracks.items)
          console.log(response.data.tracks.items)
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

    



      const getData = async() => {
        const testRef = doc(db, "test", "Test")
        try{
            const snapShot = await getDoc(testRef);

            if(snapShot.exists()){
             console.log(snapShot.data())
            }
            }catch(e){
                console.error(e)
            }
      }

    return (
    <div className="homeMainContainer">
      <div className='heroContainer left'>
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
       </div>  }
          {searchTracks.length > 0 ? searchTracks.map((track) => {
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
          <button disabled={!selectedTrack.name} onClick={() => submitSongTitle()}> Submit </button>
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
  )
}
