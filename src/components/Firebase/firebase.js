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

  addWorkout = (uid, date) => this.db.ref(`users/${uid}/workoutHistory/${date}`);

  workouts = (uid, date) => this.db.ref(`users/${uid}/workoutHistory/${date}`);

  addSet = (uid, date, workoutId) => this.db.ref(`users/${uid}/workoutHistory/${date}/${workoutId}`);

  addSetScore = (uid, date, workoutId, setId) => this.db.ref(`users/${uid}/workoutHistory/${date}/${workoutId}/${setId}`);

  sets = (uid, date, workoutId) => this.db.ref(`users/${uid}/workoutHistory/${date}/${workoutId}`);

  addRep = (uid, date, set) => this.db.ref(`users/${uid}/workoutHistory/${date}/${set}`);

  addCueGrade = (uid, date, set, rep) => this.db.ref(`users/${uid}/workoutHistory/${date}/${set}`);

}

export default Firebase;
