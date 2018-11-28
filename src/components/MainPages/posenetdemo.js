import React, { Component } from "react";
import PoseNet from "../PoseNet";

export default class PosenetDemo extends Component {
  render() {
    return (
      <div>
        <PoseNet
          videoWidth={600}
          videoHeight={500}
          flipHorizontal={true}
          algorithm={"single-pose"}
          mobileNetArchitecture={0.75}
          showVideo={true}
          showSkeleton={true}
          showPoints={true}
          minPoseConfidence={0.1}
          minPartConfidence={0.5}
          maxPoseDetections={2}
          nmsRadius={20.0}
          outputStride={16}
          imageScaleFactor={0.5}
          skeletonColor={"aqua"}
          skeletonLineWidth={2}
          loadingText={"Loading pose detector..."}
        />
      </div>
    );
  }
}
