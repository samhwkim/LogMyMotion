let rightShoulderX = 0;
let rightShoulderY = 0;
let leftShoulderX = 0;
let leftShoulderY = 0;

function slopeFormula(x1, y1, x2, y2) {
  var result = Math.abs((y2 - y1) / (x2 - x1));
  return result;
}

// A function to draw ellipses over the detected keypoints
export const analyzeShoulderAlignment = keypoints => {
  let rightShoulderKeypoint = keypoints[6];
  rightShoulderX = rightShoulderKeypoint.position.x;
  rightShoulderY = rightShoulderKeypoint.position.y;

  let leftShoulderKeypoint = keypoints[5];
  leftShoulderX = leftShoulderKeypoint.position.x;
  leftShoulderY = leftShoulderKeypoint.position.y;

  let shoulderSlope = slopeFormula(
    leftShoulderX,
    leftShoulderY,
    rightShoulderX,
    rightShoulderY
  );

  if (shoulderSlope >= 0.1) {
    return true;
  } else {
    return false;
  }
};
