import { useEffect } from 'react';
import Home from './pages/home/Home';
import SongRecommender from './pages/songRecommender/SongRecommender';
import { getTokenOnLoad, exchangeAuthorizationCodeForToken, refreshAccessToken } from './getToken'

import './App.css';

function App() {


  useEffect(()=> {
    const now = new Date()

    const expires = new Date(localStorage.getItem("simpleExpiredTime"))
       
       if(!localStorage.getItem("simpleToken") || !localStorage.getItem("simpleExpiredTime")){ 
         handleSpotifySimpleToken()
       }else{
          if(expires < now && expires){
            handleSpotifySimpleToken()
         }
       }
     
  }, [])


  const handleSpotifyCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");


    if (code) {
        try {
            const tokens = await exchangeAuthorizationCodeForToken(code);
            console.log("Access Token:", tokens.access_token);
            console.log("Refresh Token:", tokens.refresh_token);

            if(tokens.access_token && tokens.refresh_token){
              localStorage.setItem("accessToken", tokens.access_token)
              localStorage.setItem("refreshToken", tokens.refresh_token)
  
              const expires = new Date()
              expires.setHours(expires.getHours() + 1)
              localStorage.setItem("expiredTime", expires)
            }
        } catch (error) {
            console.error("Error handling Spotify callback:", error);
        }
    } else {
        console.error("Authorization code not found in URL.");
    }
};

const handleSpotifySimpleToken = async () => {
 
      try {
          const tokens = await getTokenOnLoad()

          if(tokens.access_token){
            localStorage.setItem("simpleToken", tokens.access_token)

            const expires = new Date()
            expires.setHours(expires.getHours() + 1)
            localStorage.setItem("simpleExpiredTime", expires)
          }
      } catch (error) {
          console.error("Error handling Spotify callback:", error);
      }
  
};

const handleRefreshToken = async () => {
      try {
         
          const tokens = await refreshAccessToken(localStorage.getItem("refreshToken"))

          if(tokens.access_token){
            localStorage.setItem("accessToken", tokens.access_token)

            const expires = new Date()
            expires.setHours(expires.getHours() + 1)
            localStorage.setItem("expiredTime", expires)
          }
      } catch (error) {
          console.error("Error handling Spotify callback:", error);
      }
};

  return (
    <div className="App">
       <Home />
    </div>
  );
}

export default App;
