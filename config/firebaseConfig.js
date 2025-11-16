// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB6tFVNRheR1ob2AE0fJQFrSrlbIRYfM4s",
  authDomain: "chat-76f28.firebaseapp.com",
  databaseURL: "https://chat-76f28-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chat-76f28",
  storageBucket: "chat-76f28.firebasestorage.app",
  messagingSenderId: "410481049293",
  appId: "1:410481049293:web:3d8d81583da233d5dc3384",
  measurementId: "G-VSQ659Q4Y6"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);