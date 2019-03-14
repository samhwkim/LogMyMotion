import React, { Component } from "react";
import Typist from "react-typist";
import "./page1.css";

export default class page1 extends Component {
  render() {
    return (
      <div className="title-container">
        <div className="main-title">
          <Typist
            avgTypingSpeed={50}
            cursor={{
              show: true,
              blink: true,
              hideWhenDone: true,
              hideWhenDoneDelay: 0
            }}
          >
            <div className="title-text">
              LogMy<span className="blue-accents">Motion</span>
            </div>
            <div className="title-tagline">
              <Typist.Delay ms={1000} />
              <span>Your Personal Virtual Trainer</span>
            </div>
          </Typist>
          <div className="link-container">
            <span className="login-text">
              <a className="login-link" href="/login">
                Login
              </a>
            </span>
            <a className="signup-link" href="/signup">
              Sign Up
            </a>
          </div>
        </div>
      </div>
    );
  }
}
