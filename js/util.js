const util = {
  generateRandomInteger: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  calculateTimeDifferenceInSeconds: function(startDateTime, endDateTime) {
    if (endDateTime !== null) {
      return (endDateTime - startDateTime) / 1000;
    }
    return NaN;
  },
  isTouchDevice: function() {
    var prefixes = " -webkit- -moz- -o- -ms- ".split(" ");
    var mq = function (query) {
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
};

export { util };