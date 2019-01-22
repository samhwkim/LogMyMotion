import * as posenet from "@tensorflow-models/posenet";
import * as React from "react";
import { isMobile, drawKeypoints, drawSkeleton } from "./utils";

import { analyzeSquatDepth } from "./squat_depth_cue";
import { analyzeFeetWidth } from "./feet_width_cue";
import { analyzeShoulderAlignment } from "./shoulder_align_cue";
import { drawShoulderAlignmentLines } from "./utils";
import { drawSquatDepthLine } from "./utils";
import "../../css/posenet.css";

let shouldersSet = false;
let feetSet = false;
let calibrationConfidenceLevel = 0;
let calibrationComplete = false;
let goodDepth = false;
let startedRep = false;
let goodRepCounter = 0;
let badRepCounter = 0;
//let goodCounter = 0;
//let badCounter = 0;

let startingLeftHipX = [];
let startingLeftHipY = [];
let startingRightHipX = [];
let startingRightHipY = [];
let startingLeftShoulderX = [];
let startingRightShoulderX = [];
let startingLeftKneeY = [];

let startingAvgLeftHipX = 0;
let startingAvgLeftHipY = 0;
let startingAvgRightHipX = 0;
let startingAvgRightHipY = 0;
let startingAvgLeftShoulderX = 0;
let startingAvgRightShoulderX = 0;
let startingAvgLeftKneeY = 0;

let distanceLeftHipFromStarting = 0;
let distanceRightHipFromStarting = 0;

function distanceFormula(x1, y1, x2, y2) {
  var result = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
  return result;
}

export default class PoseNet extends React.Component {
  static defaultProps = {
    videoWidth: 600,
    videoHeight: 400,
    flipHorizontal: false,
    algorithm: "single-pose",
    mobileNetArchitecture: isMobile() ? 0.5 : 1.01,
    showVideo: true,
    showSkeleton: true,
    showPoints: true,
    minPoseConfidence: 0.5,
    minPartConfidence: 0.5,
    maxPoseDetections: 1,
    nmsRadius: 20.0,
    outputStride: 16,
    imageScaleFactor: 0.5,
    skeletonColor: "aqua",
    skeletonLineWidth: 2,
    loadingText: "Loading pose detector..."
  };

  constructor(props) {
    super(props, PoseNet.defaultProps);
    this.state = {
      loading: true,
      backgroundcolorSA: "red",
      backgroundcolorSD: "red",
      backgroundcolorFW: "red",
      calibrationState: "Calibrating",
      goodCounter: 0,
      badCounter: 0
    };
  }

  onChangeSA(inputEntry) {
    if (inputEntry) {
      this.setState({ backgroundcolorSA: "green" });
    } else {
      this.setState({ backgroundcolorSA: "red" });
    }
  }
  onChangeSD(inputEntry) {
    if (inputEntry == "good") {
      this.setState({ backgroundcolorSD: "green" });
    } else if(inputEntry == "okay") {
      this.setState({backgroundcolorSD: "yellow"});
    } else if(inputEntry == "bad") {
      this.setState({ backgroundcolorSD: "red" });
    }
  }
  onChangeFW(inputEntry) {
    if (inputEntry) {
      this.setState({ backgroundcolorFW: "green" });
    } else {
      this.setState({ backgroundcolorFW: "red" });
    }
  }

  onChangeGoodRep(inputEntry) {
    if (inputEntry) {
      this.setState({ goodCounter: this.state.goodCounter + 1 });
    }
  }

  onChangeBadRep(inputEntry) {
    if (inputEntry) {
      this.setState({ badCounter: this.state.badCounter + 1 });
    }
  }

  onChangeCalibrationState(inputEntry) {
    if (inputEntry) {
      this.setState({ calibrationState: "Calibration Complete" });
    }
  }
  getCanvas = elem => {
    this.canvas = elem;
  };

  getVideo = elem => {
    this.video = elem;
  };

  async componentWillMount() {
    // Loads the pre-trained PoseNet model
    this.net = await posenet.load(this.props.mobileNetArchitecture);
  }

  async componentDidMount() {
    try {
      await this.setupCamera();
    } catch (e) {
      throw "This browser does not support video capture, or this device does not have a camera";
    } finally {
      this.setState({ loading: false });
    }

    this.detectPose();
  }

  async setupCamera() {
    // MDN: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw "Browser API navigator.mediaDevices.getUserMedia not available";
    }

    const { videoWidth, videoHeight } = this.props;
    const video = this.video;
    const mobile = isMobile();

    video.width = videoWidth;
    video.height = videoHeight;

    // MDN: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: "user",
        width: mobile ? void 0 : videoWidth,
        height: mobile ? void 0 : videoHeight
      }
    });

    video.srcObject = stream;

    return new Promise(resolve => {
      video.onloadedmetadata = () => {
        // Once the video metadata is ready, we can start streaming video
        video.play();
        resolve(video);
      };
    });
  }

  detectPose() {
    const { videoWidth, videoHeight } = this.props;
    const canvas = this.canvas;
    const ctx = canvas.getContext("2d");

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    this.poseDetectionFrame(ctx);
  }

  poseDetectionFrame(ctx) {
    const {
      algorithm,
      imageScaleFactor,
      flipHorizontal,
      outputStride,
      minPoseConfidence,
      maxPoseDetections,
      minPartConfidence,
      nmsRadius,
      videoWidth,
      videoHeight,
      showVideo,
      showPoints,
      showSkeleton,
      skeletonColor,
      skeletonLineWidth
    } = this.props;

    const net = this.net;
    const video = this.video;

    const poseDetectionFrameInner = async () => {
      let poses = [];

      switch (algorithm) {
        case "single-pose":
          const pose = await net.estimateSinglePose(
            video,
            imageScaleFactor,
            flipHorizontal,
            outputStride
          );

          poses.push(pose);

          break;
        case "multi-pose":
          poses = await net.estimateMultiplePoses(
            video,
            imageScaleFactor,
            flipHorizontal,
            outputStride,
            maxPoseDetections,
            minPartConfidence,
            nmsRadius
          );

          break;
        default:
          const defaultPose = await net.estimateSinglePose(
            video,
            imageScaleFactor,
            flipHorizontal,
            outputStride
          );

          poses.push(defaultPose);
          break;
      }

      ctx.clearRect(0, 0, videoWidth, videoHeight);
      //console.log(ctx);
      // if (showVideo) {
      //   ctx.save();
      //   ctx.scale(-1, 1);
      //   ctx.translate(-videoWidth, 0);
      //   ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
      //   ctx.restore();
      // }

      // For each pose (i.e. person) detected in an image, loop through the poses
      // and draw the resulting skeleton and keypoints if over certain confidence
      // scores

      poses.forEach(({ score, keypoints }) => {
        if (score >= minPoseConfidence) {
          if (!calibrationComplete) {
            if (analyzeFeetWidth(keypoints)) {
              this.onChangeFW(true);
              feetSet = true;
            } else {
              this.onChangeFW(false);
              feetSet = false;
            }

            if (analyzeShoulderAlignment(keypoints)) {
              this.onChangeSA(true);
              shouldersSet = true;
            } else {
              this.onChangeSA(false);
              shouldersSet = false;
            }

            if (feetSet && shouldersSet) {
              calibrationConfidenceLevel++;
              startingLeftHipX.push(keypoints[11].position.x);
              startingLeftHipY.push(keypoints[11].position.y);
              startingRightHipX.push(keypoints[12].position.x);
              startingRightHipY.push(keypoints[12].position.y);
              startingLeftShoulderX.push(keypoints[5].position.x);
              startingRightShoulderX.push(keypoints[6].position.x);
              startingLeftKneeY.push(keypoints[13].position.y);
            } else {
              calibrationConfidenceLevel = 0;
              startingLeftHipX = [];
              startingLeftHipY = [];
              startingRightHipX = [];
              startingRightHipY = [];
              startingLeftShoulderX = [];
              startingRightShoulderX = [];
              startingLeftKneeY = [];
            }

            if (calibrationConfidenceLevel > 75) {
              calibrationComplete = true;
              for (var i = 0; i < 75; i++) {
                startingAvgLeftHipX += startingLeftHipX[i];
                startingAvgLeftHipY += startingLeftHipY[i];
                startingAvgRightHipX += startingRightHipX[i];
                startingAvgRightHipY += startingRightHipY[i];
                startingAvgLeftShoulderX += startingLeftShoulderX[i];
                startingAvgRightShoulderX += startingRightShoulderX[i];
                startingAvgLeftKneeY += startingLeftKneeY[i];
              }

              startingAvgLeftHipX /= 75;
              startingAvgLeftHipY /= 75;
              startingAvgRightHipX /= 75;
              startingAvgRightHipY /= 75;
              startingAvgLeftShoulderX /= 75;
              startingAvgRightShoulderX /= 75;
              startingAvgLeftKneeY /= 75;
              this.onChangeCalibrationState(true);
              console.log("Calibration complete");
            }
          } else {
            drawShoulderAlignmentLines(
              startingAvgLeftShoulderX,
              startingAvgRightShoulderX,
              keypoints[5].position.x,
              keypoints[6].position.x,
              this.canvas.getContext("2d"),
              400
            );
            drawSquatDepthLine(
              startingAvgLeftKneeY,
              keypoints[11].position.y,
              this.canvas.getContext("2d"),
              600
            );

<<<<<<< HEAD
          else {
            if (analyzeSquatDepth(keypoints) == "good") {
              this.onChangeSD("good");
=======
            if (analyzeSquatDepth(keypoints)) {
              this.onChangeSD(true);
>>>>>>> 6a3e377a9d274e204c7f78ccde40b27bc185bda9
              goodDepth = true;
            }
            if (analyzeSquatDepth(keypoints) == "okay" && !goodDepth) {
              this.onChangeSD("okay")
              goodDepth = false;
            }

            distanceLeftHipFromStarting = distanceFormula(
              startingAvgLeftHipX,
              startingAvgLeftHipY,
              keypoints[11].position.x,
              keypoints[11].position.y
            );
            if (distanceLeftHipFromStarting > 25) {
              startedRep = true;
            }

            if (startedRep && goodDepth && distanceLeftHipFromStarting < 25) {
              goodRepCounter++;
              this.onChangeGoodRep(true);
              this.onChangeGoodRep(false);
              console.log("Good reps: " + goodRepCounter);
              goodDepth = false;
              startedRep = false;
              this.onChangeSD("bad");
            }

            if (startedRep && !goodDepth && distanceLeftHipFromStarting < 25) {
              badRepCounter++;
              this.onChangeBadRep(true);
              this.onChangeBadRep(false);
              console.log("Bad reps: " + badRepCounter);
              startedRep = false;
            }
          }

          if (showPoints) {
            drawKeypoints(keypoints, minPartConfidence, skeletonColor, ctx);
          }
          if (showSkeleton) {
            drawSkeleton(
              keypoints,
              minPartConfidence,
              skeletonColor,
              skeletonLineWidth,
              ctx
            );
          }
        }
      });

      requestAnimationFrame(poseDetectionFrameInner);
    };

    poseDetectionFrameInner();
  }

  render() {
    const {
      backgroundcolorSA,
      backgroundcolorFW,
      backgroundcolorSD
    } = this.state;
    const loading = this.state.loading ? (
      <div className="PoseNet__loading">{this.props.loadingText}</div>
    ) : (
      ""
    );
    let textSD;
    let textFW;
    let textSA;
    if (backgroundcolorSD === "red") {
      textSD = "Bad";
    } else if(backgroundcolorSD == "yellow") {
      textSD = "Okay";
    }
    else {
      textSD = "Good";
    }
    if (backgroundcolorFW === "red") {
      textFW = "Bad";
    } else {
      textFW = "Good";
    }
    if (backgroundcolorSA === "red") {
      textSA = "Bad";
    } else {
      textSA = "Good";
    }
    return (
      <div className="PoseNet">
        {loading}
        <video id="posenetVideo" playsInline ref={this.getVideo} />
        <canvas id="posenetCanvas" ref={this.getCanvas} />
        <div className="videocueinfo">
          <div id="video-info-SD">Squat Depth:</div>
          <div id="SD-good" style={{ backgroundColor: backgroundcolorSD }}>
            {textSD}
          </div>
          <div id="video-info-SA">Shoulder Alignment:</div>
          <div id="SA-good" style={{ backgroundColor: backgroundcolorSA }}>
            {textSA}
          </div>
          <div id="video-info-FW">Feet Width:</div>
          <div id="FW-good" style={{ backgroundColor: backgroundcolorFW }}>
            {textFW}
          </div>
        </div>
        <div className="calibration-container">
          <div>{this.state.calibrationState}</div>
        </div>
        <div className="rep-container">
          <div id="good-rep">
            <div>Good Rep:</div>
            {this.state.goodCounter}
          </div>
          <div id="bad-rep">
            <div>Bad Rep:</div>
            {this.state.badCounter}
          </div>
        </div>
      </div>
    );
  }
}
