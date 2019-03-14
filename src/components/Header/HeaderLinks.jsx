import React, { Component } from "react";
import {
  Navbar,
  Nav,
  NavItem,
  NavDropdown,
  MenuItem,
  FormGroup,
  FormControl,
  InputGroup
} from "react-bootstrap";

import LogOutButton from '../Logout';

class HeaderLinks extends Component {
  render() {
    return (
      <div>
        <Nav pullRight>
          <NavItem eventKey={3} href="#">
          </NavItem>

          <LogOutButton />
        </Nav>
      </div>
    );
  }
}
export default HeaderLinks;
