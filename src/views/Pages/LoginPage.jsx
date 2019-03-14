import React, { Component } from "react";
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { withFirebase } from '../../components/Firebase';

import {
  Grid,
  Row,
  Col,
  FormGroup,
  ControlLabel,
  FormControl
} from "react-bootstrap";

import Card from "../../components/Card/Card.jsx";

import Button from "../../components/CustomButton/CustomButton.jsx";
import Checkbox from "../../components/CustomCheckbox/CustomCheckbox.jsx";

class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.login = this.login.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      cardHidden: true,
      email: '',
      password: '',
      error: null,
    };
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  login(e) {
    e.preventDefault();
    this.props.firebase.doSignInWithEmailAndPassword(this.state.email, this.state.password).then((u)=>{
      // this.setState({ ...INITIAL_STATE });
      this.props.history.push("/home");
    })
    .catch((error) => {
      console.log(error);
      this.setState({error});
    });
  }


  componentDidMount() {
    setTimeout(
      function() {
        this.setState({ cardHidden: false });
      }.bind(this),
      700
    );
  }
  render() {
    const isInvalid = this.state.password === '' || this.state.email === '';

    return (
      <Grid>
        <Row>
          <Col md={4} sm={6} mdOffset={4} smOffset={3}>
            <form>
              <Card
                hidden={this.state.cardHidden}
                textCenter
                title="Login"
                content={
                  <div>
                    <FormGroup>
                      <ControlLabel>Email address</ControlLabel>
                      <FormControl placeholder="Enter email" type="email" onChange={this.handleChange} value={this.state.email} name="email" />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>Password</ControlLabel>
                      <FormControl placeholder="Password" type="password" value={this.state.password} onChange={this.handleChange} name="password" />
                    </FormGroup>
                  </div>
                }
                legend={
                  <Button bsStyle="info" fill wd disabled={isInvalid} onClick={this.login}>
                    Login
                  </Button>
                }
                ftTextCenter
              />
            </form>
          </Col>
        </Row>
      </Grid>
    );
  }
}

const LoginForm = compose(
  withRouter,
  withFirebase,
)(LoginPage);

export default LoginForm;
