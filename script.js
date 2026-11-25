// Live countdowns on the example deals. Purely decorative: they show what a real deal looks like.
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var timers = Array.prototype.slice.call(document.querySelectorAll(".timer[data-seconds]"));
  if (reduce || !timers.length) return;

  function format(total) {
    var h = Math.floor(total / 3600);
    var m = Math.floor((total % 3600) / 60);
    var s = total % 60;
    var two = function (n) { return (n < 10 ? "0" : "") + n; };
    return h > 0 ? h + ":" + two(m) + ":" + two(s) : two(m) + ":" + two(s);
  }

  timers.forEach(function (el) {
    var left = parseInt(el.getAttribute("data-seconds"), 10);
    setInterval(function () {
      left = left > 0 ? left - 1 : parseInt(el.getAttribute("data-seconds"), 10);
      el.textContent = format(left);
    }, 1000);
  });
})();
