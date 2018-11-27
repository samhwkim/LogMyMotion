function distanceFormula(x1, y1, x2, y2) {
  var result = Math.sqrt(Math.pow(y2-y1, 2) + Math.pow(x2-x1, 2));
  return result;
}

function slopeFormula(x1, y1, x2, y2) {
  var result = Math.abs((y2-y1) / (x2-x1));
  return result
}

// A function to draw ellipses over the detected keypoints
function analyzeShoulderAlignment(pose) {
    let rightShoulderKeypoint = pose.keypoints[6];
    rightShoulderX = rightShoulderKeypoint.position.x;
    rightShoulderY = rightShoulderKeypoint.position.y;

    let leftShoulderKeypoint = pose.keypoints[5];
    leftShoulderX = leftShoulderKeypoint.position.x;
    leftShoulderY = leftShoulderKeypoint.position.y;

    let shoulderSlope = slopeFormula(leftShoulderX, leftShoulderY, rightShoulderX, rightShoulderY);

    if (shoulderSlope >= 0.1) {
      return true;
    }
    else {
      return false;
    }
}
