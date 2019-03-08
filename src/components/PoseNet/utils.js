import * as posenet from "@tensorflow-models/posenet";

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isMobile() {
  return isAndroid() || isiOS();
}

export function drawKeypoints(
  keypoints,
  minConfidence,
  skeletonColor,
  ctx,
  scale = 1
) {
  keypoints.forEach(keypoint => {
    if (keypoint.score >= minConfidence) {
      const { y, x } = keypoint.position;
      ctx.beginPath();
      ctx.arc(x * scale, y * scale, 3, 0, 2 * Math.PI);
      // ctx.fillStyle = skeletonColor;
      ctx.fillStyle = "rgba(0, 255, 255, 0.5)";
      ctx.fill();
    }
  });
}

function toTuple({ y, x }) {
  return [y, x];
}

function drawSegment([ay, ax], [by, bx], color, lineWidth, scale, ctx) {
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.lineWidth = lineWidth;
  // ctx.strokeStyle = color;
  ctx.strokeStyle = "rgba(0, 255, 255, 0.5)";
  ctx.stroke();
}

export function drawSkeleton(
  keypoints,
  minConfidence,
  color,
  lineWidth,
  ctx,
  scale = 1
) {
  const adjacentKeyPoints = posenet.getAdjacentKeyPoints(
    keypoints,
    minConfidence
  );

  adjacentKeyPoints.forEach(keypoints => {
    drawSegment(
      toTuple(keypoints[0].position),
      toTuple(keypoints[1].position),
      color,
      lineWidth,
      scale,
      ctx
    );
  });
}

export function drawShoulderAlignmentLines(
  startingAvgLeftShoulderX,
  startingAvgRightShoulderX,
  currentLeftShoulderX,
  currentRightShoulderX,
  ctx,
  canvasHeight
) {

  // Change the value added to determine the distance from the avg starting
  // position the line should be drawn from the left shoulder.
  ctx.beginPath();
  ctx.moveTo(startingAvgLeftShoulderX + 20, 0);
  ctx.lineTo(startingAvgLeftShoulderX + 20, canvasHeight);
  if (currentLeftShoulderX > startingAvgLeftShoulderX + 20) {
    ctx.strokeStyle = "red";
  } else {
    ctx.strokeStyle = "green";
  }
  ctx.stroke();

  // Change the value subtracted to determine the distance from the avg starting
  // position the line should be drawn from the right shoulder.
  ctx.beginPath();
  ctx.moveTo(startingAvgRightShoulderX - 20, 0);
  ctx.lineTo(startingAvgRightShoulderX - 20, canvasHeight);
  if (currentRightShoulderX < startingAvgRightShoulderX - 20) {
    ctx.strokeStyle = "red";
  } else {
    ctx.strokeStyle = "green";
  }
  ctx.stroke();
}

export function drawSquatDepthLine(
  startingAvgLeftKneeY,
  currentLeftHipY,
  ctx,
  canvasWidth
) {
  ctx.beginPath();
  ctx.moveTo(0, startingAvgLeftKneeY - 20);
  ctx.lineTo(600, startingAvgLeftKneeY - 20);
  if (currentLeftHipY < startingAvgLeftKneeY - 20) {
    ctx.strokeStyle = "red";
  } else {
    ctx.strokeStyle = "green";
  }
  ctx.stroke();
}
