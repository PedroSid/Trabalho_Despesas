import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCu3QS_ZHI3WPOH734MYr2CkSy8HF2-FM4",
  authDomain: "gestao-9a560.firebaseapp.com",
  projectId: "gestao-9a560",
  storageBucket: "gestao-9a560.appspot.com",
  messagingSenderId: "588679121851",
  appId: "1:588679121851:web:d179325db87c182643129e",
  measurementId: "G-GS1T1SDGW4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };