import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


const firebaseConfig = {
  apiKey: "AIzaSyCN3MXnrP004V1W73TVTjjImz0jr4oyijk",
  authDomain: "bowlbuddy-73f9d.firebaseapp.com",
  projectId: "bowlbuddy-73f9d",
  storageBucket: "bowlbuddy-73f9d.firebasestorage.app",
  messagingSenderId: "603991238252",
  appId: "1:603991238252:web:f32a76a30a36bfa1b61a49"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
