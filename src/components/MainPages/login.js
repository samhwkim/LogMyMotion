import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { SignUpLink } from './signup';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';


const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
};

const LoginPage = () => (
  <div>
    <h1>Login</h1>
    <LoginForm />
    <SignUpLink />
  </div>
);


class LoginBase extends Component {
  constructor(props) {
    super(props);
    this.login = this.login.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {...INITIAL_STATE};
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  login(e) {
    e.preventDefault();
    this.props.firebase.doSignInWithEmailAndPassword(this.state.email, this.state.password).then((u)=>{
      this.setState({ ...INITIAL_STATE });
      this.props.history.push("/home");
    })
    .catch((error) => {
      console.log(error);
      this.setState({error});
    });
  }

  render() {
    const isInvalid = this.state.password === '' || this.state.email === '';

    return (
       <div className="col-md-6">
         <form>
           <div class="form-group">
             <label for="exampleInputEmail1">Email address</label>
             <input value={this.state.email} onChange={this.handleChange} type="email" name="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" />
             <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
           </div>
           <div class="form-group">
             <label for="exampleInputPassword1">Password</label>
             <input value={this.state.password} onChange={this.handleChange} type="password" name="password" class="form-control" id="exampleInputPassword1" placeholder="Password" />
           </div>
           <button type="submit" onClick={this.login} class="btn btn-primary" disabled={isInvalid}>Login</button>
           {this.state.error && <p>{this.state.error.message}</p>}
         </form>
       </div>
    );
  }
}

const LoginForm = compose(
  withRouter,
  withFirebase,
)(LoginBase);


export default LoginPage;
export { LoginForm };
