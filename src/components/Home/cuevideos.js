import React, { Component } from "react";
import "../../css/cuevideos.css";

export default class CueVideos extends Component {
  render() {
    return (
      <div>
        <div className="cuevideo-container">
          <section className="cuesection1">
            <div className="cueclass">
              Cue #{this.props.cuenumber}:{" "}
              <span className="blue-accents">{this.props.cueName}</span>
            </div>
            <div className="indivcue1">
              <video
                id="cuevideo1"
                src={require(`../../Videos/${this.props.videoName1}`)}
                type="video\mp4"
                autoPlay
                loop
                muted
              />
              <div id="aboutcue1">{this.props.aboutCue1}</div>
            </div>
          </section>
          <section className="cuesection2">
            <div className="indivcue2">
              <video
                id="cuevideo2"
                src={require(`../../Videos/${this.props.videoName2}`)}
                type="video\mp4"
                autoPlay
                loop
                muted
              />
              <div id="aboutcue2">{this.props.aboutCue2}</div>
            </div>
          </section>
        </div>
      </div>
    );
  }
}
