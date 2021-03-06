import { initializeApp } from "firebase/app";
import {
  getFirestore,
  query,
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import {
  getDatabase,
  onDisconnect,
  onValue,
  ref,
  update,
} from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getPrompt } from "./prompt";

const firebaseConfig = {
  apiKey: "AIzaSyDryRbxD236gxgz3nhJxpb7YuSBnTQbYNk",
  authDomain: "space-city-hacks.firebaseapp.com",
  projectId: "space-city-hacks",
  storageBucket: "space-city-hacks.appspot.com",
  messagingSenderId: "45106253308",
  appId: "1:45106253308:web:352c828e9b3296f6b67679",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const realtime = getDatabase();
const gamesRef = collection(db, "games");
const onlineRef = collection(db, "online");

export const authenticateAnonymously = () => {
  return signInAnonymously(getAuth(app));
};

export const online = (uid) => {
  return onDisconnect(ref(realtime, "users/" + uid))
    .update({ online: false })
    .then(() =>
      update(ref(realtime, "users/" + uid), {
        online: true,
      })
    );
};

export const setUserOnline = (uid) => {
  return setDoc(doc(onlineRef, uid), { timeStamp: serverTimestamp() });
};

export const trackUser = (uid, callback) => {
  return onValue(ref(realtime, "users/" + uid), (snapshot) => {
    callback(snapshot.val());
  });
};

export const getOnline = (callback) => {
  return onValue(ref(realtime, "users"), (snapshot) => {
    if (snapshot.exists) {
      let snap = snapshot.val();
      let users = Object.keys(snap);
      callback(users.filter((i) => snap[i].online));
    } else {
      callback([]);
    }
  });
};

export const createGame = (players, i, rounds) => {
  let prompt = getPrompt(); //will be replaced with actual prompt generator

  return addDoc(gamesRef, {
    prompts: [prompt],
    code: [],
    players,
    index: i,
    rounds,
  });
};

export const setUserGame = (uid, gameID) => {
  return update(ref(realtime, "users/" + uid), { game: gameID });
};

export const setUsersGame = (uids, gameID) => {
  let promises = uids.map((uid) => setUserGame(uid, gameID));
  return Promise.all(promises);
};

export const getGameListener = (callback) => {
  const q = query(gamesRef);
  return onSnapshot(q, callback);
};

export const updateGame = (id, data) => {
  delete data.id;
  return updateDoc(doc(gamesRef, id), data);
};

export const resetGame = (games) => {
  let promises = games.map((x) => deleteDoc(doc(gamesRef, x.id)));

  return Promise.all(promises);
};
