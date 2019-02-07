import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';


const config = {
  apiKey: "AIzaSyDQ-I5WQ38dLbX7wXBxjctB3qHNsZU2Vco",
  authDomain: "logmymotion.firebaseapp.com",
  databaseURL: "https://logmymotion.firebaseio.com",
  projectId: "logmymotion",
  storageBucket: "logmymotion.appspot.com",
  messagingSenderId: "107943580451"
};

class Firebase {
  constructor() {
    app.initializeApp(config);
    this.auth = app.auth();
    this.db = app.database();
  }

  // *** Auth API ***

  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignOut = () => this.auth.signOut();

  // *** User API ***

  user = uid => this.db.ref(`users/${uid}/userInfo`);

  users = () => this.db.ref('users');

  getCurrentUserUid = () => this.auth.currentUser.uid;

  // *** Workout API ***

  addSet = (uid, date) => this.db.ref(`users/${uid}/workoutHistory/${date}`);

  addSetScore = (uid, date, setId) => this.db.ref(`users/${uid}/workoutHistory/${date}/${setId}`);

  sets = (uid, date) => this.db.ref(`users/${uid}/workoutHistory/${date}`);

  addRep = (uid, date, set) => this.db.ref(`users/${uid}/workoutHistory/${date}/${set}`);

  addCueGrade = (uid, date, set, rep) => this.db.ref(`users/${uid}/workoutHistory/${date}/${set}`);

  workout = (uid) => this.db.ref(`users/${uid}/workoutHistory`);

  workouts = () => this.db.ref('workouts');

}

export default Firebase;
