import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0oAxqQZ8A0elMr_D3-MAxiiD8kMDHQU4",
  authDomain: "studio-587186531-f420f.web.app",
  projectId: "studio-587186531-f420f",
  storageBucket: "studio-587186531-f420f.appspot.com",
  messagingSenderId: "152835950010",
  appId: "1:152835950010:web:179e359b4d92ad9ffec983"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

export { auth, storage };
