let rightHipY = 0;
let rightKneeY = 0;

let leftHipY = 0;
let leftKneeY = 0;

// A function to draw ellipses over the detected keypoints
function analyzeSquatDepth(pose) {
  // Left hip coordinates
  let leftHipKeypoint = pose.keypoints[11];
  leftHipX = leftHipKeypoint.position.x;
  leftHipY = leftHipKeypoint.position.y;

  // Right hip coordinates
  let rightHipKeypoint = pose.keypoints[12];
  rightHipX = rightHipKeypoint.position.x;
  rightHipY = rightHipKeypoint.position.y;

  // Left knee coordinates
  let leftKneeKeypoint = pose.keypoints[13];
  leftKneeX = leftKneeKeypoint.position.x;
  leftKneeY = leftKneeKeypoint.position.y;

  // Right knee coordinates
  let rightKneeKeypoint = pose.keypoints[14];
  rightKneeX = rightKneeKeypoint.position.x;
  rightKneeY = rightKneeKeypoint.position.y;

  if(rightHipY > rightKneeY && leftHipY > leftKneeY) {
    console.log("DEEP ENOUGH")
    // return true
  }
}
