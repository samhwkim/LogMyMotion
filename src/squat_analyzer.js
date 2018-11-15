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

let rightElbowX = 0;
let rightElbowY = 0;

let rightWristX = 0;
let rightWristY = 0;

let shoulderToElbowDistance = 0;
let elbowToWristDistance = 0;
let shoulderToWristDistance = 0;

let armAngle = 0;

function setup() {
  videoIsPlaying = false;
  createCanvas(1080, 720);
  video = createVideo('straightarm.mp4', vidLoad);
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

        // Right shoulder coordinates
        if(j == 6) {
          rightShoulderX = keypoint.position.x;
          rightShoulderY = keypoint.position.y;
        }

        // Right elbow coordinates
        if(j == 8) {
          rightElbowX = keypoint.position.x;
          rightElbowY = keypoint.position.y;
        }

        // Right wrist coordinates
        if(j == 10) {
          rightWristX = keypoint.position.x;
          rightWristY = keypoint.position.y;
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

        // This is where we're setting the bounds of our cue.
        // If the angle is between 140 and 180 degrees then we're good.
        // For other cues we'll experiment what a good range is for each
        // grade. We'll have to get creative for some of our cues.
        if(armAngle > 140 && armAngle < 180) {
          console.log("STRAIGHTISH");
        } else {
          console.log("BENT");
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
