import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "studio-587186531-f420f",
  appId: "1:152835950010:web:179e359b4d92ad9ffec983",
  storageBucket: "studio-587186531-f420f.firebasestorage.app",
  apiKey: "AIzaSyD0oAxqQZ8A0elMr_D3-MAxiiD8kMDHQU4",
  authDomain: "studio-587186531-f420f.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "152835950010"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
