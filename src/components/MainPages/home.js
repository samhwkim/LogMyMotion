import React, { Component } from "react";

import Title from "../LandingPage/title";
import CueVideos from "../LandingPage/cuevideos";
import TeamMembers from "../LandingPage/abouttheteam";
import Footer from "../LandingPage/footer";
import { AuthUserContext, withAuthorization } from '../Session';



class Home extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <AuthUserContext.Consumer>
          {authUser => (
            <div>
              <h1>Account: {authUser.email}</h1>
            </div>
          )}
        </AuthUserContext.Consumer>
    );
  }
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Home);
