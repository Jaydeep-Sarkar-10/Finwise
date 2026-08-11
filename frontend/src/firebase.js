// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCM6h9KRPPdi2sb0a-j2lAdlJ6WpLAUkyU",
  authDomain: "finwise-3a529.firebaseapp.com",
  projectId: "finwise-3a529",
  storageBucket: "finwise-3a529.firebasestorage.app",
  messagingSenderId: "1005248332718",
  appId: "1:1005248332718:web:85cbc1f75cb5e46f00fe3f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;