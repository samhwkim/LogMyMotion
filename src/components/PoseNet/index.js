import * as posenet from "@tensorflow-models/posenet";
import * as React from "react";
import { Grid, Row, Col } from "react-bootstrap";
import Rodal from "rodal";
import SpeechRecognition from "react-speech-recognition";
import ChartistGraph from "react-chartist";
import Card from "../Card/Card.jsx";
import { isMobile, drawKeypoints, drawSkeleton } from "./utils";
import GoodRepSound from "../../assets/audio/Goodrep.mp3";
import AngleFeetOutwardsSound from "../../assets/audio/anglefeetoutwards.mp3";
import BodyStraightSound from "../../assets/audio/bodystraight.mp3";
import GoodJobSound from "../../assets/audio/goodjob.mp3";
import LittleDeeperSound from "../../assets/audio/littledeeper.mp3";
import NarrowStance from "../../assets/audio/narrowstance.mp3";
import ShouldersAlign from "../../assets/audio/shouldersalign.mp3";
import WiderStance from "../../assets/audio/widerstance.mp3";
import Sound from "react-sound";
import SummaryTable from "../SummaryTable";
import Firebase from "../Firebase";
import { FirebaseContext, withFirebase } from "../Firebase";
import { Link, withRouter } from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import { compose } from "recompose";
import Button from "../CustomButton/CustomButton.jsx";

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
let currentCalibrationCounter = 0;
let maxCalibrationConfidenceLevel = 75;
let goodDepth = false;
let startedRep = false;
let goodRepCounter = 0;
let badRepCounter = 0;
let events = [];

let shouldersAlignSoundConfidenceLevel = 0;
let feetWidthSoundConfidenceLevel = 0;
let straightUpAndDownSoundPlayed = false;


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

let workoutInProgress = false;
let workoutTitle = "";

let startRepTimer = null;

const cueGradeEnum = {
  GOOD: "good",
  OKAY: "okay",
  BAD: "bad"
};

const kneeAngleEnum = {
  GOOD: "good",
  NEUTRAL: "neutral",
  BAD: "bad"
};

const feetWidthEnum = {
  GOOD: "good",
  WIDE: "wide",
  NARROW: "narrow",
}

const INITIAL_STATE = {
  repData: "testing",
  error: null
};

let goodSD = cueGradeEnum.BAD;
let goodFW = false;
let goodKA = kneeAngleEnum.NEUTRAL;
let straightUpAndDown = true;
let SDcount = 0;
let SDokayCount = 0;
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
      backgroundcolorKA: "white",
      backgroundcolorGood: "white",
      backgroundcolorBad: "white",
      calibrationState: "Calibrating",
      goodCounter: 0,
      badCounter: 0,
      summaryVisible: false,
      badCounter: 0,
      setScore: 0,
      repData: []
    };
    this.onChangeBadRep = this.onChangeBadRep.bind(this);
    this.onChangeCalibrationState = this.onChangeCalibrationState.bind(this);
    this.onChangeFW = this.onChangeFW.bind(this);
    this.onChangeGoodRep = this.onChangeGoodRep.bind(this);
    this.onChangeKA = this.onChangeKA.bind(this);
    this.onChangeSA = this.onChangeSA.bind(this);
    this.onChangeSD = this.onChangeSD.bind(this);
    this.resetCalibrationState = this.resetCalibrationState.bind(this);
    this.resetGoodRepCounter = this.resetGoodRepCounter.bind(this);
    this.resetBadRepCounter = this.resetBadRepCounter.bind(this);
    this.playRepSound = this.playRepSound.bind(this);
    this.goodRepSound = new Audio(GoodRepSound);
    this.angleFeetOutwardsSound = new Audio(AngleFeetOutwardsSound);
    this.bodyStraightSound = new Audio(BodyStraightSound);
    this.goodJobSound = new Audio(GoodJobSound);
    this.littleDeeperSound = new Audio(LittleDeeperSound);
    this.narrowStance = new Audio(NarrowStance);
    this.shouldersAlign = new Audio(ShouldersAlign);
    this.widerStance = new Audio(WiderStance);
    this.writeToDatabase = this.writeToDatabase.bind(this);
    this.changeTextColorGood = this.changeTextColorGood.bind(this);
    this.changeTextColorBad = this.changeTextColorBad.bind(this);
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

  getCurrentDate() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; // January is 0!
    let yyyy = today.getFullYear();

    // if (dd < 10) {
    //   dd = '0' + dd;
    // }
    //
    // if (mm < 10) {
    //   mm = '0' + mm;
    // }

    today = mm + "-" + dd + "-" + yyyy;

    return today.toString();
  }

  clearForNewSet() {
    shouldersSet = false;
    feetSet = false;
    calibrationConfidenceLevel = 0;
    calibrationComplete = false;

    //SAM'S VARIABLES
    currentCalibrationCounter = 0;
    shouldersAlignSoundConfidenceLevel = 0;
    feetWidthSoundConfidenceLevel = 0;

    goodRepCounter = 0;
    badRepCounter = 0;

    startingLeftHipX = [];
    startingLeftHipY = [];
    startingRightHipX = [];
    startingRightHipY = [];
    startingLeftShoulderX = [];
    startingRightShoulderX = [];
    startingLeftKneeY = [];

    startingAvgLeftHipX = 0;
    startingAvgLeftHipY = 0;
    startingAvgRightHipX = 0;
    startingAvgRightHipY = 0;
    startingAvgLeftShoulderX = 0;
    startingAvgRightShoulderX = 0;
    startingAvgLeftKneeY = 0;

    distanceLeftHipFromStarting = 0;
    distanceRightHipFromStarting = 0;

    goodFW = false;
    SDcount = 0;
    SDokayCount = 0;
    FWcount = 0;
    KAcount = 0;
    SAcount = 0;
    setScore = 0.0;

    repStatsList = [];
    this.hideSummary();
    this.canvas
      .getContext("2d")
      .clearRect(0, 0, this.props.videoWidth, this.props.videoHeight);
    this.canvas.getContext("2d").beginPath();
    this.resetRepVariables();
    this.onChangeClear();
  }

  async getNumChildrenAtRef(dbRef) {
    let numChildren;

    let snapshot = await dbRef.once("value");
    if (snapshot.exists()) {
      numChildren = snapshot.numChildren();
    } else {
      numChildren = 0;
    }

    return numChildren;
  }

  async writeToDatabase(setData, score, repsCompleted, isFinalSet) {
    let date = this.getCurrentDate();
    let currentUserUid = this.props.firebase.getCurrentUserUid();

    // modify score to reflect percentage displayed on summary page
    // limit decimal to to hundreths place
    score = score / (goodRepCounter + badRepCounter) / 6;
    score *= 100;
    score = score.toFixed(2);

    // update total number of reps performed
    let totalRepsRef = this.props.firebase.totalReps(currentUserUid);
    let snapshot = await totalRepsRef.once("value");
    if (snapshot.child("totalReps").exists()) {
      this.props.firebase.updateTotalReps(currentUserUid).update({
        totalReps: snapshot.val().totalReps + repsCompleted,
      });
    }
    else {
      this.props.firebase.updateTotalReps(currentUserUid).update({
        totalReps: repsCompleted,
      })
    }

    // update good cue counters
    let cueScoreRef = this.props.firebase.cueScores(currentUserUid);
    snapshot = await cueScoreRef.once("value");

    if (snapshot.child("goodSDCount").exists()) {
      this.props.firebase.updateSDCue(currentUserUid).update({
        goodSDCount: snapshot.val().goodSDCount + SDcount,
      });
    } else {
      this.props.firebase.updateSDCue(currentUserUid).update({
        goodSDCount: SDcount,
      });
    }

    if (snapshot.child("goodSACount").exists()) {
      this.props.firebase.updateSACue(currentUserUid).update({
        goodSACount: snapshot.val().goodSACount + SAcount,
      });
    } else {
      this.props.firebase.updateSACue(currentUserUid).update({
        goodSACount: SAcount,
      });
    }

    if (snapshot.child("goodFWCount").exists()) {
      this.props.firebase.updateFWCue(currentUserUid).update({
        goodFWCount: snapshot.val().goodFWCount + FWcount,
      });
    } else {
      this.props.firebase.updateFWCue(currentUserUid).update({
        goodFWCount: FWcount,
      });
    }

    if (snapshot.child("goodKACount").exists()) {
      this.props.firebase.updateKACue(currentUserUid).update({
        goodKACount: snapshot.val().goodKACount + KAcount,
      });
    } else {
      this.props.firebase.updateKACue(currentUserUid).update({
        goodKACount: KAcount,
      });
    }

    // create a new workout when they decide to use the analyzer
    let workoutString = "workout_";
    let workoutId = 0;

    if (workoutInProgress === false) {
      workoutInProgress = true; // keep track of all sets under one workout
      let woRef = this.props.firebase.workouts(currentUserUid, date);
      workoutId = await this.getNumChildrenAtRef(woRef);
      workoutId++;
      workoutTitle = workoutString + workoutId;

      let setTitle = "set_1"; // first set of the workout

      this.props.firebase.addWorkout(currentUserUid, date).update({
        [workoutTitle]: {
          [setTitle]: {
            setData,
            setScore: score
          }
        }
      });
    } else {
      let setString = "set_";
      let urlRef = this.props.firebase.sets(currentUserUid, date, workoutTitle);
      let setId = await this.getNumChildrenAtRef(urlRef);
      setId++;

      let setTitle = setString + setId;

      // write the set data to DB
      this.props.firebase.addSet(currentUserUid, date, workoutTitle).update({
        [setTitle]: {
          setData: setData
        }
      });
      // write the set score to DB
      this.props.firebase
        .addSetScore(currentUserUid, date, workoutTitle, setTitle)
        .update({
          setScore: score
        });
    }
    // this.props.history.push(ROUTES.ANALYZER);
    // refresh the analyzer page to record a new set
    // window.location.reload();

    // CLEAR DATA FOR NEW SET!
    if (!isFinalSet) {
      this.clearForNewSet();
    }
  }

  finishWorkout(setData, score, repsCompleted) {
    this.writeToDatabase(setData, score, repsCompleted, true);
    this.props.history.push(ROUTES.HOME);
    workoutInProgress = false;

    let currentUserUid = this.props.firebase.getCurrentUserUid();
    let workoutHistoryRef = this.props.firebase.dates(currentUserUid);
  }

  resetRepVariables() {
    goodDepth = false;
    straightUpAndDownSoundPlayed = false;
    goodSD = cueGradeEnum.BAD;
    goodKA = kneeAngleEnum.NEUTRAL;
    straightUpAndDown = true;
    startedRep = false;
    repScore = 0;
    this.onChangeSD("bad");
    this.onChangeKA(kneeAngleEnum.NEUTRAL);
    startRepTimer = null;
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
    if (inputEntry === kneeAngleEnum.GOOD) {
      this.setState({ backgroundcolorKA: "green" });
    } else if (inputEntry === kneeAngleEnum.NEUTRAL) {
      this.setState({ backgroundcolorKA: "white" });
    } else if (inputEntry === kneeAngleEnum.BAD) {
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
    this.setState({ setScore: inputEntry });
  }

  resetCalibrationState() {
    this.setState({ calibrationState: "Calibrating" });
  }

  resetGoodRepCounter() {
    this.setState({ goodCounter: 0 });
  }

  resetBadRepCounter() {
    this.setState({ badCounter: 0 });
  }

  onChangeClear() {
    this.onChangeSA(false);
    this.onChangeSD(cueGradeEnum.BAD);
    this.onChangeFW(false);
    this.onChangeKA(kneeAngleEnum.BAD);
    this.resetCalibrationState();
    this.resetGoodRepCounter();
    this.resetBadRepCounter();
    this.onChangeSetScore(0.0);
  }

  changeTextColorGood(inputEntry) {
    if (inputEntry) {
      this.setState({ backgroundcolorGood: "green" });
    } else {
      this.setState({ backgroundcolorGood: "white" });
    }
  }

  changeTextColorBad(inputEntry) {
    if (inputEntry) {
      this.setState({ backgroundcolorBad: "red" });
    } else {
      this.setState({ backgroundcolorBad: "white" });
    }
  }

  donothing() {}
  getCanvas = elem => {
    this.canvas = elem;
  };

  getVideo = elem => {
    this.video = elem;
  };

  async componentWillMount() {
    // Loads the pre-trained PoseNet model
    this.net = await posenet.load(this.props.mobileNetArchitecture);

    this.setState({ a: 1 });
  }

  async componentDidMount() {
    try {
      await this.setupCamera();
    } catch (e) {
      throw "This browser does not support video capture, or this device does not have a camera";
    } finally {
      this.setState({ loading: false });
    }

    // this.detectPose();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.net && !this.netInitialized) {
      this.netInitialized = true;
      this.detectPose();
    }
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

      // For each pose (i.e. person) detected in an image, loop through the poses
      // and draw the resulting skeleton and keypoints if over certain confidence
      // scores

      poses.forEach(({ score, keypoints }) => {
        if (score >= minPoseConfidence) {
          if (!calibrationComplete) {
            if (analyzeFeetWidth(keypoints) === feetWidthEnum.GOOD) {
              this.onChangeFW(true);
              feetSet = true;
              feetWidthSoundConfidenceLevel = 0;
            } else {
              this.onChangeFW(false);
              feetSet = false;
              feetWidthSoundConfidenceLevel++;
              if (feetWidthSoundConfidenceLevel === 30) {
                if (analyzeFeetWidth(keypoints) === feetWidthEnum.WIDE) {
                  this.narrowStance.play();
                }
                else if (analyzeFeetWidth(keypoints) === feetWidthEnum.NARROW) {
                  this.widerStance.play();
                }
              }
            }

            if (analyzeShoulderAlignment(keypoints)) {
              this.onChangeSA(true);
              shouldersSet = true;
              shouldersAlignSoundConfidenceLevel = 0;
            } else {
              this.onChangeSA(false);
              shouldersSet = false;
              shouldersAlignSoundConfidenceLevel++;
              if (shouldersAlignSoundConfidenceLevel === 30) {
                this.shouldersAlign.play();
              }
            }

            if (feetSet && shouldersSet) {
              calibrationConfidenceLevel++;
              currentCalibrationCounter++;
              startingLeftHipX.push(keypoints[11].position.x);
              startingLeftHipY.push(keypoints[11].position.y);
              startingRightHipX.push(keypoints[12].position.x);
              startingRightHipY.push(keypoints[12].position.y);
              startingLeftShoulderX.push(keypoints[5].position.x);
              startingRightShoulderX.push(keypoints[6].position.x);
              startingLeftKneeY.push(keypoints[13].position.y);
            } else {
              currentCalibrationCounter++;
            }
            if (currentCalibrationCounter == maxCalibrationConfidenceLevel && calibrationConfidenceLevel < maxCalibrationConfidenceLevel - 10) {
              calibrationConfidenceLevel = 0;
              currentCalibrationCounter = 0;
              startingLeftHipX = [];
              startingLeftHipY = [];
              startingRightHipX = [];
              startingRightHipY = [];
              startingLeftShoulderX = [];
              startingRightShoulderX = [];
              startingLeftKneeY = [];
            }

            if (currentCalibrationCounter == maxCalibrationConfidenceLevel && calibrationConfidenceLevel > maxCalibrationConfidenceLevel - 10) {
              calibrationComplete = true;
              for (var i = 0; i < calibrationConfidenceLevel; i++) {
                startingAvgLeftHipX += startingLeftHipX[i];
                startingAvgLeftHipY += startingLeftHipY[i];
                startingAvgRightHipX += startingRightHipX[i];
                startingAvgRightHipY += startingRightHipY[i];
                startingAvgLeftShoulderX += startingLeftShoulderX[i];
                startingAvgRightShoulderX += startingRightShoulderX[i];
                startingAvgLeftKneeY += startingLeftKneeY[i];
              }

              startingAvgLeftHipX /= calibrationConfidenceLevel;
              startingAvgLeftHipY /= calibrationConfidenceLevel;
              startingAvgRightHipX /= calibrationConfidenceLevel;
              startingAvgRightHipY /= calibrationConfidenceLevel;
              startingAvgLeftShoulderX /= calibrationConfidenceLevel;
              startingAvgRightShoulderX /= calibrationConfidenceLevel;
              startingAvgLeftKneeY /= calibrationConfidenceLevel;
              this.onChangeCalibrationState(true);
              // this.props.startListening();
              // console.log("Calibration complete");
            }
          } else {
            if (this.canvas != null) {
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
            }

            if (
              keypoints[5].position.x > startingAvgLeftShoulderX + 10 ||
              keypoints[6].position.x < startingAvgRightShoulderX - 10
            ) {
              straightUpAndDown = false;
              if (straightUpAndDownSoundPlayed === false) {
                this.bodyStraightSound.play();
                straightUpAndDownSoundPlayed = true;
              }
            }
            //Assume that FW and SA will be "good" for all repetitions
            goodFW = true;
            //goodSA = true;

            // fetch the results of the knee angle analysis
            if (analyzeSquatDepth(keypoints) === "good") {
              this.onChangeSD("good");
              goodDepth = true;
              goodSD = cueGradeEnum.GOOD;
              if (analyzeKneeAngle(keypoints) == true) {
                goodKA = kneeAngleEnum.GOOD;
                this.onChangeKA(goodKA);
              } else {
                goodKA = kneeAngleEnum.BAD;
                this.onChangeKA(goodKA);
              }
            }
            if (analyzeSquatDepth(keypoints) === "okay" && !goodDepth) {
              this.onChangeSD("okay");
              goodDepth = false;
              goodSD = cueGradeEnum.OKAY;
              goodKA = kneeAngleEnum.NEUTRAL;

            }

            distanceLeftHipFromStarting = distanceFormula(
              startingAvgLeftHipX,
              startingAvgLeftHipY,
              keypoints[11].position.x,
              keypoints[11].position.y
            );
            // NOTICE: THIS IS WHERE WE DETERMINE WHEN A REP STARTS. ADJUST THIS NUMBER TO INCREASE DISTANCE
            // NEEDED TO REGISTER A STARTED REP STATE
            if (distanceLeftHipFromStarting > 22) {
              startedRep = true;
              if (startRepTimer == null) {
                startRepTimer = Date.now();
              }
            }

            // NOTICE: THIS IS WHERE WE DETERMINE WHEN A REP ENDS. ADJUST THIS NUMBER TO CHANGE DISTANCE
            // WITHIN STARTING POSITION TO REGISTER THE END OF A STARTED REP STATE
            if (startedRep && distanceLeftHipFromStarting < 15) {
              let finish = Date.now() - startRepTimer;
              if (finish < 1500) {
                this.resetRepVariables();
              } else {
                FWcount++;
                if (goodSD === cueGradeEnum.GOOD) {
                  repScore += 2;
                  SDcount++;

                  if (goodKA === kneeAngleEnum.BAD) {
                    this.angleFeetOutwardsSound.play();
                  }
                } else if (goodSD === cueGradeEnum.OKAY) {
                  repScore += 1;
                  SDokayCount++;
                  this.littleDeeperSound.play();
                } else if (goodSD === cueGradeEnum.BAD) {
                  this.littleDeeperSound.play();
                }

                if (goodKA === kneeAngleEnum.GOOD) {
                  repScore += 2;
                  KAcount++;
                }
                if (straightUpAndDown) {
                  repScore += 2;
                  SAcount++;
                }

                setScore += repScore;
                this.onChangeSetScore(setScore);
                if (repScore >= 4) {
                  goodRepCounter++;
                  this.onChangeGoodRep(true);
                  this.onChangeGoodRep(false);
                  this.changeTextColorGood(true);
                  //console.log(this.state.backgroundcolorGood);
                  this.playRepSound("good");
                  setTimeout(this.changeTextColorGood, 1000);

                  //console.log(this.state.backgroundcolorGood);

                  // console.log("Good reps: " + goodRepCounter);
                } else {
                  badRepCounter++;
                  this.onChangeBadRep(true);
                  this.onChangeBadRep(false);
                  this.changeTextColorBad(true);
                  setTimeout(this.changeTextColorBad, 1000);

                  // console.log("Bad reps: " + badRepCounter);
                }
                this.onChangeSetScore(setScore / (goodRepCounter + badRepCounter) / 6);
                var repStats = [goodSD, straightUpAndDown, goodFW, goodKA];
                repStatsList.push(repStats);
                // console.log(repStats);


                this.resetRepVariables();
              }
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
      backgroundcolorKA,
      backgroundcolorGood,
      backgroundcolorBad
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
    } else if (backgroundcolorKA === "white") {
      textKA = "Neutral";
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
      backgroundColor: "grey"
    };

    const RepChartData = {
      type: "Bar",
      data: {
        labels: [
          "Squat Depth",
          "Feet Width",
          "Shoulder Alignment",
          "Knee Angle"
        ],
        series: [[SDcount, FWcount, SAcount, KAcount]]
      },
      options: {
        seriesBarDistance: 10,
        classNames: {
          bar: "ct-bar ct-azure"
        },
        width: "100%",
        axisX: {
          showGrid: false
        },
        axisY: {
          onlyInteger: true
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

    const setScoreData = {
      type: "Pie",
      data: {
        labels: ["Set Score", "Bad Set Score"],
        series: [this.state.setScore, 1 - this.state.setScore]
      },
      options: {
        donut: true
      }
    };

    const sdDonutData = {
      type: "Pie",
      data: {
        labels: ["Good Reps", "Okay Reps", "Bad Reps"],
        series: [
          SDcount,
          goodRepCounter + badRepCounter - SDcount - SDokayCount,
          SDokayCount
        ]
      },
      options: {
        donut: true
      }
    };

    const fwDonutData = {
      type: "Pie",
      data: {
        labels: ["Good Reps", "Bad Reps"],
        series: [FWcount, goodRepCounter + badRepCounter - FWcount]
      },
      options: {
        donut: true
      }
    };

    const saDonutData = {
      type: "Pie",
      data: {
        labels: ["Good Reps", "Bad Reps"],
        series: [SAcount, goodRepCounter + badRepCounter - SAcount]
      },
      options: {
        donut: true
      }
    };

    const kaDonutData = {
      type: "Pie",
      data: {
        labels: ["Good Reps", "Bad Reps"],
        series: [KAcount, goodRepCounter + badRepCounter - KAcount]
      },
      options: {
        donut: true
      }
    };

    let workoutSummary;
    if (this.state.summaryVisible) {
      workoutSummary = (
        <Rodal
          visible={this.state.summaryVisible}
          measure={"%"}
          width={80}
          height={80}
          onClose={this.hideSummary.bind(this)}
          customStyles={styles}
        >
          <div align="center">
            Score: {(this.state.setScore * 100).toFixed(2)} %{" "}
          </div>
          <Grid fluid>
            <Row>
              <Card
                title={"Cue Performance"}
                category={"Bar Chart"}
                content={
                  <ChartistGraph
                    data={RepChartData.data}
                    type={RepChartData.type}
                    options={RepChartData.options}
                    responsiveOptions={RepChartData.responsiveOptions}
                  />
                }
              />
            </Row>
            <Row>
              <Col lg={3} sm={6}>
                <Card
                  title={"Squat Depth"}
                  category={"Donut"}
                  content={
                    <ChartistGraph
                      data={sdDonutData.data}
                      type={sdDonutData.type}
                      options={sdDonutData.options}
                    />
                  }
                />
              </Col>
              <Col lg={3} sm={6}>
                <Card
                  title={"Feet Width"}
                  category={"Donut"}
                  content={
                    <ChartistGraph
                      data={fwDonutData.data}
                      type={fwDonutData.type}
                      options={fwDonutData.options}
                    />
                  }
                />
              </Col>
              <Col lg={3} sm={6}>
                <Card
                  title={"Shoulder Alignment"}
                  category={"Donut"}
                  content={
                    <ChartistGraph
                      data={saDonutData.data}
                      type={saDonutData.type}
                      options={saDonutData.options}
                    />
                  }
                />
              </Col>
              <Col lg={3} sm={6}>
                <Card
                  title={"Knee Angle"}
                  category={"Donut"}
                  content={
                    <ChartistGraph
                      data={kaDonutData.data}
                      type={kaDonutData.type}
                      options={kaDonutData.options}
                    />
                  }
                />
              </Col>
            </Row>
          </Grid>
          <SummaryTable
            numReps={goodRepCounter + badRepCounter}
            repStatsList={repStatsList}
            summaryStatus={this.state.summaryVisible}
          />
          <Button
            onClick={() => {
              this.writeToDatabase(repStatsList, setScore, goodRepCounter + badRepCounter, false);
            }}
            bsStyle="primary"
            bsSize="lg"
          >
            Record Another Set
          </Button>
          <Button
            onClick={() => {
              this.finishWorkout(repStatsList, setScore, goodRepCounter + badRepCounter);
            }}
            bsStyle="success"
            bsSize="lg"
          >
            Finish Workout
          </Button>
        </Rodal>
      );
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
            <div style={{ color: backgroundcolorGood }}>
              {this.state.goodCounter}
            </div>
          </div>
        </div>
        <div className="calibration-container">
          <div>{this.state.calibrationState}</div>
        </div>
        <div className="videoOverlay-Bad">
          <div id="bad-rep">
            <div>Bad Rep:</div>
            <div style={{ color: backgroundcolorBad }}>
              {this.state.badCounter}
            </div>
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
          {workoutSummary}
        </div>
      </div>
    );
  }
}

const speechRecognitionOptions = {
  autoStart: false
};

const PoseNetForm = compose(
  withRouter,
  withFirebase,
  SpeechRecognition
  //SpeechRecognition(speechRecognitionOptions),
)(PoseNet);

export default PoseNetForm;
