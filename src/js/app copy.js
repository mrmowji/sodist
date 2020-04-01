const DIFFICULTY = {
  EASY: {
    numberOfObstacles: 20,
    sizeOfObstacles: 30,
    speedOfObstacles: 5
  },
  MEDIUM: {
    numberOfObstacles: 20,
    sizeOfObstacles: 30,
    speedOfObstacles: 10
  },
  HARD: {
    numberOfObstacles: 20,
    sizeOfObstacles: 50,
    speedOfObstacles: 20
  }
};

const RELIC_TYPE = {
  ICE: "ice",
  FIRE: "fire",
};

let app = new Vue({
  el: "#app",
  data: {
    canvas: null,
    context: null,
    fps: 20,
    obstacles: [],
    target: {},
    difficulty: DIFFICULTY.EASY,
    isStarted: false,
    isFinished: false,
    startedAt: null,
    finishedAt: null,
    easeStep: 20,
    radius: 20,
    collisionPoint: null,
    relic: null,
    animation: function(o) {
      return {
        x: o.x + o.deltaX,
        y: o.y + o.deltaY
      };
    },
  },
  mounted: function() {
    this.canvas = document.getElementsByTagName("canvas")[0];
    this.context = this.canvas.getContext("2d");
    for (let i = 0; i < this.difficulty.numberOfObstacles; i++) {
      let randomAngle = Math.random() * 2 * Math.PI;
      this.obstacles.push({
        width: this.difficulty.sizeOfObstacles,
        height: this.difficulty.sizeOfObstacles,
        x: Math.floor(Math.random() *
            (document.body.clientWidth - this.difficulty.sizeOfObstacles)),
        y: Math.floor(Math.random() *
            (document.body.clientHeight - this.difficulty.sizeOfObstacles)),
        deltaX: Math.cos(randomAngle) * this.difficulty.speedOfObstacles,
        deltaY: Math.sin(randomAngle) * this.difficulty.speedOfObstacles
      });
    }
  },
  methods: {
    start: function() {
      if (!this.isStarted) {
        setTimeout(this.showRelic, 15000);
        this.isStarted = true;
        this.isFinished = false;
        this.startedAt = performance.now();
        this.finishedAt = null;
        requestAnimationFrame(this.moveObstacles);
      }
    },
    moveObstacles: function() {
      let isMoved = false;
      for (let obstacle of this.obstacles) {
        if (this.isFinished) {
          if (Math.sqrt((obstacle.x - this.collisionPoint.x) ** 2 +
                        (obstacle.y - this.collisionPoint.y) ** 2) <= this.radius) {
          obstacle.deltaX *= this.easeStep / (this.easeStep + 1);
          obstacle.deltaY *= this.easeStep / (this.easeStep + 1);
                        }
        }
        let newPosition = this.animation(obstacle);
        if (Math.floor(newPosition.x) != Math.floor(obstacle.x) ||
            Math.floor(newPosition.y) != Math.floor(obstacle.y)) {
          isMoved = true;
        } else {
          continue;
        }
        obstacle.x = newPosition.x;
        obstacle.y = newPosition.y;
        if ((obstacle.x + obstacle.width >= document.body.clientWidth && obstacle.deltaX > 0) ||
            (obstacle.x <= 0 && obstacle.deltaX < 0)) {
          obstacle.deltaX *= -1;
        }
        if ((obstacle.y + obstacle.height >= document.body.clientHeight && obstacle.deltaY > 0) ||
            (obstacle.y <= 0 && obstacle.deltaY < 0)) {
          obstacle.deltaY *= -1;
        }
      }
      this.checkHit();
      if (this.isFinished) {
        this.radius *= 1.1;
      }
      if (isMoved) {
        requestAnimationFrame(this.moveObstacles);
      } else {
        this.finishedAt = performance.now();
      }
    },
    moveTarget: function(e) {
      if (!this.checkHit() && !this.isFinished) {
        this.target = {
          width: 20,
          height: 20,
          x: (e.clientX + 20 > document.body.clientWidth ? document.body.clientWidth - 20 : e.clientX),
          y: (e.clientY + 20 > document.body.clientHeight ? document.body.clientHeight - 20 : e.clientY),
        };
      }
    },
    checkHit: function() {
      if (!this.isStarted) {
        return false;
      }
      for (let obstacle of this.obstacles) {
        if (
          obstacle.x <= this.target.x + this.target.width &&
          obstacle.x >= this.target.x - this.target.width &&
          obstacle.y <= this.target.y + this.target.height &&
          obstacle.y >= this.target.y - this.target.height
        ) {
          this.isStarted = false;
          this.isFinished = true;
          this.collisionPoint = {
            x: (obstacle.x + this.target.x) / 2,
            y: (obstacle.y + this.target.y) / 2
          }
          return true;
        }
      }
      return false;
    },
    showRelic: function() {
      this.relic = {
        width: 40,
        height: 40,
        x: Math.floor(Math.random() *
            (document.body.clientWidth - 40)),
        y: Math.floor(Math.random() *
            (document.body.clientHeight - 40)),
        type: Math.floor(Math.random() * 2) == 0 ? RELIC_TYPE.ICE : RELIC_TYPE.FIRE,
      };
    }
  }
});
