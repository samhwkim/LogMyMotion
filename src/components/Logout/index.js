import React from 'react';
import { NavItem } from "react-bootstrap";


import { withFirebase } from '../Firebase';

const LogOutButton = ({ firebase }) => (
  <NavItem eventKey={3} href="/" onClick={firebase.doSignOut}>
    Log Out
  </NavItem>
);

export default withFirebase(LogOutButton);
