import * as posenet from "@tensorflow-models/posenet";
import * as React from "react";
import { isMobile, drawKeypoints, drawSkeleton } from "./utils";
import {
  squatDepthCue,
  analyzeShoulderAlignment,
  analyzeFeetWidth
} from "./cues";
import "../../css/posenet.css";

let scoreSA = 0;
let scoreFW = 0;
let streamCount = 0;
export default class PoseNet extends React.Component {
  static defaultProps = {
    videoWidth: 400,
    videoHeight: 300,
    flipHorizontal: true,
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
      backgroundcolorSA: "",
      backgroundcolorSD: "red",
      backgroundcolorFW: "red"
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
    if (inputEntry) {
      this.setState({ backgroundcolorSD: "green" });
    } else {
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
      }

      ctx.clearRect(0, 0, videoWidth, videoHeight);

      if (showVideo) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-videoWidth, 0);
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
        ctx.restore();
      }

      // For each pose (i.e. person) detected in an image, loop through the poses
      // and draw the resulting skeleton and keypoints if over certain confidence
      // scores

      poses.forEach(({ score, keypoints }) => {
        if (score >= minPoseConfidence) {
          // console.log(keypoints[11].position.x);
          // let righthipkeypoint = keypoints[11];
          // console.log("x position"+ righthipkeypoint.position.x);
          // console.log("y position:"+righthipkeypoint.position.y);
          streamCount++;
          if (streamCount > 250) {
            if (squatDepthCue(keypoints)) {
              this.onChangeSD(true);
            } else {
              this.onChangeSD(false);
            }
          }
          if (analyzeFeetWidth(keypoints)) {
            this.onChangeFW(true);
            scoreFW++;
          } else {
            scoreFW < 100 ? this.onChangeFW(false) : this.onChangeFW(true);
          }

          //this.onChangeFW(true);
          if (analyzeShoulderAlignment(keypoints)) {
            this.onChangeSA(true);
            scoreSA++;
          } else {
            scoreSA < 100 ? this.onChangeSA(false) : this.onChangeSA(true);
          }
          //this.onChangeSA(true);
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
    return (
      <div className="PoseNet">
        {loading}
        <video playsInline ref={this.getVideo} />
        <canvas ref={this.getCanvas} />
        <div className="videocueinfo">
          <div id="video-info-SD">Squat Depth:</div>
          <div id="SD-good" style={{ backgroundColor: backgroundcolorSD }}>
            Good{" "}
          </div>
          <div id="video-info-SA">Shoulder Alignment:</div>
          <div id="SA-good" style={{ backgroundColor: backgroundcolorSA }}>
            Good
          </div>
          <div id="video-info-FW">Feet Width:</div>
          <div id="FW-good" style={{ backgroundColor: backgroundcolorFW }}>
            Good{" "}
          </div>
        </div>
      </div>
    );
  }
}
