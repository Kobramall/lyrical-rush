import axios from 'axios';

const tokenUrl = "https://accounts.spotify.com/api/token";
const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const clientSecret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

const authUrl = "https://accounts.spotify.com/authorize";
const redirectUri = "http://localhost:3000"; // Replace with your redirect URI
const scopes = [
  "user-read-private", 
  "user-library-read",
];

const getAuthorizationUrl = () => {
    const params = new URLSearchParams({
        client_id: clientId,
        response_type: "code",
        redirect_uri: redirectUri,
        scope: scopes.join(" "),
    });
    return `${authUrl}?${params.toString()}`;
};

const redirectToSpotifyLogin = () => {
    window.location.href = getAuthorizationUrl();
};

const exchangeAuthorizationCodeForToken = async (code) => {
  try {
      const response = await axios.post(
          tokenUrl,
          new URLSearchParams({
              grant_type: "authorization_code",
              code,
              redirect_uri: redirectUri,
              client_id: clientId,
              client_secret: clientSecret,
          }),
          {
              headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
              },
          }
      );
      return response.data; // Contains access_token and refresh_token
  } catch (error) {
      console.error("Error exchanging authorization code for token:", error.message);
      throw error;
  }
};


const refreshAccessToken = async (refreshToken) => {
  try {
      const response = await axios.post(
          tokenUrl,
          new URLSearchParams({
              grant_type: "refresh_token",
              refresh_token: refreshToken,
              client_id: clientId,
              client_secret: clientSecret,
          }),
          {
              headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
              },
          }
      );

      // Return the new access token
      
      return response.data;
  } catch (error) {
      console.error("Error refreshing Spotify access token:", error.message);
      throw error;
  }
};


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



export {getTokenOnLoad, redirectToSpotifyLogin, exchangeAuthorizationCodeForToken, refreshAccessToken };