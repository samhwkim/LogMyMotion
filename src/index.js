import React from "react";
import ReactDOM from "react-dom";
import './index.css';
import App from './components/App';
import 'bootstrap/dist/css/bootstrap.css';
import "./assets/css/animate.min.css";
import "./assets/sass/light-bootstrap-dashboard.css?v=1.2.0";
import "./assets/css/demo.css";
import "./assets/css/pe-icon-7-stroke.css";
import 'font-awesome/css/font-awesome.min.css';
import Firebase, { FirebaseContext } from './components/Firebase';


ReactDOM.render(
    <FirebaseContext.Provider value={new Firebase()}>
      <App />
    </FirebaseContext.Provider>,
  document.getElementById('root'),
);
