let rightShoulderX = 0;
let rightShoulderY = 0;
let leftShoulderX = 0;
let leftShoulderY = 0;

let leftAnkleX = 0;
let leftAnkleY = 0;
let rightAnkleX = 0;
let rightAnkleY = 0;

let shoulderWidth = 0;
let feetWidth = 0;

const feetWidthEnum = {
  GOOD: "good",
  WIDE: "wide",
  NARROW: "narrow",
}

function distanceFormula(x1, y1, x2, y2) {
  var result = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
  return result;
}

export const analyzeFeetWidth = keypoints => {
  let rightShoulderKeypoint = keypoints[6];
  rightShoulderX = rightShoulderKeypoint.position.x;
  rightShoulderY = rightShoulderKeypoint.position.y;

  let leftShoulderKeypoint = keypoints[5];
  leftShoulderX = leftShoulderKeypoint.position.x;
  leftShoulderY = leftShoulderKeypoint.position.y;

  let rightAnkleKeypoint = keypoints[16];
  rightAnkleX = rightAnkleKeypoint.position.x;
  rightAnkleY = rightAnkleKeypoint.position.y;

  let leftAnkleKeypoint = keypoints[15];
  leftAnkleX = leftAnkleKeypoint.position.x;
  leftAnkleY = leftAnkleKeypoint.position.y;

  shoulderWidth = distanceFormula(
    rightShoulderX,
    rightShoulderY,
    leftShoulderX,
    leftShoulderY
  );
  feetWidth = distanceFormula(rightAnkleX, rightAnkleY, leftAnkleX, leftAnkleY);

  if (feetWidth < 0.5 * shoulderWidth) {
    return feetWidthEnum.NARROW;
  } else if (feetWidth > 1.5 * shoulderWidth) {
    return feetWidthEnum.WIDE;
  } else {
    return feetWidthEnum.GOOD;
  }
};
