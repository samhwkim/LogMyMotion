let poseNet;
let poses = [];

let video;
var videoIsPlaying;
let frameCounter = 0;


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

function setup() {
  videoIsPlaying = false;
  createCanvas(1080, 720);
  video = createVideo('Videos/squat_deep.mp4', vidLoad);
  video.size(width, height);
  video.onended = function() {
    videoIsPlaying = false;
  }

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
  if(videoIsPlaying == true) {
    analyzeFrame();
  }

  // We can call both functions to draw all keypoints and the skeletons
  //drawKeypoints();
  drawSkeleton();
}

function analyzeFrame()  {
  for (let i = 0; i < poses.length; i++) {

    let pose = poses[i].pose;

    // if (frameCounter % 50 == 0) {
    //   console.log(frameCounter);
      //analyzeFeetWidth(pose)
      analyzeSquatDepth(pose)
      //analyzeShoulderAlignment(pose)
    // }

    noStroke();
    fill(255, 0, 0);
    ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
    //}
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
    frameCounter = 0;
    video.loop();
    videoIsPlaying = true;
  }
}
