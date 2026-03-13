import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBRDCFSJl___6-r3l2FAUdqn0fQ9eVvjRU",
  authDomain: "expo-projects-f6ba3.firebaseapp.com",
  databaseURL: "https://expo-projects-f6ba3-default-rtdb.firebaseio.com",
  projectId: "expo-projects-f6ba3",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
