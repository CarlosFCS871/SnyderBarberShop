import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // <- Agregamos esto

export const firebaseConfig = {
  apiKey: "AIzaSyAqMXqCDyYYeGjzkVUAewZfrDQ_B5LVBac",
  authDomain: "snyder-barber.firebaseapp.com",
  projectId: "snyder-barber",
  storageBucket: "snyder-barber.firebasestorage.app",
  messagingSenderId: "434427006097",
  appId: "1:434427006097:web:9a12de47806eadd3dd4330",
  measurementId: "G-W591S0C31M"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Exportamos los servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // <- Y exportamos esto

export default app;