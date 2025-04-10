import { useEffect } from "react"
import SongRecommender from "../songRecommender/SongRecommender"

import "./Home.css"


export default function Home() {

   useEffect(()=> {
        getTrack()
   }, [])


   const getTrack = async () => {
        try{
           let response = await fetch("https://api.deezer.com/search?q=eminem")
           let data = await response.json()
           console.log(data)
        }catch(err){
             console.error(err)
        }
   }

  
    return (
    <div>
      <SongRecommender />
    </div>
  )
}
