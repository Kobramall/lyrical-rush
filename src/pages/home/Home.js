import {useEffect, useState, useRef} from 'react'
import recordArm from "../../assets/recordArm.png"
import music from "../../assets/heroMusic.mp3"
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import IconButton from '@mui/material/IconButton';

import { db } from "../../firebase";
import {collection, doc,  getDoc} from "firebase/firestore";


import "./Home.css"


export default function Home() {

    const [songName, setSongName] = useState("");

    const [recordPlaying, setRecordPlaying] = useState(false)
    const [recordArmStyle, setRecordArmStyle] = useState({
        transform: "rotate(-25deg)",
        transformOrigin: "top left", // Rotate around the top-left corner
        transition: "transform 1.0s", // Smooth rotation
    })
    const [recordAnimation, setRecordAnimation] = useState({})

    const audioRef = useRef(null)

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

    useEffect(()=> {
         
         getData()
      
    }, [])



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
          <input value={songName} placeholder='Title' onChange={(evt)=> setSongName(evt.target.value)}/>
          <button onClick={() => submitSongTitle()}> Submit </button>
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
