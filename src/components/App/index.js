import React from 'react';
import { AuthUserContext } from '../Session';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Navigation from '../Navigation';
import LandingPage from '../MainPages/landingpage';
import Signup from "../MainPages/signup";
import Login from "../MainPages/login";
import Home from "../MainPages/home";
import PosenetDemo from "../MainPages/posenetdemo";
import { withAuthentication } from '../Session';
import * as ROUTES from '../../constants/routes';


const App = () => (
  <Router>
    <div>
      <Navigation />

      <hr />
      <Route exact path={ROUTES.LANDING} component={LandingPage} />
      <Route path={ROUTES.SIGN_UP} component={Signup} />
      <Route path={ROUTES.LOG_IN} component={Login} />
      <Route path={ROUTES.HOME} component={Home} />
      <Route path={ROUTES.POSENET} component={PosenetDemo} />
    </div>
  </Router>
);



export default withAuthentication(App);
