// keypoints used to determine right leg knee angle
let rightHipX = 0;
let rightHipY = 0;
let rightKneeX = 0;
let rightKneeY = 0;
let rightAnkleX = 0;
let rightAnkleY = 0;

// keypoints used to determine left leg knee angle
let leftHipX = 0;
let leftHipY = 0;
let leftKneeX = 0;
let leftKneeY = 0;
let leftAnkleX = 0;
let leftAnkleY = 0;

function slopeFormula(x1, y1, x2, y2) {
  var result = Math.abs((y2-y1) / (x2-x1));
  return result;
}

function distanceFormula(x1, y1, x2, y2) {
  var result = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
  return result;
}

export function analyzeKneeAngle(keypoints) {
    // Lower body keypoints (RIGHT)
    let rightHipKeypoint = keypoints[12];
    rightHipX = rightHipKeypoint.position.x;
    rightHipY = rightHipKeypoint.position.y;

    let rightKneeKeypoint = keypoints[14];
    rightKneeX = rightKneeKeypoint.position.x;
    rightKneeY = rightKneeKeypoint.position.y;

    let rightAnkleKeypoint = keypoints[16];
    rightAnkleX = rightAnkleKeypoint.position.x;
    rightAnkleY = rightAnkleKeypoint.position.y;

    // Lower body keypoints (LEFT)
    let leftHipKeypoint = keypoints[11];
    leftHipX = leftHipKeypoint.position.x;
    leftHipY = leftHipKeypoint.position.y;

    let leftKneeKeypoint = keypoints[13];
    leftKneeX = leftKneeKeypoint.position.x;
    leftKneeY = leftKneeKeypoint.position.y;

    let leftAnkleKeypoint = keypoints[15];
    leftAnkleX = leftAnkleKeypoint.position.x;
    leftAnkleY = leftAnkleKeypoint.position.y;

    // The following code calculates the angle formed by the hip, knee, and ankle coordinates
    // The knee coordinate will serve as the vertex at which the angle is determined
    let numerator;
    let denominator;

    // Calculate the left leg angle
    let leftHipToKneeDistance = distanceFormula(leftHipX, leftHipY, leftKneeX, leftKneeY);
    let leftKneeToAnkleDistance = distanceFormula(leftKneeX, leftKneeY, leftAnkleX, leftAnkleY);
    let leftAnkleToHipDistance = distanceFormula(leftAnkleX, leftAnkleY, leftHipX, leftHipY);

    numerator = Math.pow(leftHipToKneeDistance, 2) + Math.pow(leftKneeToAnkleDistance, 2) - Math.pow(leftAnkleToHipDistance, 2);
    numerator = numerator.toFixed(3);
    denominator = (2*leftHipToKneeDistance*leftKneeToAnkleDistance);
    let leftLegFraction = (numerator/denominator);

    // Answer is in radians so we convert to degrees
    let leftLegRad = Math.acos(leftLegFraction);
    let leftLegAngle = leftLegRad * 180 / Math.PI;


    // Calculate the right leg angle
    let rightHipToKneeDistance = distanceFormula(rightHipX, rightHipY, rightKneeX, rightKneeY);
    let rightKneeToAnkleDistance = distanceFormula(rightKneeX, rightKneeY, rightAnkleX, rightAnkleY);
    let rightAnkleToHipDistance = distanceFormula(rightAnkleX, rightAnkleY, rightHipX, rightHipY);

    numerator = Math.pow(rightHipToKneeDistance, 2) + Math.pow(rightKneeToAnkleDistance, 2) - Math.pow(rightAnkleToHipDistance, 2);
    numerator = numerator.toFixed(3);
    denominator = (2*rightHipToKneeDistance*rightKneeToAnkleDistance);
    let rightLegFraction = (numerator/denominator);

    // Answer is in radians so we convert to degrees
    let rightLegRad = Math.acos(rightLegFraction);
    let rightLegAngle = rightLegRad * 180 / Math.PI;

    // return the leg angles
    return [leftLegAngle, rightLegAngle];

    // let rightLegSlope = slopeFormula(rightKneeX, rightKneeY, rightAnkleX, rightAnkleY);
    // let leftLegSlope = slopeFormula(leftKneeX, leftKneeY, leftAnkleX, leftAnkleY);
    //
    // return [rightLegSlope, leftLegSlope];

    /*
    if (rightLegSlope >= 0.5 && leftLegSlope >= 0.5) {
        return true;
    } else {
      return false;
    }

    // This is where we use our points to create three sides of our triangle
    shoulderToElbowDistance = distanceFormula(rightShoulderX, rightShoulderY, rightElbowX, rightElbowY);
    elbowToWristDistance = distanceFormula(rightElbowX, rightElbowY, rightWristX, rightWristY);
    shoulderToWristDistance = distanceFormula(rightShoulderX, rightShoulderY, rightWristX, rightWristY);

    // This link explains the formula I use from here: https://www.mathsisfun.com/algebra/trig-solving-sss-triangles.html
    // This grabs the angle of the elbow vertex
    let numerator = Math.pow(shoulderToElbowDistance, 2) + Math.pow(elbowToWristDistance, 2) - Math.pow(shoulderToWristDistance, 2);
    numerator = numerator.toFixed(3);
    let denominator = (2*shoulderToElbowDistance*elbowToWristDistance);
    let fraction = (numerator/denominator);

    // Answer is in rad so we convert to degrees
    let armRad = Math.acos(fraction);
    armAngle = armRad * 180 / Math.PI;
    */
}
