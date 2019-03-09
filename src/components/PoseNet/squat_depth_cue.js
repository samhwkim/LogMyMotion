let rightHipY = 0;
let rightKneeY = 0;
let leftHipY = 0;
let leftKneeY = 0;
let rightHipX = 0;
let rightKneeX = 0;
let leftHipX = 0;
let leftKneeX = 0;

export const analyzeSquatDepth = keypoints => {
  let leftHipKeypoint = keypoints[11];
  leftHipX = leftHipKeypoint.position.x;
  leftHipY = leftHipKeypoint.position.y;

  // Right hip coordinates
  let rightHipKeypoint = keypoints[12];
  rightHipX = rightHipKeypoint.position.x;
  rightHipY = rightHipKeypoint.position.y;

  // Left knee coordinates
  let leftKneeKeypoint = keypoints[13];
  leftKneeX = leftKneeKeypoint.position.x;
  leftKneeY = leftKneeKeypoint.position.y;

  // Right knee coordinates
  let rightKneeKeypoint = keypoints[14];
  rightKneeX = rightKneeKeypoint.position.x;
  rightKneeY = rightKneeKeypoint.position.y;

  if (rightHipY > rightKneeY * 0.85 && leftHipY > leftKneeY * 0.85) {
    return "good";
  }
  else if(rightHipY > rightKneeY * 0.75 && leftHipY > leftKneeY * 0.75) {
    return "okay";
  }
  else {
    return "bad";
  }
};
