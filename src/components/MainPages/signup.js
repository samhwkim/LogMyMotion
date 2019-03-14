import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { FirebaseContext, withFirebase } from '../Firebase';
import { compose } from 'recompose';
import * as ROUTES from '../../constants/routes';




const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
};

const SignUpPage = () => (
  <div>
    <h1>SignUp</h1>
    <Signup />
  </div>
);

class SignupBase extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.signup = this.signup.bind(this);
    this.state = { ...INITIAL_STATE };
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  signup(e){
    const {email, password} = this.state;
    e.preventDefault();
    this.props.firebase.doCreateUserWithEmailAndPassword(this.state.email, this.state.password)
    .then(authUser => {
      // Creates a user in the Firebase database
      return this.props.firebase.user(authUser.user.uid).set({
        email,
        password,
      });
    })
    .then((u)=> {
    }).then((u)=> {
      console.log(u);
      this.setState({...INITIAL_STATE});
      this.props.history.push(ROUTES.HOME);
    })
    .catch((error) => {
      console.log(error);
      this.setState({error});
    });
  }

  render() {
    const isInvalid =
    this.state.password === '' ||
    this.state.email === '';

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
         <button onClick={this.signup} style={{marginLeft: '25px'}} className="btn btn-success" disabled={isInvalid}>Sign up</button>
         {this.state.error && <p>{this.state.error.message}</p>}
      </form>
    </div>
    );
  }
}

const SignUpLink = () => (
  <p>
    Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
  </p>
);

const Signup = withRouter(withFirebase(SignupBase));

const SignUpForm = compose(
  withRouter,
  withFirebase,
)(SignupBase);

export default SignUpPage;
export { Signup, SignUpLink };
