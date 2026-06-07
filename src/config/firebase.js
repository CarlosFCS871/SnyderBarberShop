// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAqMXqCDyYYeGjzkVUAewZfrDQ_B5LVBac",
  authDomain: "snyder-barber.firebaseapp.com",
  projectId: "snyder-barber",
  storageBucket: "snyder-barber.firebasestorage.app",
  messagingSenderId: "434427006097",
  appId: "1:434427006097:web:9a12de47806eadd3dd4330",
  measurementId: "G-W591S0C31M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);