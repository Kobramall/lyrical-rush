/*const functions = require('firebase-functions');
const axios = require('axios');
const qs = require('qs');

const clientId = functions.config().spotify.client_id;
const clientSecret = functions.config().spotify.client_secret;
const tokenUrl = 'https://accounts.spotify.com/api/token';

console.log(clientId, clientSecret)

exports.getSpotifyToken = functions.https.onRequest(async (req, res) => {
    try {
        const response = await axios.post(
            tokenUrl,
            qs.stringify({ grant_type: 'client_credentials' }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
                }
            }
        );
        res.status(200).send(response.data);
    } catch (error) {
        console.error('Error fetching Spotify access token:', error.message);
        res.status(500).send({ error: 'Failed to retrieve token' });
    }
});
*/

const functions = require('firebase-functions');