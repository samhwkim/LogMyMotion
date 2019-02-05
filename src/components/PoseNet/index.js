import * as posenet from "@tensorflow-models/posenet";
import * as React from "react";
import Rodal from "rodal";
import SpeechRecognition from "react-speech-recognition";
import { isMobile, drawKeypoints, drawSkeleton } from "./utils";
import GoodRepSound from "../../assets/audio/Goodrep.mp3";
import Sound from "react-sound";
import SummaryTable from "../SummaryTable";
import Firebase from "../Firebase";

import { analyzeSquatDepth } from "./squat_depth_cue";
import { analyzeFeetWidth } from "./feet_width_cue";
import { analyzeShoulderAlignment } from "./shoulder_align_cue";
import { drawShoulderAlignmentLines } from "./utils";
import { drawSquatDepthLine } from "./utils";
import { analyzeKneeAngle } from "./knee_angle_cue";
import "../../css/posenet.css";
import "rodal/lib/rodal.css";

let shouldersSet = false;
let feetSet = false;
let calibrationConfidenceLevel = 0;
let calibrationComplete = false;
let goodDepth = false;
let startedRep = false;
let goodRep = 0;
let goodRepCounter = 0;
let badRepCounter = 0;

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

const cueGradeEnum = {
  GOOD: 'good',
  OKAY: 'okay',
  BAD: 'bad'
}

let goodSD = cueGradeEnum.BAD;
// let goodSA = false;
let goodFW = false;
let goodKA = false;
let straightUpAndDown = true;
let repScore = 0;
let repStatsList = [];

function distanceFormula(x1, y1, x2, y2) {
  var result = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
  return result;
}

class PoseNet extends React.Component {
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
      backgroundcolorKA: "red",
      calibrationState: "Calibrating",
      goodCounter: 0,
      badCounter: 0,
      summaryVisible: false,
      badCounter: 0
    };
    this.onChangeBadRep = this.onChangeBadRep.bind(this);
    this.onChangeCalibrationState = this.onChangeCalibrationState.bind(this);
    this.onChangeFW = this.onChangeFW.bind(this);
    this.onChangeGoodRep = this.onChangeGoodRep.bind(this);
    this.onChangeKA = this.onChangeKA.bind(this);
    this.onChangeSA = this.onChangeSA.bind(this);
    this.onChangeSD = this.onChangeSD.bind(this);
    this.playRepSound = this.playRepSound.bind(this);
    this.goodRepSound = new Audio(GoodRepSound);
  }

  playRepSound(inputEntry) {
    if (inputEntry === "good") {
      this.goodRepSound.play();
    } else {
    }
  }

  showSummary() {
    this.setState({ summaryVisible: true });
  }

  hideSummary() {
    this.setState({ summaryVisible: false });
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
    } else if (inputEntry == "okay") {
      this.setState({ backgroundcolorSD: "yellow" });
    } else if (inputEntry == "bad") {
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

  onChangeKA(inputEntry) {
    if (inputEntry) {
      this.setState({ backgroundcolorKA: "green" });
    } else {
      this.setState({ backgroundcolorKA: "red" });
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

            /*if (analyzeKneeAngle(keypoints)) {
              this.onChangeKA(true);
              goodKA = true;
            } else {
              this.onChangeKA(false);
              goodKA = false;
            }*/

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
              // this.props.startListening();
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

            if (keypoints[5].position.x > startingAvgLeftShoulderX + 10 || keypoints[6].position.x < startingAvgRightShoulderX - 10) {
              straightUpAndDown = false;
            }
            //Assume that FW and SA will be "good" for all repetitions
            goodFW = true;
            //goodSA = true;

            // fetch the results of the knee angle analysis
            this.onChangeKA(false);

            if (analyzeSquatDepth(keypoints) === "good") {
              this.onChangeSD("good");
              goodDepth = true;
              goodSD = cueGradeEnum.GOOD;
              if(analyzeKneeAngle(keypoints)) {
                //repScore += 2;
                goodKA = true;
                this.onChangeKA;
              }
            }
            if (analyzeSquatDepth(keypoints) === "okay" && !goodDepth) {
              this.onChangeSD("okay");
              goodDepth = false;
              goodSD = cueGradeEnum.OKAY;
              goodKA = false;
              //repScore += 1;
            }

            distanceLeftHipFromStarting = distanceFormula(
              startingAvgLeftHipX,
              startingAvgLeftHipY,
              keypoints[11].position.x,
              keypoints[11].position.y
            );
            if (distanceLeftHipFromStarting > 17) {
              startedRep = true;
            }

            if (startedRep && distanceLeftHipFromStarting < 10) {
              if(goodSD === cueGradeEnum.GOOD) {
                repScore += 2;
              }
              else if(goodSD === cueGradeEnum.OKAY) {
                repScore += 1;
              }
              if(goodKA) {
                repScore += 2;
              }
              if(repScore >= 3) {
                goodRepCounter++;
                this.onChangeGoodRep(true);
                this.onChangeGoodRep(false);
                this.playRepSound("good");
                console.log("Good reps: " + goodRepCounter);
              }
              else {
                badRepCounter++;
                this.onChangeBadRep(true);
                this.onChangeBadRep(false);
                console.log("Bad reps: " + badRepCounter);
              }

              var repStats = [goodSD, straightUpAndDown, goodFW, goodKA];
              repStatsList.push(repStats);
              console.log(repStats);

              goodDepth = false;
              goodSD = cueGradeEnum.BAD;
              goodKA = false;
              straightUpAndDown = true;
              startedRep = false;
              repScore = 0;
              this.onChangeSD("bad");
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
      backgroundcolorSD,
      backgroundcolorKA
    } = this.state;
    const {
      transcript,
      resetTranscript,
      startListening,
      stopListening,
      browserSupportsSpeechRecognition
    } = this.props;
    if (!browserSupportsSpeechRecognition) {
      return null;
    }

    const loading = this.state.loading ? (
      <div className="PoseNet__loading">{this.props.loadingText}</div>
    ) : (
      ""
    );
    let textSD;
    let textFW;
    let textSA;
    let textKA;
    if (backgroundcolorSD === "red") {
      textSD = "Bad";
    } else if (backgroundcolorSD == "yellow") {
      textSD = "Okay";
    } else {
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
    if (backgroundcolorKA === "red") {
      textKA = "Bad";
    } else {
      textKA = "Good";
    }

    if (this.props.transcript.includes("done")) {
      this.showSummary();
      this.props.resetTranscript();
    }

    return (
      <div className="PoseNet">
        {loading}
        <video
          id="posenetVideo"
          playsInline
          ref={this.getVideo}
          style={{ scale: 1, height: "75%", width: "100%" }}
        />
        <div className="videoOverlay-Good">
          <div id="good-rep">
            <div>Good Rep:</div>
            {this.state.goodCounter}
          </div>
        </div>
        <div className="calibration-container">
          <div>{this.state.calibrationState}</div>
        </div>
        <div className="videoOverlay-Bad">
          <div id="bad-rep">
            <div>Bad Rep:</div>
            {this.state.badCounter}
          </div>
        </div>
        <canvas
          id="posenetCanvas"
          ref={this.getCanvas}
          style={{ scale: 1, width: "100%" }}
        />
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
          <div id="video-info-KA">Knee Angle:</div>
          <div id="KA-good" style={{ backgroundColor: backgroundcolorKA }}>
            {textKA}
          </div>
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
          <span>{transcript}</span>
          <Rodal
            visible={this.state.summaryVisible}
            measure={"%"}
            width={80}
            height={80}
            onClose={this.hideSummary.bind(this)}
          >
            <div>Summary</div>
            <SummaryTable
            repCount={10}
            numReps={goodRepCounter + badRepCounter}
            repStatsList={repStatsList}
            summaryStatus={this.state.summaryVisible}/>
          </Rodal>
        </div>
      </div>
    );
  }
}

const speechRecognitionOptions = {
  autoStart: false
};

// export default SpeechRecognition(speechRecognitionOptions)(PoseNet);
export default SpeechRecognition(PoseNet);
