import * as posenet from "@tensorflow-models/posenet";
import * as React from "react";
import Col from "react-bootstrap";
import Rodal from "rodal"
import SpeechRecognition from "react-speech-recognition";
import ChartistGraph from "react-chartist";
import Card from "../Card/Card.jsx";
import { isMobile, drawKeypoints, drawSkeleton } from "./utils";
import GoodRepSound from "../../assets/audio/Goodrep.mp3";
import Sound from "react-sound";
import SummaryTable from "../SummaryTable";
import Firebase from "../Firebase";

import { FirebaseContext, withFirebase } from '../Firebase';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

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

const INITIAL_STATE = {
  repData: "testing",
  error: null,
};

let goodSD = cueGradeEnum.BAD;
let goodFW = false;
let goodKA = false;
let straightUpAndDown = true;
let SDcount = 0;
let FWcount = 0;
let KAcount = 0;
let SAcount = 0;
let repScore = 0;
let setScore = 0.0;
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
      badCounter: 0,
      setScore: 0,
      repData: [],
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
    this.writeToDatabase = this.writeToDatabase.bind(this);
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

  fetchCurrentDate() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; // January is 0!
    let yyyy = today.getFullYear();

    if (dd < 10) {
      dd = '0' + dd;
    }

    if (mm < 10) {
      mm = '0' + mm;
    }

    today = mm + '-' + dd + '-' + yyyy;

    return today.toString();
  }

  /* checkNextSetNumber */
  /* Experimental function to test reading from Firebase */
  checkNextSetNumber(currentUserUid, date) {
    let ref = this.props.firebase.sets(currentUserUid, date); // fetch the sets for a particular user and date
    let defaultSetNum = 0;
    // Attach an asynchronous callback to read the data at our posts reference
    ref.on("value", function(snapshot) {
      let firstSetExists = snapshot.exists();
      if (firstSetExists) {
        console.log("first set exists!");
        snapshot.forEach((child) => {
          console.log(child.key);
          let currentSetNum = child.key.toString();
          console.log(`snapshot: ${currentSetNum}`);
          currentSetNum = currentSetNum.substr(-1);
          console.log(`last set #: ${currentSetNum}`);
          defaultSetNum = Number(currentSetNum) + 1;
          console.log(`new set #: ${defaultSetNum}`);
          return defaultSetNum;
        });
      } else {
        console.log("no sets!");
      }
    });
  }

  getNumberOfChildren() {
    let date = this.fetchCurrentDate();
    let currentUserUid = this.props.firebase.getCurrentUserUid();

    let ref = this.props.firebase.sets(currentUserUid, date); // fetch the sets for a particular user and date

    ref.on("value", function(snapshot) {
      let firstSetExists = snapshot.exists();
      let numKids = snapshot.numChildren();
      return numKids;
    });
  }

  readFromDatabase() {
    let date = this.fetchCurrentDate();
    let currentUserUid = this.props.firebase.getCurrentUserUid();
    let ref = this.props.firebase.sets(currentUserUid, date); // fetch the sets for a particular user and date

    ref.on("value", function(snapshot) {
      let firstSetExists = snapshot.exists();
      if (firstSetExists) {
        console.log("sets found!");
        snapshot.forEach((child) => {
          console.log(child.key, child.val());
          let i;
          for (i = 0; i < child.val().length; i++) {
            console.log(`rep: ${child.val()[i]}`);
          }
        });
      } else {
        console.log("no sets!");
      }
    });
  }

  writeToDatabase(setData, score) {
    let date = this.fetchCurrentDate();
    let currentUserUid = this.props.firebase.getCurrentUserUid();
    let setString = "set_"
    let setId = Math.random().toString(36).substr(2, 5); // generate a unique ID for the latest set
    let setTitle = setString + setId;

    // modify score to reflect percentage displayed on summary page
    // limit decimal to to hundreths place
    score = (score/(goodRepCounter + badRepCounter))/6;
    score *= 100;
    score = score.toFixed(2);

    this.props.firebase.addSet(currentUserUid, date).update({
      [setTitle]: setData,
    });

    this.props.firebase.addSetScore(currentUserUid, date, setTitle).update({
      setScore: score,
    });
  }

  onChangeSA(inputEntry) {
    if (inputEntry) {
      this.setState({ backgroundcolorSA: "green" });
    } else {
      this.setState({ backgroundcolorSA: "red" });
    }
  }

  onChangeSD(inputEntry) {
    if (inputEntry === "good") {
      this.setState({ backgroundcolorSD: "green" });
    } else if (inputEntry === "okay") {
      this.setState({ backgroundcolorSD: "yellow" });
    } else if (inputEntry === "bad") {
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

  onChangeSetScore(inputEntry) {
    this.setState({setScore: inputEntry});
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
              // console.log("Calibration complete");
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
            if (analyzeSquatDepth(keypoints) === "good") {
              this.onChangeSD("good");
              goodDepth = true;
              goodSD = cueGradeEnum.GOOD;
              if(analyzeKneeAngle(keypoints)) {
                goodKA = true;
                this.onChangeKA(goodKA);
              }
            }
            if (analyzeSquatDepth(keypoints) === "okay" && !goodDepth) {
              this.onChangeSD("okay");
              goodDepth = false;
              goodSD = cueGradeEnum.OKAY;
              goodKA = false;
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
              FWcount++;
              if(goodSD === cueGradeEnum.GOOD) {
                repScore += 2;
                SDcount++;
              }
              else if(goodSD === cueGradeEnum.OKAY) {
                repScore += 1;
              }
              if(goodKA) {
                repScore += 2;
                KAcount++;
              }
              if(straightUpAndDown) {
                repScore += 2;
                SAcount++;
              }
              setScore += repScore;
              this.onChangeSetScore(setScore);
              if(repScore >= 4) {
                goodRepCounter++;
                this.onChangeGoodRep(true);
                this.onChangeGoodRep(false);
                this.playRepSound("good");
                // console.log("Good reps: " + goodRepCounter);
              }
              else {
                badRepCounter++;
                this.onChangeBadRep(true);
                this.onChangeBadRep(false);
                // console.log("Bad reps: " + badRepCounter);
              }
              this.onChangeSetScore((setScore/(goodRepCounter + badRepCounter))/6);
              var repStats = [goodSD, straightUpAndDown, goodFW, goodKA];
              repStatsList.push(repStats);
              // console.log(repStats);

              goodDepth = false;
              goodSD = cueGradeEnum.BAD;
              goodKA = false;
              straightUpAndDown = true;
              startedRep = false;
              repScore = 0;
              this.onChangeSD("bad");
              this.onChangeKA(false);
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
    } else if (backgroundcolorSD === "yellow") {
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
      this.setState({ repData: repStatsList });
      //this.writeToDatabase(repStatsList, setScore);
      // this.readFromDatabase();
    }

    const styles = {
      overflowY: "scroll",
      backgroundColor: "red"
    };

    const graph_data = {
      type: "Bar",
      data: {
        labels: [
          "Squat Depth",
          "Feet Width",
          "Shoulder Alignment",
          "Knee Angle"
        ],
        series: [[SDcount,FWcount,SAcount,KAcount]]
      },
      options: {
        seriesBarDistance: 10,
        classNames: {
          bar: "ct-bar ct-azure"
        },
        axisX: {
          showGrid: false
        }
      },
      responsiveOptions: [
    [
      "screen and (max-width: 640px)",
      {
        seriesBarDistance: 5,
        axisX: {
          labelInterpolationFnc: function(value) {
            return value[0];
          }
        }
      }
    ]
  ]
};

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
            customStyles={styles}
          >
              <div align="center">Score: {(this.state.setScore * 100).toFixed(2)} % </div>
                  <Card
                    title={"Cue Performance"}
                    category={"Bar Chart"}
                    content={
                      <ChartistGraph
                        data={graph_data.data}
                        type={graph_data.type}
                        options={graph_data.options}
                        responsiveOptions={graph_data.responsiveOptions}
                      />
                    }
                  />
            <SummaryTable
            repCount={10}
            numReps={goodRepCounter + badRepCounter}
            repStatsList={repStatsList}
            summaryStatus={this.state.summaryVisible}/>
            <button type="submit" onClick={() => {this.writeToDatabase(repStatsList, setScore) }}>Write to Database</button>
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
const PoseNetDataTest = withRouter(withFirebase(PoseNet));

// export default SpeechRecognition(PoseNet);
// export { PoseNetDataTest };

const PoseNetForm = compose(
  withRouter,
  withFirebase,
  SpeechRecognition,
)(PoseNet);

export default PoseNetForm;
