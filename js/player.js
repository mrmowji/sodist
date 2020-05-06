import { config } from "./config.js";

function Player(options) {
  this.p = options.p;
  this.image = options.image;
  this.width = options.image.width;
  this.height = this.image.height;
  this.location = {
    x: options.x,
    y: options.y,
  };
  this.previousLocation = {
    x: this.location.x,
    y: this.location.y,
  };

  this.update = (changes) => {
    this.previousLocation.x = this.location.x;
    this.previousLocation.y = this.location.y;
    if (changes.deltaX !== undefined) {
      this.location.x += changes.deltaX;
    }
    if (changes.deltaY !== undefined) {
      this.location.y += changes.deltaY;
    }
    if (changes.centerX !== undefined) {
      this.location.x = changes.centerX - this.width / 2;
    }
    if (changes.centerY !== undefined) {
      this.location.y = changes.centerY - this.height / 2;
    }
    if (this.location.x + this.width > config.canvasWidth) {
      this.location.x = config.canvasWidth - this.width;
    }
    if (this.location.x < 0) {
      this.location.x = 0;
    }
    if (this.location.y + this.height > config.canvasHeight) {
      this.location.y = config.canvasHeight - this.height;
    }
    if (this.location.y < 0) {
      this.location.y = 0;
    }
  };

  this.draw = () => {
    this.p.image(
      this.image,
      this.location.x,
      this.location.y
    );
  };
}

export { Player };
