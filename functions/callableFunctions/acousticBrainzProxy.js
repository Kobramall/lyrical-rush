const functions = require("firebase-functions/v2");
const axios = require("axios");
const cors = require("cors");

const corsHandler = cors({origin: true});

// Proxy route for AcousticBrainz API
exports.acousticBrainzProxy = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    const mbid = req.query.mbid; // Expecting MBID as a query parameter
    const url = `https://acousticbrainz.org/${mbid}/high-level`;

    try {
      const response = await axios.get(url);
      res.set("Access-Control-Allow-Origin", "*");
      return res.json(response.data);
    } catch (error) {
      console.error("Error fetching AcousticBrainz data:", error.message);

      if (error.response && error.response.status === 404) {
        // Send back a default response if AcousticBrainz API returns 404
        return res.json({
          message: "No data found for the provided MBID.",
          defaultData: {
            tempo: 120.0,
            key: 0,
            mood: 1,
            timbre: [40.0, 20.0, -10.0, 0.0, -45.0, 15.0, 10.0, 2.0, 5.5,
              10.0, -15.0, 7.0],
          },
        });
      }
      res.status(500).send("Error fetching data from AcousticBrainz.");
    }
  });
});
