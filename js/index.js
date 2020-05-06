"use strict";

(async () => {
    const { default: sketch } = await import("./sketch.js");
    new p5(sketch);
})();