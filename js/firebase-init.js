const firebaseConfig = {
  apiKey: "AIzaSyB2YOMV9GkWEaGmAz83VIy9GWTkY_WOVvc",
  authDomain: "delicias-de-amor-f53d3.firebaseapp.com",
  databaseURL: "https://delicias-de-amor-f53d3-default-rtdb.firebaseio.com",
  projectId: "delicias-de-amor-f53d3",
  storageBucket: "delicias-de-amor-f53d3.appspot.com",
  messagingSenderId: "283526719486",
  appId: "1:283526719486:web:d702a4969a43fc320302af",
  measurementId: "G-TY9N2WK17W"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();