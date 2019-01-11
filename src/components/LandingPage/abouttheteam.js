import React, { Component } from "react";
import "../../css/abouttheteam.css";

import sam from "../../images/sKim.png";
import yam from "../../images/yam.png";
import eric from "../../images/eFriela.png";
import arvan from "../../images/aDas.png";
import ethan from "../../images/eSu.png";

export default class AboutTheTeam extends Component {
  render() {
    return (
      <div className="team-container">
        <figure id="teamrow1">
          <img
            id="memberpic"
            src={sam}
            alt="sam"
            width="250px"
            height="250px"
          />
          <figcaption id="memberinfo">Sam Kim - Team Lead</figcaption>
        </figure>
        <figure id="teamrow1">
          <img
            id="memberpic"
            src={yam}
            alt="yam"
            width="250px"
            height="250px"
          />
          <figcaption id="memberinfo">Nikhil Patil - Scribe</figcaption>
        </figure>
        <figure id="teamrow1">
          <img
            id="memberpic"
            src={eric}
            alt="eric"
            width="250px"
            height="250px"
          />
          <figcaption id="memberinfo">Eric Freilafert</figcaption>
        </figure>
        <figure>
          <img
            id="memberpic1"
            src={arvan}
            alt="arvan"
            width="250px"
            height="250px"
          />{" "}
          <figcaption id="memberinfo">Arvan Das</figcaption>
        </figure>
        <figure>
          <img
            id="memberpic1"
            src={ethan}
            alt="ethan"
            width="250px"
            height="250px"
          />
          <figcaption id="memberinfo">Ethan Su</figcaption>
        </figure>
      </div>
    );
  }
}
