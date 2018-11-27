let poseNet;
let poses = [];

let video;
var videoIsPlaying;
let frameCounter = 0;

let feetWidthConfidenceLevel = 0;
let shoulderAlignmentConfidenceLevel = 0;
let squatDepthConfidenceLevel = 0;

let PROPERTIES = {
  imageScaleFactor: 0.5,
  outputStride: 16,
  flipHorizontal: false,
  minConfidence: 0.1,
  scoreThreshold: 0.5,
  nmsRadius: 20,
  detectionType: 'single',
  multiplier: 0.75,
};

function setup() {
  // debugger
  videoIsPlaying = false;
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  // video = createVideo('Videos/squat_deep_resized.mp4', vidLoad);
  video.size(width, height);
  // video.onended = function() {
  //   videoIsPlaying = false;
  // }

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, PROPERTIES, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.detectionType = 'single';
  debugger
  poseNet.on('pose', function(results) {
    poses = results;
  });

  // Hide the video element, and just show the canvas
  video.hide();
}

function modelReady() {
  select('#status').html('Model Loaded');
}

function mousePressed(){
  vidLoad();
}

function draw() {
  image(video, 0, 0, width, height);

  analyzeFrame();
  drawSkeleton();
}

function analyzeFrame()  {
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i].pose;
    if(pose.score > 0.5) {
        // if (analyzeFeetWidth(pose) == true) {
        //   feetWidthConfidenceLevel++;
        // }
        // if (analyzeShoulderAlignment(pose) == true) {
        //   shoulderAlignmentConfidenceLevel++;
        // }
        if (analyzeSquatDepth(pose) == true) {
          squatDepthConfidenceLevel++;
        }

      for (let j = 5; j < pose.keypoints.length; j++) {
        // A keypoint is an object describing a body part (like rightArm or leftShoulder)
        let keypoint = pose.keypoints[j];
        // Only draw an ellipse is the pose probability is bigger than 0.2

        // TODO: CREATE CONFIG FILE
        if (keypoint.score > 0.5) {
          fill(255, 0, 0);
          noStroke();
          ellipse(keypoint.position.x, keypoint.position.y, 8, 8);
          //}
        }
      }
  }
  }
}

function determineGrades() {
  if (feetWidthConfidenceLevel > 5) {
    console.log("FEET WIDTH GOOD")
  }

  else {
    console.log("FEET WIDTH BAD")
  }

  if (shoulderAlignmentConfidenceLevel > 5) {
    console.log("SHOULDER ALIGNMENT GOOD")
  }

  else {
    console.log("SHOULDER ALIGNMENT BAD")
  }

  if (squatDepthConfidenceLevel > 5) {
    console.log("SQUAT DEPTH GOOD")
  }

  else {
    console.log("SQUAT DEPTH BAD")
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    if(poses[i].pose.score > 0.5) {
      for (let j = 0; j < skeleton.length; j++) {
        let partA = skeleton[j][0];
        let partB = skeleton[j][1];
        stroke(255, 0, 0);
        line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
      }
    }
  }
}


// This function is called when the video loads
function vidLoad() {
  video.play();

  //video.stop();
  //video.loop();
  videoIsPlaying = true;
}

function keyPressed(){
  if (videoIsPlaying) {
    video.pause();
    videoIsPlaying = false;
  } else {
    frameCounter = 0;
    video.loop();
    videoIsPlaying = true;
  }
}
