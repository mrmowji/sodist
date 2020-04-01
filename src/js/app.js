const DIFFICULTY = {
  EASY: {
    title: "easy",
    obstaclesDensity: 4 / 2000,
    sizeOfObstacles: 30,
    speedOfObstacles: 5
  },
  MEDIUM: {
    title: "medium",
    obstaclesDensity: 5 / 2000,
    sizeOfObstacles: 30,
    speedOfObstacles: 6
  },
  HARD: {
    title: "hard",
    obstaclesDensity: 7 / 2000,
    sizeOfObstacles: 30,
    speedOfObstacles: 7
  }
};

const RELIC_TYPE = {
  ICE: "ice",
  FIRE: "fire"
};

let app = new Vue({
  el: "#app",
  data: {
    canvas: null,
    context: null,
    width: 1000,
    height: 500,
    fps: 60,
    timer: null,
    prestartTimer: null,
    obstacles: [],
    difficulty: DIFFICULTY.MEDIUM,
    isStarted: false,
    isFinished: false,
    isStopped: false,
    startedAt: null,
    finishedAt: null,
    usesDeviceOrientation: false,
    rotation: {
      beta: 0,
      gamma: 0,
      alpha: 0
    },
    dpr: 1,
    easeStep: 20,
    radius: 20,
    collisionPoint: null,
    highScores: {},
    relic: null,
    isANewRecord: false,
    player: {
      x: 0,
      y: 0,
      width: 30,
      height: 30,
      color: "#ff0000"
    },
    animation: function(o) {
      return {
        x: o.x + o.deltaX,
        y: o.y + o.deltaY
      };
    }
  },
  computed: {
    timeSpent: function() {
      if (this.finishedAt !== null) {
        return (this.finishedAt - this.startedAt) / 1000;
      }
      return 0;
    }
  },
  mounted: function() {
    if (window.DeviceOrientationEvent && this.isTouchDevice()) {
      this.usesDeviceOrientation = true;
      window.addEventListener("deviceorientation", this.rotateDevice);
    }
    this.dpr = window.devicePixelRatio || 1;
    this.highScores = JSON.parse(localStorage.getItem("highScores"));
    if (this.highScores === null) {
      this.highScores = {
        easy: 0,
        medium: 0,
        hard: 0
      };
      localStorage.setItem("highScores", JSON.stringify(this.highScores));
    }
    this.canvas = document.getElementsByTagName("canvas")[0];
    this.context = this.canvas.getContext("2d");
    this.width = document.body.clientWidth;
    this.height = document.body.clientHeight;
    this.fixDpr();
    Vue.nextTick(() => {
      this.reset();
    });
  },
  methods: {
    reset: function() {
      clearInterval(this.timer);
      this.timer = null;
      this.prestartTimer = null;
      this.isStarted = false;
      this.isFinished = false;
      this.isStopped = false;
      this.startedAt = null;
      this.finishedAt = null;
      this.radius = 20;
      this.collisionPoint = null;
      this.obstacles = [];
      for (let i = 0; i < (this.difficulty.obstaclesDensity / 100) * (this.width * this.height); i++) {
        let randomAngle = Math.random() * 2 * Math.PI;
        this.obstacles.push({
          width: this.difficulty.sizeOfObstacles,
          height: this.difficulty.sizeOfObstacles,
          x: Math.floor(
            Math.random() * (this.width - this.difficulty.sizeOfObstacles)
          ),
          y: Math.floor(
            Math.random() * (this.height - this.difficulty.sizeOfObstacles)
          ),
          deltaX: Math.cos(randomAngle) * this.difficulty.speedOfObstacles,
          deltaY: Math.sin(randomAngle) * this.difficulty.speedOfObstacles
        });
      }
      this.prestartTimer = setInterval(() => {
        this.draw();
      }, 1000 / this.fps);
    },
    start: function() {
      if (!this.isStarted) {
        this.isANewRecord = false;
        clearInterval(this.prestartTimer);
        this.isStarted = true;
        this.isFinished = false;
        this.startedAt = performance.now();
        this.finishedAt = null;
        this.timer = setInterval(() => {
          this.draw();
          this.update();
        }, 1000 / this.fps);
      }
    },
    update: function() {
      let isMoved = false;
      for (let obstacle of this.obstacles) {
        if (this.isFinished) {
          if (
            Math.sqrt(
              (obstacle.x - this.collisionPoint.x) ** 2 +
                (obstacle.y - this.collisionPoint.y) ** 2
            ) <= this.radius
          ) {
            obstacle.deltaX *= this.easeStep / (this.easeStep + 1);
            obstacle.deltaY *= this.easeStep / (this.easeStep + 1);
          }
        }
        let newPosition = this.animation(obstacle);
        if (
          Math.floor(obstacle.x) != Math.floor(newPosition.x) ||
          Math.floor(obstacle.y) != Math.floor(newPosition.y)
        ) {
          isMoved = true;
        } else {
          continue;
        }
        obstacle.x = newPosition.x;
        obstacle.y = newPosition.y;
        if (
          (obstacle.x + obstacle.width >= this.width && obstacle.deltaX > 0) ||
          (obstacle.x <= 0 && obstacle.deltaX < 0)
        ) {
          obstacle.deltaX *= -1;
        }
        if (
          (obstacle.y + obstacle.height >= this.height &&
            obstacle.deltaY > 0) ||
          (obstacle.y <= 0 && obstacle.deltaY < 0)
        ) {
          obstacle.deltaY *= -1;
        }
      }
      if (this.usesDeviceOrientation) {
        this.player.x += this.rotation.gamma;
        if (this.player.x + this.player.width > this.width) {
          this.player.x = this.width - this.player.width;
        }
        if (this.player.x < 0) {
          this.player.x = 0;
        }
        this.player.y += this.rotation.beta;
        if (this.player.y + this.player.height > this.height) {
          this.player.y = this.height - this.player.height;
        }
        if (this.player.y < 0) {
          this.player.y = 0;
        }
      }
      this.checkHit();
      if (this.isFinished) {
        if (this.finishedAt === null) {
          this.finishedAt = performance.now();
          if (this.highScores[this.difficulty.title] < this.timeSpent) {
            this.highScores[this.difficulty.title] = this.timeSpent;
            localStorage.setItem("highScores", JSON.stringify(this.highScores));
            this.isANewRecord = true;
          }
        }
        this.radius *= 1.1;
      }
      if (!isMoved) {
        clearInterval(this.timer);
      }
    },
    draw: function() {
      this.context.clearRect(0, 0, this.width, this.height);
      if (this.isFinished) {
        this.context.strokeStyle = "rgba(0,0,0,0.9)";
        this.context.beginPath();
        this.context.arc(
          this.collisionPoint.x,
          this.collisionPoint.y,
          this.radius,
          0,
          2 * Math.PI
        );
        this.context.stroke();
      }
      for (let obstacle of this.obstacles) {
        this.context.fillStyle = "rgb(0,0,0)";
        this.context.beginPath();
        this.context.arc(
          obstacle.x + obstacle.width / 2,
          obstacle.y + obstacle.height / 2,
          obstacle.width / 2,
          0,
          2 * Math.PI
        );
        this.context.fill();
      }
      this.context.fillStyle = this.player.color;
      this.context.beginPath();
      this.context.arc(
        this.player.x + this.player.width / 2,
        this.player.y + this.player.height / 2,
        this.player.width / 2,
        0,
        2 * Math.PI
      );
      this.context.fill();
    },
    moveTarget: function(e) {
      if (this.usesDeviceOrientation) {
        return;
      } else {
        if (!this.checkHit() && !this.isFinished) {
          this.player.x =
            e.clientX + this.player.width > this.width
              ? this.width - this.player.width
              : e.clientX;
          this.player.y =
            e.clientY + this.player.height > this.height
              ? this.height - this.player.height
              : e.clientY;
        }
      }
    },
    rotateDevice: function(e) {
      if (!this.checkHit() && !this.isFinished) {
        this.rotation.beta = e.beta;
        this.rotation.gamma = e.gamma;
        this.rotation.alpha = e.alpha;
      }
    },
    checkHit: function() {
      if (!this.isStarted) {
        return false;
      }
      for (let obstacle of this.obstacles) {
        if (
          obstacle.x <= this.player.x + this.player.width &&
          obstacle.x >= this.player.x - this.player.width &&
          obstacle.y <= this.player.y + this.player.height &&
          obstacle.y >= this.player.y - this.player.height
        ) {
          this.isStarted = false;
          this.isFinished = true;
          this.collisionPoint = {
            x: (obstacle.x + this.player.x) / 2,
            y: (obstacle.y + this.player.y) / 2
          };
          return true;
        }
      }
      return false;
    },
    isTouchDevice: function() {
      var prefixes = " -webkit- -moz- -o- -ms- ".split(" ");
      var mq = function(query) {
        return window.matchMedia(query).matches;
      };
      if (
        "ontouchstart" in window ||
        (window.DocumentTouch && document instanceof DocumentTouch)
      ) {
        return true;
      }

      // include the 'heartz' as a way to have a non matching MQ to help terminate the join
      // https://git.io/vznFH
      var query = ["(", prefixes.join("touch-enabled),("), "heartz", ")"].join(
        ""
      );
      return mq(query);
    },
    fixDpr: function() {
      //console.log(+getComputedStyle(this.canvas).getPropertyValue("width"));
      /*this.width *= this.dpr;
      this.height *= this.dpr;*/
      Vue.nextTick(() => {
        this.context.scale(this.dpr, this.dpr);
      });
    }
  }
});
