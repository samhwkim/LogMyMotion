let rightAnkleX = 0;
let rightAnkleY = 0;

let leftAnkleX = 0;
let leftAnkleY = 0;

let rightShoulderX = 0;
let rightShoulderY = 0;

let leftShoulderX = 0;
let leftShoulderY = 0;

let shoulderDistance = 0;
let feetDistance = 0;

function distanceFormula(x1, y1, x2, y2) {
  var result = Math.sqrt(Math.pow(y2-y1, 2) + Math.pow(x2-x1, 2));
  return result;
}

function analyzeFeetWidth(pose) {
    let rightShoulderKeypoint = pose.keypoints[6];
    rightShoulderX = rightShoulderKeypoint.position.x;
    rightShoulderY = rightShoulderKeypoint.position.y;

    let leftShoulderKeypoint = pose.keypoints[5];
    leftShoulderX = leftShoulderKeypoint.position.x;
    leftShoulderY = leftShoulderKeypoint.position.y;

    let rightAnkleKeypoint = pose.keypoints[16];
    rightAnkleX = rightAnkleKeypoint.position.x;
    rightAnkleY = rightAnkleKeypoint.position.y;

    let leftAnkleKeypoint = pose.keypoints[15];
    leftAnkleX = leftAnkleKeypoint.position.x;
    leftAnkleY = leftAnkleKeypoint.position.y;

    shoulderWidth = distanceFormula(rightShoulderX, rightShoulderY, leftShoulderX, leftShoulderY);
    feetWidth = distanceFormula(rightAnkleX, rightAnkleY, leftAnkleX, leftAnkleY);

    if(feetWidth < shoulderWidth) {
      console.log("MOVE FEET FURTHER APART")
    }

    else if (feetWidth > 1.3 * shoulderWidth) {
      console.log("MOVE FEET CLOSER TOGETHER");
    }

    else {
      console.log("GOOD FEET DISTANCE");
    }
}
