"use strict";

import { config } from "./config.js";
import { util } from "./util.js";
import { Obstacle } from "./obstacle.js";
import { Player } from "./player.js";

export default function sketch(p) {
  let speedOfObstacles = config.initialSpeedOfObstacles;
  let numberOfObstacles = 0;

  let isStarted = false;
  let isFinished = false;
  let isStopped = false;
  let startedAt = null;
  let finishedAt = null;
  let blastRadius = 20;
  let useDeviceOrientation = false;
  let easeStep = 20;
  let collisionPoint = {};
  let highScore = 0;
  let secondsPassed = 0;

  let increaseDifficultyInterval = null;

  let obstacles = [];
  let player;

  let obstacleImage;
  let playerImage;

  let lostSound;

  let menuElement;
  let scoreElement;
  let newRecordElement;
  let playButton;

  p.preload = function () {
    loadImages();
    loadSounds();
  };

  p.setup = function () {
    p.createCanvas(config.canvasWidth, config.canvasHeight);
    prepare();
    reset();
    console.log(playerImage.width);
    drawBackground();
    drawPlayer();
    drawObstacles();
  };

  p.draw = function () {
    p.frameRate(config.framesPerSecond);
    drawBackground();
    if (!isStopped && isStarted) {
      updateObstacles();
    }
    if (isFinished && !isStopped) {
      drawBlast();
      increaseBlastRadius();
    } else {
      updatePlayer();
      checkObstaclesHit();
    }
    checkStopped();
    drawPlayer();
    drawObstacles();
  };

  function loadImages() {
    playerImage = p.loadImage("images/player.svg");
    obstacleImage = p.loadImage("images/obstacle.svg");
  }

  function loadSounds() {
    lostSound = p.loadSound("sounds/lost.mp3");
  }

  function prepare() {
    if (window.DeviceOrientationEvent && util.isTouchDevice()) {
      useDeviceOrientation = true;
    }
    highScore = JSON.parse(localStorage.getItem("highScore"));
    if (highScore === null) {
      highScore = 0;
      localStorage.setItem("highScore", JSON.stringify(highScore));
    }
    menuElement = document.getElementById("menu");
    scoreElement = document.getElementById("score");
    newRecordElement = document.getElementById("new-record");
    playButton = document.getElementById("play");
    playButton.addEventListener("click", function (e) {
      e.stopPropagation();
      menuElement.classList.add("hidden");
      p.loop();
      reset();
    });
  }

  function reset() {
    p.loop();
    numberOfObstacles = Math.max(
      1,
      config.initialObstaclesDensity * config.canvasWidth * config.canvasHeight
    );
    isStarted = false;
    isFinished = false;
    isStopped = false;
    startedAt = null;
    finishedAt = null;
    blastRadius = 20;
    collisionPoint = {};
    secondsPassed = 0;
    newRecordElement.classList.add("hidden");
    clearInterval(increaseDifficultyInterval);
    generatePlayer();
    generateObstacles();
  }

  p.mousePressed = function (event) {
    if (!isStarted && event.button == 0) {
      start();
    }
  };

  function start() {
    isStarted = true;
    startedAt = new Date();
    increaseDifficultyInterval = setInterval(function () {
      increaseDifficulty();
      console.log("Difficulty increased!");
    }, 5000);
  }

  function generatePlayer() {
    player = new Player({
      p: p,
      image: playerImage,
      x: config.canvasWidth / 2,
      y: config.canvasHeight / 2,
    });
  }

  function generateObstacles() {
    obstacles = [];
    for (let i = 0; i < numberOfObstacles; i++) {
      let randomAngle = Math.random() * 2 * Math.PI;
      obstacles.push(
        new Obstacle({
          p: p,
          speed: speedOfObstacles,
          image: obstacleImage,
          x: util.generateRandomInteger(
            0,
            config.canvasWidth - obstacleImage.width
          ),
          y: util.generateRandomInteger(
            0,
            config.canvasHeight - obstacleImage.height
          ),
          deltaX: Math.cos(randomAngle) * speedOfObstacles,
          deltaY: Math.sin(randomAngle) * speedOfObstacles,
        })
      );
    }
  }

  function drawBackground() {
    p.background(p.color(config.backgroundColor));
  }

  function drawPlayer() {
    player.draw();
  }

  function drawObstacles() {
    for (let obstacle of obstacles) {
      obstacle.draw();
    }
  }

  function drawBlast() {
    p.stroke("rgba(0,0,0,0.9)");
    p.circle(collisionPoint.x, collisionPoint.y, blastRadius);
  }

  function updatePlayer() {
    if (useDeviceOrientation) {
      player.update({ deltaX: rotationX, deltaY: rotationY });
    } else {
      player.update({ centerX: p.mouseX, centerY: p.mouseY });
    }
  }

  function updateObstacles() {
    for (let obstacle of obstacles) {
      obstacle.update();
    }
  }

  function checkObstaclesHit() {
    if (!isStarted) {
      return;
    }
    for (let obstacle of obstacles) {
      if (obstacle.checkHit(player)) {
        collisionPoint.x = player.location.x + player.width / 2;
        collisionPoint.y = player.location.y + player.height / 2;
        setGameOver();
      }
    }
  }

  function setGameOver() {
    lostSound.play();
    //p.noLoop();
    isFinished = true;
    finishedAt = new Date();
    secondsPassed = util.calculateTimeDifferenceInSeconds(
      startedAt,
      finishedAt
    );
    scoreElement.innerText = secondsPassed.toFixed(2);
    updateHighScore();
    menuElement.classList.remove("hidden");
  }

  function updateHighScore() {
    if (highScore < secondsPassed) {
      highScore = secondsPassed;
      localStorage.setItem("highScore", JSON.stringify(highScore));
      newRecordElement.classList.remove("hidden");
    }
  }

  function increaseBlastRadius() {
    if (blastRadius > 2 * Math.max(config.canvasWidth, config.canvasHeight)) {
      return;
    }
    blastRadius *= 1.1;
    easeOutObstacles();
  }

  function easeOutObstacles() {
    for (let obstacle of obstacles) {
      if (
        obstacle.calculateDistance(collisionPoint) <= blastRadius &&
        !obstacle.isEasingOut
      ) {
        obstacle.easeOut();
      }
    }
  }

  function checkStopped() {
    let allAreStopped = true;
    for (let obstacle of obstacles) {
      if (obstacle.deltaX !== 0) {
        allAreStopped = false;
      }
    }
    if (allAreStopped) {
      isStopped = true;
      p.noLoop();
    }
  }

  function increaseDifficulty() {
    for (let obstacle of obstacles) {
      obstacle.increaseSpeed();
    }
  }
}
