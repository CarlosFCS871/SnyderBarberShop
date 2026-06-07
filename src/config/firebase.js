import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

/*import { initializeApp } from "firebase/app";
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
*/