import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, setLogLevel } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCAEpgsGYDAylUk6zsPCLs1pYWP_GEw3O0",
    authDomain: "fruitopia-1bba8.firebaseapp.com",
    projectId: "fruitopia-1bba8",
    storageBucket: "fruitopia-1bba8.firebasestorage.app",
    messagingSenderId: "440594841174",
    appId: "1:440594841174:web:5ae7700eb650ae212e85f7",
    measurementId: "G-BTS1B9QSB3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable detailed logs to debug why we are stuck in "Pending Writes"
// setLogLevel('debug');

export default app;
