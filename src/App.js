import { useEffect } from 'react';
import Home from './pages/home/Home';
import { redirectToSpotifyLogin, exchangeAuthorizationCodeForToken, refreshAccessToken } from './getToken'

import './App.css';

function App() {


  useEffect(()=> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const now = new Date()

    const expires = new Date(localStorage.getItem("expiresTime"))
    
    if(code){    
       if(!localStorage.getItem("accessToken") || !localStorage.getItem("refreshToken") || !localStorage.getItem("expiredTime")){ 
        handleSpotifyCallback()
       }else{
          if(expires < now && expires){
            handleRefreshToken()
         }
       }
     }else{
        redirectToSpotifyLogin()
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
