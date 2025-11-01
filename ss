// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDA7hBt7DP8y1CiBigZURcqHOJzRLOsruI",
  authDomain: "lanchonete-7558e.firebaseapp.com",
  databaseURL: "https://lanchonete-7558e-default-rtdb.firebaseio.com",
  projectId: "lanchonete-7558e",
  storageBucket: "lanchonete-7558e.firebasestorage.app",
  messagingSenderId: "309367170629",
  appId: "1:309367170629:web:53cfca3b26c3e66519252c",
  measurementId: "G-0P2C24PX2K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);