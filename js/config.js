"use strict";

let config = {
  canvasWidth: document.body.clientWidth,
  canvasHeight: document.body.clientHeight,
  framesPerSecond: 60,
  initialObstaclesDensity: 0.00001,
  initialSpeedOfObstacles: 5,
  backgroundColor: "#ffffff",
};
config.framesTimeInterval = 1 / config.framesPerSecond;

export { config };