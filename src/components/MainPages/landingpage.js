import React, { Component } from "react";

import Title from "../LandingPage/title";
//import MainDemo from "../Home/maindemo";
import CueVideos from "../LandingPage/cuevideos";
import TeamMembers from "../LandingPage/abouttheteam";
import Footer from "../LandingPage/footer";
import "../../css/landingpage.css";
import Home from "./home";

export default class LandingPage extends Component {
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
          aboutCue1={
            "It's important to have proper depth when performing squats. Doing so not only ensures that you're properly training the entire lower body musculature, but also indicates that you have excellent overall movement. By performing deep squats, you'll be properly training all the muscle groups (glutes, hamstrings, and quads), improving your posture, making your knees stronger, and training your muscles to be more explosive. This is greatly beneficial to both experienced athletes and individuals looking to stay in shape."
          }
          aboutCue2={
            "If you're not going low enough when squatting, you're most likely not getting the most out of the exercise. In addition, if you're unable to perform deep squats, it might indicate that you have mobility, stability, or technique issues. This is fine; not everyone starts out being able to perform exercises properly. If this is the case for you, try stretching your lower body before squatting. Start with no weights and just focus on your form and your depth. After some time, you'll gradually notice an improvement in your overall form."
          }
        />
        <CueVideos
          cuenumber="2"
          cueName={"Shoulder Alignment"}
          videoName1={"shoulders_aligned.mp4"}
          videoName2={"shoulders_misaligned_left.mp4"}
          aboutCue1={
            "When performing a squat, make sure that your shoulders stay aligned and that you're not leaning too much to one side. This is especially important if you're squatting with a barbell, as it ensures that your weights don't fall off."
          }
          aboutCue2={
            "Failure to keep shoulders aligned while squatting can result in serious injury if squatting with a barbell. Leaning even a tiny bit towards one side can cause you to lose balance and lose control of both yourself and the barbell. To avoid this, make sure that you have the same amount of weight on each side of the bar, and that you're squatting evenly."
          }
        />
        <CueVideos
          cuenumber="3"
          cueName={"Feet Width"}
          videoName1={"good_width.mp4"}
          videoName2={"bad_width_wide.mp4"}
          aboutCue1={
            "Before starting your set, make sure that your feet are about shoulder-width apart. By having proper feet width, you'll be able to squat lower and have better control of your motion. This is because the weight is more spread out not just concentrated in one area."
          }
          aboutCue2={
            "Placing your feet too close together or too far apart can also result in serious injury and will definitely result in improper form. If your feet are too close together, you won't be able to squat deep enough or have your knees properly angled. Placing your feet too far apart will result in you having less control of your movement and will cause you to not optimally work all the targeted muscles."
          }
        />
        <div className="teamclass">Team Members</div>
        <TeamMembers />
        <Footer />
      </div>
    );
  }
}
