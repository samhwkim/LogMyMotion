import React from 'react';
import { AuthUserContext } from '../Session';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Navigation from '../Navigation';
import LandingPage from '../MainPages/landingpage';
import Signup from "../MainPages/signup";
import Login from "../MainPages/login";
import PosenetDemo from "../MainPages/posenetdemo";
import Dashboard from "../../layouts/Dashboard/Dashboard.jsx";
import { withAuthentication } from '../Session';
import * as ROUTES from '../../constants/routes';

import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/css/animate.min.css";
import "../../assets/sass/light-bootstrap-dashboard.css?v=1.2.0";
import "../../assets/css/demo.css";
import "../../assets/css/pe-icon-7-stroke.css";
import TableList from "../../views/TableList/TableList";


const App = () => (
  <Router>
    <div>
      <Route exact path={ROUTES.LANDING} component={LandingPage} />
      <Route path={ROUTES.SIGN_UP} component={Signup} />
      <Route path={ROUTES.LOG_IN} component={Login} />
      <Route path={ROUTES.HOME} component={Dashboard} />
      <Route path={ROUTES.POSENET} component={PosenetDemo} />
      <Route path={ROUTES.ANALYZER} component={PosenetDemo} />
      <Route path={ROUTES.LOG} component={TableList} />
    </div>
  </Router>
);



export default withAuthentication(App);
