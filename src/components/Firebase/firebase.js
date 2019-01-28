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

  user = uid => this.db.ref(`users/${uid}`);

  users = () => this.db.ref('users');

}

export default Firebase;
