import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBFH58ET8HxhwNddsGWoKenRtMyC19XAqo",
    authDomain: "personal-warehouse-68e63.firebaseapp.com",
    projectId: "personal-warehouse-68e63",
    storageBucket: "personal-warehouse-68e63.firebasestorage.app",
    messagingSenderId: "821726538618",
    appId: "1:821726538618:web:c3f2e2f6735295d0fdc4c3",
    measurementId: "G-VBYJ7W0DVF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
// Initialize Firestore with persistent cache (Offline support)
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
