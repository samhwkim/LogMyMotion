import React, { Component } from "react";

import "../../css/maindemo.css";
import squatdepth from "../../Videos/squat_deep.mp4";

export default class MainDemo extends Component {
  render() {
    return (
      <div>
        <div className="mainvideo-container">
          <video
            id="mainvideosquat"
            src={squatdepth}
            type="video\mp4"
            autoPlay
            loop
            muted
          />
          <div className="videocueinfo">
            <div id="video-info-SD">Squat Depth:</div>
            <div id="SD-good">Good </div>
            <div id="video-info-SA">Shoulder Alignment:</div>
            <div id="SA-good">Good </div>
            <div id="video-info-FW">Feet Width:</div>
            <div id="FW-good">Good </div>
          </div>
        </div>
      </div>
    );
  }
}
