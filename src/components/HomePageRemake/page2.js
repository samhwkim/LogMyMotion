import React, { Component } from "react";
import Carousel from "nuka-carousel";

import dashboard1 from "../../images/dashboard1.jpg";
import dashboard2 from "../../images/dashboard2.jpg";

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
        <div className="col-md-8">
          <Carousel className="carousel-container" speed={500}>
            <img src={dashboard1} />
            <img src={dashboard2} />
          </Carousel>
        </div>
        <div className="about-description">
          A workout App that tracks your progress and gives your real-time
          feedback.
        </div>
      </div>
    );
  }
}
