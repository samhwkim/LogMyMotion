// Hello.
//
// This is JSHint, a tool that helps to detect errors and potential
// problems in your JavaScript code.
//
// To start, simply enter some JavaScript anywhere on this page. Your
// report will appear on the right side.
//
// Additionally, you can toggle specific options in the Configure
// menu.

let poseNet;
let poses = [];

let video;
var videoIsPlaying;

let PROPERTIES = {
  imageScaleFactor: 0.5,
  outputStride: 16,
  flipHorizontal: false,
  minConfidence: 0.5,
  scoreThreshold: 0.5,
  nmsRadius: 20,
  detectionType: 'single',
  multiplier: 0.75,
};

let rightShoulderX = 0;
let rightShoulderY = 0;

let leftShoulderX = 0;
let leftShoulderY = 0;

function setup() {
  videoIsPlaying = false;
  createCanvas(1080, 720);
  video = createVideo('../Videos/shoulders_misaligned_left.mp4', vidLoad);
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, PROPERTIES, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();
}

function distanceFormula(x1, y1, x2, y2) {
  var result = Math.sqrt(Math.pow(y2-y1, 2) + Math.pow(x2-x1, 2));
  return result;
}

function slopeFormula(x1, y1, x2, y2) {
  var result = Math.abs((y2-y1) / (x2-x1));
  return result
}

function modelReady() {
  select('#status').html('Model Loaded');
}

function mousePressed(){
  vidLoad();
}

function draw() {
  image(video, 0, 0, width, height);

  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  drawSkeleton();
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints()  {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {

        // These if statements grab our coordinates for the joints we want to use in our cue

        // Left shoulder coordinates
        if (j == 5) {
          leftShoulderX = keypoint.position.x;
          leftShoulderY = keypoint.position.y;
        }
        // Right shoulder coordinates
        if (j == 6) {
          rightShoulderX = keypoint.position.x;
          rightShoulderY = keypoint.position.y;
        }

        let shoulderSlope = slopeFormula(leftShoulderX, leftShoulderY, rightShoulderX, rightShoulderY);

        if (shoulderSlope >= 0.1) {
          console.log("TILTED");
        }
        else {
          console.log("STRAIGHT");
        }

      	noStroke();
        fill(255, 0, 0);
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}


// This function is called when the video loads
function vidLoad() {
  video.stop();
  video.loop();
  videoIsPlaying = true;
}

function keyPressed(){
  if (videoIsPlaying) {
    video.pause();
    videoIsPlaying = false;
  } else {
    video.loop();
    videoIsPlaying = true;
  }
}
