import { config } from "./config.js";
import { util } from "./util.js";

function Obstacle(options) {
  this.p = options.p;
  this.image = options.image;
  this.location = {
    x: options.x,
    y: options.y,
  };
  this.deltaX = options.deltaX;
  this.deltaY = options.deltaY;
  this.speed = options.speed;
  this.hit = false;
  this.isHitOver = true;
  this.width = this.image.width;
  this.height = this.image.height;
  this.easeStep = 20;
  this.isEasingOut = false;

  this.update = () => {
    if (this.isEasingOut) {
      this.deltaX *= this.easeStep / (this.easeStep + 1);
      this.deltaY *= this.easeStep / (this.easeStep + 1);
      if (Math.abs(this.deltaX) < 0.1) {
        this.deltaX = 0;
      }
      if (Math.abs(this.deltaY) < 0.1) {
        this.deltaY = 0;
      }
    }
    if (this.deltaX === 0 && this.deltaY === 0) {
      return;
    }
    this.location.x += this.deltaX;
    this.location.y += this.deltaY;
    if (
      (this.location.x + this.width >= config.canvasWidth && this.deltaX > 0) ||
      (this.location.x <= 0 && this.deltaX < 0)
    ) {
      this.deltaX *= -1;
    }
    if (
      (this.location.y + this.height >= config.canvasHeight &&
        this.deltaY > 0) ||
      (this.location.y <= 0 && this.deltaY < 0)
    ) {
      this.deltaY *= -1;
    }
  };

  this.increaseSpeed = () => {
    this.speed *= 1.05;
    this.deltaX *= 1.05;
    this.deltaY *= 1.05;
  };

  this.calculateDistance = (location) => {
    return Math.sqrt(
      (this.location.x - location.x) ** 2 + (this.location.y - location.y) ** 2
    );
  };

  this.easeOut = () => {
    this.isEasingOut = true;
  };

  this.draw = () => {
    this.p.image(
      this.image,
      this.location.x,
      this.location.y,
      this.width,
      this.height
    );
  };

  this.setHit = () => {
    this.hit = true;
  };

  this.checkHit = (otherObject) => {
    if (
      this.location.x <= otherObject.location.x + otherObject.width &&
      this.location.x >= otherObject.location.x - otherObject.width &&
      this.location.y <= otherObject.location.y + otherObject.height &&
      this.location.y >= otherObject.location.y - otherObject.height
    ) {
      return true;
    }
    return false;
  };
}

export { Obstacle };
