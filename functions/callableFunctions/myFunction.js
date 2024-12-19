const functions = require("firebase-functions/v2");
const admin = require("firebase-admin");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

exports.myFunction = functions
    .https.onCall(async (data) =>{
      if (!data) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Missing required fields: data object and/or user ID.",
        );
      }

      try {
        return {
          success: true,
        };
      } catch (error) {
        console.error("Error calling myFunction:", error);
        throw new functions.https.HttpsError(
            "internal",
            "Interal server.",
        );
      }
    });
