import React from 'react';

import AuthUserContext from './context';
import { withFirebase } from '../Firebase';

const withAuthentication = Component => {
  class WithAuthentication extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        authUser: null,
      };
    }

    componentDidMount() {
      console.log("withAuthentication");
      this.listener = this.props.firebase.auth.onAuthStateChanged(
        authUser => {
          authUser
            ? this.setState({ authUser })
            : this.setState({ authUser: null });
        },
      );
    }

    componentWillUnmount() {
      this.listener();
    }

    render() {
      let alwaysRender = false;
      if (window.location.pathname === "/" || window.location.pathname === "/login" || window.location.pathname === "/signup") {
        alwaysRender = true;
      }

      if (alwaysRender === true) {
        return (
          <AuthUserContext.Provider value={this.state.authUser}>
            {<Component {...this.props} />}
          </AuthUserContext.Provider>
        );
      } else {
        return (
          <AuthUserContext.Provider value={this.state.authUser}>
            {this.state.authUser ? <Component {...this.props} /> : null}
          </AuthUserContext.Provider>
        );
      }
    }
  }

  return withFirebase(WithAuthentication);
};

export default withAuthentication;
