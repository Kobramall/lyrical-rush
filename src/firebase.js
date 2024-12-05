// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAoIkRYJhIG0sfdJZlCe_jxc_14FOvnemM",
  authDomain: "lyrcial-rush.firebaseapp.com",
  projectId: "lyrcial-rush",
  storageBucket: "lyrcial-rush.firebasestorage.app",
  messagingSenderId: "1033786656500",
  appId: "1:1033786656500:web:6f3577cca9f1fa347ec0a1",
  measurementId: "G-CW45JX0S1E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app)