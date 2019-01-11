import React, { Component } from "react";
import "../../css/title.css";
export default class title extends Component {
  render() {
    return (
      <div>
        <section className="titlesection">
          <div id="LMMtitle">
            LogMy
            <span className="blue-accents">
              <span className="purple-underline">
                <span className="titleshadow">Motion</span>
              </span>
            </span>
          </div>
        </section>
        <section className="groupmembers">
          <div id="pll"> by Pretty Little Leetcoders</div>
        </section>
        <section className="trynowsection">
          <div className="trynowtext">
            <a className="trynowlink" href="/posenetdemo">
              Try Now!
            </a>
            <a className="trynowlink" href="/login">
              Log in
            </a>
            <a className="trynowlink" href="/signup">
              Sign Up
            </a>
          </div>
        </section>
      </div>
    );
  }
}
