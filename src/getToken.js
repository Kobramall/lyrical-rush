import axios from 'axios';

const tokenUrl = "https://accounts.spotify.com/api/token";
const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const clientSecret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;



const getTokenOnLoad = async () => {
    try {
        const response = await axios.post(
          tokenUrl,
          new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );

          return response.data
    }catch(error){
        console.error("Error fetching Spotify access token:", error.message);
        throw error
    }

}


const getNewToken = async () => {

}

export {getTokenOnLoad, getNewToken};