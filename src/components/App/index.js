import React from 'react';
import { AuthUserContext } from '../Session';
import { BrowserRouter as Router, Route, Switch, HashRouter } from 'react-router-dom';

import LandingPage from '../MainPages/landingpage';
import Signup from "../../layouts/Pages/Pages.jsx";
import Login from "../../layouts/Pages/Pages.jsx";
import PosenetDemo from "../MainPages/posenetdemo";
import Dashboard from "../../layouts/Dashboard/Dashboard.jsx";
import WorkoutCalendar from "../../layouts/WorkoutCalendar/WorkoutCalendar.jsx";
import { withAuthentication } from '../Session';
import indexRoutes from "../../constants/index.jsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/css/animate.min.css";
import "../../assets/sass/light-bootstrap-dashboard.css?v=1.2.0";
import "../../assets/css/demo.css";
import "../../assets/css/pe-icon-7-stroke.css";

const App = () => (
  <Router>
    <Switch>
      {indexRoutes.map((prop, key) => {
        return <Route exact path={prop.path} component={prop.component} key={key} />;
      })}
    </Switch>
  </Router>
);

export default withAuthentication(App);
