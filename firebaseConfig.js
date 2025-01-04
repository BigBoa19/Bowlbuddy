// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCN3MXnrP004V1W73TVTjjImz0jr4oyijk",
  authDomain: "bowlbuddy-73f9d.firebaseapp.com",
  projectId: "bowlbuddy-73f9d",
  storageBucket: "bowlbuddy-73f9d.firebasestorage.app",
  messagingSenderId: "603991238252",
  appId: "1:603991238252:web:f32a76a30a36bfa1b61a49"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
//IOS: 686553870661-e1s26teaahepleu253tmsa8tkmcume1q.apps.googleusercontent.com
//AND: 686553870661-4n04cavoeg33jsftm084k769tvhecf3n.apps.googleusercontent.com
