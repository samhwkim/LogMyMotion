import React, { Component } from "react";
import { Row, Col } from "react-bootstrap";

import firebasePic from "../../images/firebase.png";
import gcpPic from "../../images/gcp.png";
import reactPic from "../../images/react.png";
import tfPic from "../../images/tensorflow.png";

import sam from "../../images/sKim.png";
import yam from "../../images/yam.png";
import eric from "../../images/eFriela.png";
import arvan from "../../images/aDas.png";
import ethan from "../../images/esu.jpg";

import "./page3.css";

export default class Page3 extends Component {
  render() {
    return (
      <div className="tech-container">
        <div className="col-sm-10 col-sm-offset-2 col-xs-12">
          <div className="tech-title">
            Built With <span className="blue-accents">...</span>
          </div>
        </div>
        <div className="techused">
          <img src={reactPic} width="150px" height="150px" hspace="25" />
          <img src={firebasePic} width="150px" height="150px" hspace="25" />
          <img src={gcpPic} width="150px" height="150px" hspace="25" />
          <img src={tfPic} width="150px" height="150px" hspace="25" />
        </div>
        <div className="col-sm-10 col-sm-offset-2 col-xs-12">
          <div className="tech-people">
            Built By <span className="blue-accents">...</span>
          </div>
        </div>
        <div className="peoplePics">
          <img src={sam} width="175px" height="175px" hspace="20" />
          <img src={yam} width="175px" height="175px" hspace="20" />
          <img src={eric} width="175px" height="175px" hspace="20" />
          <img src={arvan} width="175px" height="175px" hspace="20" />
          <img src={ethan} width="175px" height="175px" hspace="20" />
        </div>
      </div>
    );
  }
}
