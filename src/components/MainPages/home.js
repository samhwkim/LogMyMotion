import React, { Component } from "react";

import Title from "../Home/title";
//import MainDemo from "../Home/maindemo";
import CueVideos from "../Home/cuevideos";
import TeamMembers from "../Home/abouttheteam";
import Footer from "../Home/footer";
import "../../css/home.css";

export default class Home extends Component {
  render() {
    return (
      <div>
        <Title />
        {/*<div className="mainvideoclass">Demo</div>
        <MainDemo />*/}
        <CueVideos
          cuenumber="1"
          cueName={"Squat Depth"}
          videoName1={"squat_deep.mp4"}
          videoName2={"squat_not_deep.mp4"}
          aboutCue1={"It's important to have proper depth when performing squats. Doing so not only ensures that you're properly training the entire lower body musculature, but also indicates that you have excellent overall movement. By performing deep squats, you'll be properly training all the muscle groups (glutes, hamstrings, and quads), improving your posture, making your knees stronger, and training your muscles to be more explosive. This is greatly beneficial to both experienced athletes and individuals looking to stay in shape."}
          aboutCue2={"If you're not going low enough when squatting, you're most likely not getting the most out of the exercise. In addition, if you're unable to perform deep squats, it might indicate that you have mobility, stability, or technique issues. This is fine; not everyone starts out being able to perform exercises properly. If this is the case for you, try stretching your lower body before squatting. Start with no weights and just focus on your form and your depth. After some time, you'll gradually notice an improvement in your overall form."}
        />
        <CueVideos
          cuenumber="2"
          cueName={"Shoulder Alignment"}
          videoName1={"shoulders_aligned.mp4"}
          videoName2={"shoulders_misaligned_left.mp4"}
          aboutCue1={"Something about Shoulder Alignment 1."}
          aboutCue2={"If you're not going low enough when squatting, you're most likely not getting the most out of the exercise. In addition, if you're unable to perform deep squats, it might indicate that you have mobility, stability, or technique issues. This is fine; not everyone starts out being able to perform exercises properly. If this is the case for you, try stretching your lower body before squatting. Start with no weights and just focus on your form and your depth. After some time, you'll gradually notice an improvement in your overall form."}
        />
        <CueVideos
          cuenumber="3"
          cueName={"Feet Width"}
          videoName1={"good_width.mp4"}
          videoName2={"bad_width_wide.mp4"}
          aboutCue1={"Something about Feet Width 1."}
          aboutCue2={"If you're not going low enough when squatting, you're most likely not getting the most out of the exercise. In addition, if you're unable to perform deep squats, it might indicate that you have mobility, stability, or technique issues. This is fine; not everyone starts out being able to perform exercises properly. If this is the case for you, try stretching your lower body before squatting. Start with no weights and just focus on your form and your depth. After some time, you'll gradually notice an improvement in your overall form."}
        />
        <div className="teamclass">Team Members</div>
        <TeamMembers />
        <Footer />
      </div>
    );
  }
}
