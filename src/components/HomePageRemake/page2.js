import React, { Component } from "react";
import Carousel from "nuka-carousel";

import eye from "../../images/eye.png";
import cross from "../../images/redCross.png";
import graph from "../../images/graph.png";

import "./page2.css";

export default class Page2 extends Component {
  render() {
    return (
      <div className="about-container">
        <div className="about-title">
          What is LogMy
          <span className="blue-accents">
            <span className="black-underline">Motion</span>
          </span>
          ?
        </div>
        <div className="imageicon-container">
          <div className="eyeImage">
            <img src={eye} width="125px" height="125px" />
            <div className="eyeAbout">
              Real-Time Audio Feedback While You Are Working Out.
            </div>
          </div>
          <br />
          <div className="crossImage">
            <img src={cross} width="125px" height="125px" />
            <div className="crossAbout">
              Prevents Injuries By Analyzing Your Workout Form.
            </div>
          </div>
          <br />
          <div className-="graphImage">
            <img src={graph} width="125px" height="125px" />
            <div className="graphAbout">
              Tracks Your Progress and Provides Analytics.
            </div>
          </div>
        </div>
      </div>
    );
  }
}
