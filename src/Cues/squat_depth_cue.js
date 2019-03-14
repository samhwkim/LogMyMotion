// let rightHipY = 0;
// let rightKneeY = 0;

// let leftHipY = 0;
// let leftKneeY = 0;

// A function to draw ellipses over the detected keypoints
function analyzeSquatDepth(pose) {
  // Left hip coordinates
  let leftHipKeypoint = pose.keypoints[11];
  let leftHipX = leftHipKeypoint.position.x;
  let leftHipY = leftHipKeypoint.position.y;

  // Right hip coordinates
  let rightHipKeypoint = pose.keypoints[12];
  let rightHipX = rightHipKeypoint.position.x;
  let rightHipY = rightHipKeypoint.position.y;

  // Left knee coordinates
  let leftKneeKeypoint = pose.keypoints[13];
  let leftKneeX = leftKneeKeypoint.position.x;
  let leftKneeY = leftKneeKeypoint.position.y;

  // Right knee coordinates
  let rightKneeKeypoint = pose.keypoints[14];
  let rightKneeX = rightKneeKeypoint.position.x;
  let rightKneeY = rightKneeKeypoint.position.y;

  if (rightHipY > rightKneeY && leftHipY > leftKneeY) {
    console.log("DEEP ENOUGH");
    // return true
  }
}
