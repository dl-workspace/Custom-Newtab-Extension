window.loadAutoHideModule = function(e) {
  if (e.autoHideThread) clearTimeout(e.autoHideThread);
  e.autoHideThread = null;

  function t() {
      clearTimeout(e.autoHideThread);
      e.autoHideThread = setTimeout(n, 1e4)
  }

  function n() {
      if ($("#background_selector_widget").css("display") == "none") {
          $("#wrapper").fadeOut(1e3)
      }
  }

  function a() {
      $("#wrapper").fadeIn(1e3);
      t()
  }

  function s() {
      e.listAllThreads.threadAutoHide = {
          pause: function() {
              clearTimeout(e.autoHideThread);
              n()
          },
          resume: function() {
              a()
          }
      };
      t();
      $("body").off("mousemove", a);
      $("input[type=text]").off("focus", i);
      $("input[type=search]").off("keypress", i);
      $("input[type=text], input[type=search]").off("focusout", s);
      $("body").on("mousemove", a);
      $("input[type=text]").on("focus", i);
      $("input[type=search]").on("keypress", i);
      $("input[type=text], input[type=search]").on("focusout", s)
  }

  function i() {
      clearTimeout(e.autoHideThread);
      $("body").off("mousemove", a);
      $("input[type=text]").off("focus", i);
      $("input[type=search]").off("keypress", i);
      $("input[type=text], input[type=search]").off("focusout", s)
  }
  if (localStorage.getItem("enable_autohide") == "yes") {
      s()
  } else {
      i()
  }
  $("#enable_autohide").prop("checked", localStorage.getItem("enable_autohide") === "yes");
  $("#enable_autohide").off("change");
  $("#enable_autohide").on("change", function() {
      localStorage.setItem("enable_autohide", $("#enable_autohide").is(":checked") ? "yes" : "no");
      if ($("#enable_autohide").is(":checked")) {
          s()
      } else {
          i()
      }
      browser.runtime.sendMessage({
          changeOptions: utils.getGlobalOptions()
      })
  })
};
window.requestAnimFrame = function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(e) {
      window.setTimeout(e, 1e3 / 24)
  }
}();
window.pausedAnimation = false;
var startedFireworks = false;
window.stopFireworksCanvas = function() {
  var e = document.getElementById("fireworks-canvas");
  if (e) e.parentNode.removeChild(e);
  startedFireworks = false;
  window.pausedAnimation = false;
  if (localStorage.getItem("snow_type") == "rain") startRainCanvas()
};
window.startFireworksCanvas = function() {
  if (startedFireworks) return;
  startedFireworks = true;
  if (localStorage.getItem("snow_type") == "rain") stopRainCanvas();
  var e = document.getElementById("fireworks-canvas");
  if (e) e.parentNode.removeChild(e);
  e = document.createElement("canvas");
  e.id = "fireworks-canvas";
  e.style.zIndex = "99999";
  e.style.display = "block";
  document.body.appendChild(e);
  var t = e.getContext("2d"),
      n = window.innerWidth,
      a = window.innerHeight,
      s = [],
      i = [],
      o = 120,
      r = 5,
      d = 0,
      h = 50,
      u = 0,
      l = false,
      p, c;
  e.width = n;
  e.height = a;

  function f(e, t) {
      return Math.random() * (t - e) + e
  }

  function w(e, t, n, a) {
      var s = e - n,
          i = t - a;
      return Math.sqrt(Math.pow(s, 2) + Math.pow(i, 2))
  }

  function m(e, t, n, a) {
      this.x = e;
      this.y = t;
      this.sx = e;
      this.sy = t;
      this.tx = n;
      this.ty = a;
      this.distanceToTarget = w(e, t, n, a);
      this.distanceTraveled = 0;
      this.coordinates = [];
      this.coordinateCount = 3;
      while (this.coordinateCount--) {
          this.coordinates.push([this.x, this.y])
      }
      this.angle = Math.atan2(a - t, n - e);
      this.speed = 2.5;
      this.acceleration = 1.1;
      this.brightness = f(50, 80);
      this.targetRadius = 1
  }
  m.prototype.update = function(e) {
      this.coordinates.pop();
      this.coordinates.unshift([this.x, this.y]);
      if (this.targetRadius < 8) {
          this.targetRadius += .3
      } else {
          this.targetRadius = 1
      }
      this.speed *= this.acceleration;
      var t = Math.cos(this.angle) * this.speed,
          n = Math.sin(this.angle) * this.speed;
      this.distanceTraveled = w(this.sx, this.sy, this.x + t, this.y + n);
      if (this.distanceTraveled >= this.distanceToTarget) {
          y(this.tx, this.ty);
          s.splice(e, 1)
      } else {
          this.x += t;
          this.y += n
      }
  };
  m.prototype.draw = function() {
      t.beginPath();
      t.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
      t.lineTo(this.x, this.y);
      t.strokeStyle = "hsl(" + o + ", 100%, " + this.brightness + "%)";
      t.stroke();
      t.beginPath();
      t.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2);
      t.stroke()
  };

  function v(e, t) {
      this.x = e;
      this.y = t;
      this.coordinates = [];
      this.coordinateCount = 5;
      while (this.coordinateCount--) {
          this.coordinates.push([this.x, this.y])
      }
      this.angle = f(0, Math.PI * 2);
      this.speed = f(1, 10);
      this.friction = .95;
      this.gravity = 1;
      this.hue = f(o - 50, o + 50);
      this.brightness = f(50, 80);
      this.alpha = 1;
      this.decay = f(.015, .03)
  }
  v.prototype.update = function(e) {
      this.coordinates.pop();
      this.coordinates.unshift([this.x, this.y]);
      this.speed *= this.friction;
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed + this.gravity;
      this.alpha -= this.decay;
      if (this.alpha <= this.decay) {
          i.splice(e, 1)
      }
  };
  v.prototype.draw = function() {
      t.beginPath();
      t.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
      t.lineTo(this.x, this.y);
      t.strokeStyle = "hsla(" + this.hue + ", 100%, " + this.brightness + "%, " + this.alpha + ")";
      t.stroke()
  };

  function y(e, t) {
      var n = 30;
      while (n--) {
          i.push(new v(e, t))
      }
  }

  function g() {
      if (window.pausedAnimation) {
          if (startedFireworks) window.requestAnimFrame(g);
          return
      }
      o = f(0, 360);
      t.globalCompositeOperation = "destination-out";
      t.fillStyle = "rgba(0, 0, 0, 0.5)";
      t.fillRect(0, 0, n, a);
      t.globalCompositeOperation = "lighter";
      var e = s.length;
      while (e--) {
          s[e].draw();
          s[e].update(e)
      }
      var e = i.length;
      while (e--) {
          i[e].draw();
          i[e].update(e)
      }
      if (u >= h) {
          if (!l) {
              if (s.length < 10) {
                  var w = f(1, 100);
                  if (w < 10) {
                      s.push(new m(n / 2, a, f(n * 16 / 50, n * 18 / 50), f(a * 16 / 50, a * 18 / 50)));
                      s.push(new m(n / 2, a, f(n * 18 / 50, n * 20 / 50), f(a * 18 / 50, a * 20 / 50)));
                      s.push(new m(n / 2, a, f(n * 20 / 50, n * 22 / 50), f(a * 20 / 50, a * 22 / 50)));
                      s.push(new m(n / 2, a, f(n * 22 / 50, n * 24 / 50), f(a * 22 / 50, a * 24 / 50)));
                      s.push(new m(n / 2, a, f(n * 24 / 50, n * 26 / 50), f(a * 24 / 50, a * 26 / 50)));
                      s.push(new m(n / 2, a, f(n * 26 / 50, n * 28 / 50), f(a * 26 / 50, a * 28 / 50)));
                      s.push(new m(n / 2, a, f(n * 28 / 50, n * 30 / 50), f(a * 28 / 50, a * 30 / 50)));
                      s.push(new m(n / 2, a, f(n * 30 / 50, n * 32 / 50), f(a * 30 / 50, a * 32 / 50)));
                      s.push(new m(n / 2, a, f(n * 32 / 50, n * 34 / 50), f(a * 32 / 50, a * 34 / 50)))
                  } else if (w < 20) {
                      s.push(new m(n / 2, a, f(n * 32 / 50, n * 30 / 50), f(a * 16 / 50, a * 18 / 50)));
                      s.push(new m(n / 2, a, f(n * 30 / 50, n * 32 / 50), f(a * 18 / 50, a * 20 / 50)));
                      s.push(new m(n / 2, a, f(n * 28 / 50, n * 30 / 50), f(a * 20 / 50, a * 22 / 50)));
                      s.push(new m(n / 2, a, f(n * 26 / 50, n * 28 / 50), f(a * 22 / 50, a * 24 / 50)));
                      s.push(new m(n / 2, a, f(n * 24 / 50, n * 26 / 50), f(a * 24 / 50, a * 26 / 50)));
                      s.push(new m(n / 2, a, f(n * 22 / 50, n * 24 / 50), f(a * 26 / 50, a * 28 / 50)));
                      s.push(new m(n / 2, a, f(n * 20 / 50, n * 22 / 50), f(a * 28 / 50, a * 30 / 50)));
                      s.push(new m(n / 2, a, f(n * 18 / 50, n * 20 / 50), f(a * 30 / 50, a * 32 / 50)));
                      s.push(new m(n / 2, a, f(n * 16 / 50, n * 18 / 50), f(a * 32 / 50, a * 34 / 50)))
                  } else if (w < 30) {
                      s.push(new m(n / 2, a, f(n * 18 / 50, n * 20 / 50), f(a * 18 / 50, a * 20 / 50)));
                      s.push(new m(n / 2, a, f(n * 20 / 50, n * 22 / 50), f(a * 20 / 50, a * 22 / 50)));
                      s.push(new m(n / 2, a, f(n * 22 / 50, n * 24 / 50), f(a * 22 / 50, a * 24 / 50)));
                      s.push(new m(n / 2, a, f(n * 24 / 50, n * 26 / 50), f(a * 24 / 50, a * 26 / 50)));
                      s.push(new m(n / 2, a, f(n * 26 / 50, n * 28 / 50), f(a * 26 / 50, a * 28 / 50)))
                  } else if (w < 40) {
                      s.push(new m(n / 2, a, f(n * 22 / 50, n * 24 / 50), f(a * 22 / 50, a * 24 / 50)));
                      s.push(new m(n / 2, a, f(n * 24 / 50, n * 26 / 50), f(a * 24 / 50, a * 26 / 50)));
                      s.push(new m(n / 2, a, f(n * 26 / 50, n * 28 / 50), f(a * 26 / 50, a * 28 / 50)));
                      s.push(new m(n / 2, a, f(n * 28 / 50, n * 30 / 50), f(a * 28 / 50, a * 30 / 50)));
                      s.push(new m(n / 2, a, f(n * 30 / 50, n * 32 / 50), f(a * 30 / 50, a * 32 / 50)))
                  } else if (w < 50) {
                      s.push(new m(n / 2, a, f(n * 8 / 50, n * 30 / 50), f(a * 8 / 50, a * 30 / 50)));
                      s.push(new m(n / 2, a, f(n * 10 / 50, n * 32 / 50), f(a * 12 / 50, a * 32 / 50)));
                      s.push(new m(n / 2, a, f(n * 12 / 50, n * 34 / 50), f(a * 12 / 50, a * 34 / 50)));
                      s.push(new m(n / 2, a, f(n * 14 / 50, n * 36 / 50), f(a * 14 / 50, a * 36 / 50)));
                      s.push(new m(n / 2, a, f(n * 16 / 50, n * 38 / 50), f(a * 16 / 50, a * 38 / 50)));
                      s.push(new m(n / 2, a, f(n * 18 / 50, n * 40 / 50), f(a * 18 / 50, a * 40 / 50)));
                      s.push(new m(n / 2, a, f(n * 20 / 50, n * 42 / 50), f(a * 20 / 50, a * 42 / 50)));
                      s.push(new m(n / 2, a, f(n * 20 / 50, n * 42 / 50), f(a * 8 / 50, a * 30 / 50)));
                      s.push(new m(n / 2, a, f(n * 18 / 50, n * 40 / 50), f(a * 10 / 50, a * 32 / 50)));
                      s.push(new m(n / 2, a, f(n * 16 / 50, n * 38 / 50), f(a * 12 / 50, a * 34 / 50)));
                      s.push(new m(n / 2, a, f(n * 14 / 50, n * 36 / 50), f(a * 14 / 50, a * 36 / 50)));
                      s.push(new m(n / 2, a, f(n * 12 / 50, n * 34 / 50), f(a * 16 / 50, a * 38 / 50)));
                      s.push(new m(n / 2, a, f(n * 10 / 50, n * 32 / 50), f(a * 18 / 50, a * 40 / 50)));
                      s.push(new m(n / 2, a, f(n * 8 / 50, n * 30 / 50), f(a * 20 / 50, a * 42 / 50)));
                      s.push(new m(n / 2, a, f(n * 8 / 50, n * 30 / 50), f(a * 8 / 50, a * 30 / 50)));
                      s.push(new m(n / 2, a, f(n * 10 / 50, n * 32 / 50), f(a * 12 / 50, a * 32 / 50)));
                      s.push(new m(n / 2, a, f(n * 12 / 50, n * 34 / 50), f(a * 12 / 50, a * 34 / 50)));
                      s.push(new m(n / 2, a, f(n * 14 / 50, n * 36 / 50), f(a * 14 / 50, a * 36 / 50)));
                      s.push(new m(n / 2, a, f(n * 16 / 50, n * 38 / 50), f(a * 16 / 50, a * 38 / 50)));
                      s.push(new m(n / 2, a, f(n * 18 / 50, n * 40 / 50), f(a * 18 / 50, a * 40 / 50)));
                      s.push(new m(n / 2, a, f(n * 20 / 50, n * 42 / 50), f(a * 20 / 50, a * 42 / 50)));
                      s.push(new m(n / 2, a, f(n * 20 / 50, n * 42 / 50), f(a * 8 / 50, a * 30 / 50)));
                      s.push(new m(n / 2, a, f(n * 18 / 50, n * 40 / 50), f(a * 10 / 50, a * 32 / 50)));
                      s.push(new m(n / 2, a, f(n * 16 / 50, n * 38 / 50), f(a * 12 / 50, a * 34 / 50)));
                      s.push(new m(n / 2, a, f(n * 14 / 50, n * 36 / 50), f(a * 14 / 50, a * 36 / 50)));
                      s.push(new m(n / 2, a, f(n * 12 / 50, n * 34 / 50), f(a * 16 / 50, a * 38 / 50)));
                      s.push(new m(n / 2, a, f(n * 10 / 50, n * 32 / 50), f(a * 18 / 50, a * 40 / 50)));
                      s.push(new m(n / 2, a, f(n * 8 / 50, n * 30 / 50), f(a * 20 / 50, a * 42 / 50)))
                  }
              }
              s.push(new m(n / 2, a, f(n / 6, n * 5 / 6), f(a / 6, a * 5 / 6)));
              u = 0;
              h = f(40, 50)
          }
      } else {
          u++
      }
      if (d >= r) {
          if (l) {
              s.push(new m(n / 2, a, p, c));
              d = 0
          }
      } else {
          d++
      }
      if (startedFireworks) window.requestAnimFrame(g)
  }
  e.addEventListener("mousemove", function(t) {
      p = t.pageX - e.offsetLeft;
      c = t.pageY - e.offsetTop
  });
  e.addEventListener("mousedown", function(e) {
      e.preventDefault();
      l = true
  });
  e.addEventListener("mouseup", function(e) {
      e.preventDefault();
      l = false
  });
  g()
};
var startedSnowCanvas = false;
var stopSnowCanvas = function() {
  var e = document.getElementById("snow-canvas-container");
  if (e) e.parentNode.removeChild(e);
  startedSnowCanvas = false;
  window.pausedAnimation = false
};
var startSnowCanvas = function(e) {
  if (startedSnowCanvas) return;
  startedSnowCanvas = true;
  var t = "&#10052;",
      n = "#0099FF",
      a = 25;
  var s = 50 + Math.random() * 50;
  if (e === "ball") {
      t = "&#x2022;";
      n = "#bbb";
      a = 15;
      s = 100 + Math.random() * 100
  }
  var i = document.getElementById("snow-canvas-container");
  if (i) i.parentNode.removeChild(i);
  i = document.createElement("div");
  i.id = "snow-canvas-container";
  i.innerHTML = `<p class="snowflake" style="color:${n}">${t}</p>`;
  document.body.appendChild(i);
  var o = ["transform", "msTransform", "webkitTransform", "mozTransform", "oTransform"];
  var r = p(o);
  var d = [];
  var h;
  var u;
  var l = false;

  function p(e) {
      for (var t = 0; t < e.length; t++) {
          if (typeof document.body.style[e[t]] != "undefined") {
              return e[t]
          }
      }
      return null
  }

  function c(e, t, n, s) {
      this.element = e;
      this.speed = t;
      this.xPos = n;
      this.yPos = s;
      this.counter = 0;
      this.sign = Math.random() < .5 ? 1 : -1;
      this.element.style.opacity = .3 + Math.random() * .5;
      this.element.style.fontSize = 10 + Math.random() * a + "px"
  }
  c.prototype.update = function() {
      this.counter += this.speed / 5e3;
      this.xPos += this.sign * this.speed * Math.cos(this.counter) / 40;
      this.yPos += Math.sin(this.counter) / 40 + this.speed / 30;
      f(this.element, Math.round(this.xPos), Math.round(this.yPos));
      if (this.yPos > u) {
          this.yPos = -50
      }
  };

  function f(e, t, n) {
      var a = "translate3d(" + t + "px, " + n + "px" + ", 0)";
      e.style[r] = a
  }

  function w() {
      var e = document.querySelector(".snowflake");
      var t = e.parentNode;
      h = document.documentElement.clientWidth;
      u = document.documentElement.clientHeight;
      for (var n = 0; n < s; n++) {
          var a = e.cloneNode(true);
          t.appendChild(a);
          var i = v(50, h);
          var o = v(50, u);
          var r = 10 + Math.random() * 40;
          var l = new c(a, r, i, o);
          d.push(l)
      }
      t.removeChild(e);
      m()
  }

  function m() {
      if (window.pausedAnimation) {
          if (startedSnowCanvas) window.requestAnimFrame(m);
          return
      }
      for (var e = 0; e < d.length; e++) {
          var t = d[e];
          t.update()
      }
      if (l) {
          h = document.documentElement.clientWidth;
          u = document.documentElement.clientHeight;
          for (var e = 0; e < d.length; e++) {
              var t = d[e];
              t.xPos = v(50, h);
              t.yPos = v(50, u)
          }
          l = false
      }
      if (startedSnowCanvas) window.requestAnimFrame(m)
  }

  function v(e, t) {
      return Math.round(-1 * e + Math.random() * (t + 2 * e))
  }

  function y(e) {
      l = true
  }
  window.removeEventListener("resize", y);
  window.addEventListener("resize", y, false);
  w()
};
var startedRainCanvas = false;
var stopRainCanvas = function() {
  var e = document.getElementById("raining-canvas");
  if (e) e.parentNode.removeChild(e);
  var t = document.getElementById("raining-footer");
  if (t) t.parentNode.removeChild(t);
  startedRainCanvas = false;
  window.pausedAnimation = false
};
var startRainCanvas = function() {
  if (startedRainCanvas) return;
  startedRainCanvas = true;
  var e = document.getElementById("raining-canvas");
  if (e) e.parentNode.removeChild(e);
  e = document.createElement("canvas");
  e.id = "raining-canvas";
  e.style.zIndex = "99999";
  e.style.display = "block";
  document.body.appendChild(e);
  var t = document.getElementById("raining-footer");
  if (t) t.parentNode.removeChild(t);
  t = document.createElement("div");
  t.id = "raining-footer";
  document.body.appendChild(t);
  e.width = window.innerWidth + window.innerHeight / 5;
  e.height = window.innerHeight - 30;
  if (e.getContext) {
      var n = e.getContext("2d");
      var a = e.width;
      var s = e.height;
      n.strokeStyle = "rgba(174,194,224,0.6)";
      n.lineWidth = 1;
      n.lineCap = "round";
      var i = [];
      var o = 300 + Math.random() * 300;
      for (var r = 0; r < o; r++) {
          i.push({
              x: Math.random() * a,
              y: Math.random() * s,
              l: Math.random() * 2,
              xs: -6 + Math.random() * 2,
              ys: Math.random() * 5 + 15
          })
      }
      var d = [];
      for (var h = 0; h < o; h++) {
          d[h] = i[h]
      }

      function u() {
          for (var e = 0; e < d.length; e++) {
              var t = d[e];
              t.x += t.xs;
              t.y += t.ys;
              if (t.x > a || t.y > s) {
                  t.x = Math.random() * a;
                  t.y = -20
              }
          }
      }

      function l() {
          if (window.pausedAnimation) {
              if (startedRainCanvas) window.requestAnimFrame(l);
              return
          }
          n.clearRect(0, 0, a, s);
          for (var e = 0; e < d.length; e++) {
              var t = d[e];
              n.beginPath();
              n.moveTo(t.x, t.y);
              n.lineTo(t.x + t.l * t.xs, t.y + t.l * t.ys);
              n.stroke()
          }
          u();
          if (startedRainCanvas) window.requestAnimFrame(l)
      }
      l()
  }
};
var startedLeavesCanvas = false;
var stopLeavesCanvas = function() {
  var e = document.getElementsByClassName("leaf-scene");
  for (var t of e) t.parentNode.removeChild(t);
  startedLeavesCanvas = false;
  window.pausedAnimation = false
};
var startLeavesCanvas = function() {
  if (startedLeavesCanvas) return;
  startedLeavesCanvas = true;
  var e = document.getElementsByClassName("leaf-scene");
  for (var t of e) t.parentNode.removeChild(t);
  var n = document.body;
  var a = document.createElement("div");
  var s = [];
  var i = {
      numLeaves: 20 + Math.random() * 20,
      wind: {
          magnitude: 1.2,
          maxSpeed: 12,
          duration: 100,
          start: 0,
          speed: 0
      }
  };
  var o = n.offsetWidth;
  var r = n.offsetHeight;
  var d = 0;
  var h = function(e) {
      e.x = o * 2 - Math.random() * o * 1.75;
      e.y = -10;
      e.z = Math.random() * 200;
      if (e.x > o) {
          e.x = o + 10;
          e.y = Math.random() * r / 2
      }
      if (d == 0) {
          e.y = Math.random() * r
      }
      e.rotation.speed = Math.random() * 10;
      var t = Math.random();
      if (t > .5) {
          e.rotation.axis = "X"
      } else if (t > .25) {
          e.rotation.axis = "Y";
          e.rotation.x = Math.random() * 180 + 90
      } else {
          e.rotation.axis = "Z";
          e.rotation.x = Math.random() * 360 - 180;
          e.rotation.speed = Math.random() * 3
      }
      e.xSpeedVariation = Math.random() * .8 - .4;
      e.ySpeed = Math.random() + 1.5;
      return e
  };
  var u = function(e) {
      var t = i.wind.speed(d - i.wind.start, e.y);
      var n = t + e.xSpeedVariation;
      e.x -= n;
      e.y += e.ySpeed;
      e.rotation.value += e.rotation.speed;
      var a = "translateX( " + e.x + "px ) translateY( " + e.y + "px ) translateZ( " + e.z + "px )  rotate" + e.rotation.axis + "( " + e.rotation.value + "deg )";
      if (e.rotation.axis !== "X") {
          a += " rotateX(" + e.rotation.x + "deg)"
      }
      e.el.style.webkitTransform = a;
      e.el.style.MozTransform = a;
      e.el.style.oTransform = a;
      e.el.style.transform = a;
      if (e.x < -10 || e.y > r + 10) {
          h(e)
      }
  };
  var l = function() {
      if (d === 0 || d > i.wind.start + i.wind.duration) {
          i.wind.magnitude = Math.random() * i.wind.maxSpeed;
          i.wind.duration = i.wind.magnitude * 50 + (Math.random() * 20 - 10);
          i.wind.start = d;
          var e = r;
          i.wind.speed = function(t, n) {
              var a = this.magnitude / 2 * (e - 2 * n / 3) / e;
              return a * Math.sin(2 * Math.PI / this.duration * t + 3 * Math.PI / 2) + a
          }
      }
  };
  var p = function() {
      for (var e = 0; e < i.numLeaves; e++) {
          var t = {
              el: document.createElement("div"),
              x: 0,
              y: 0,
              z: 0,
              rotation: {
                  axis: "X",
                  value: 0,
                  speed: 0,
                  x: 0
              },
              xSpeedVariation: 0,
              ySpeed: 0,
              path: {
                  type: 1,
                  start: 0
              },
              image: 1
          };
          h(t);
          s.push(t);
          a.appendChild(t.el)
      }
      a.className = "leaf-scene";
      n.appendChild(a);
      a.style.webkitPerspective = "400px";
      a.style.MozPerspective = "400px";
      a.style.oPerspective = "400px";
      a.style.perspective = "400px";
      var d = function(e) {
          o = n.offsetWidth;
          r = n.offsetHeight
      };
      window.removeEventListener("resize", d);
      window.addEventListener("resize", d)
  };
  var c = function() {
      if (window.pausedAnimation) {
          if (startedLeavesCanvas) window.requestAnimFrame(c);
          return
      }
      l();
      for (var e = 0; e < s.length; e++) {
          u(s[e])
      }
      d++;
      if (startedLeavesCanvas) window.requestAnimFrame(c)
  };
  p();
  c()
};
window.loadSnowModule = function(e) {
  e.listAllThreads.threadSnow = {
      pause: function() {
          e.pausedAnimation = true
      },
      resume: function() {
          e.pausedAnimation = false
      }
  };
  var t = function() {
      var t = localStorage.getItem("snow_type");
      if (!t) localStorage.setItem("snow_type", "flake");
      switch (t) {
          case "flake":
          case "ball":
              startSnowCanvas(t);
              break;
          case "rain":
              startRainCanvas();
              break;
          case "leaves":
              startLeavesCanvas();
              break;
          case "fireworks":
              startFireworksCanvas();
              break;
          default:
              t = "flake";
              localStorage.setItem("snow_type", t);
              startSnowCanvas(t)
      }
      e.listAllThreads.threadSnow.resume()
  };
  var n = function() {
      stopSnowCanvas();
      stopRainCanvas();
      stopLeavesCanvas();
      stopFireworksCanvas()
  };
  if (localStorage.getItem("enable_snow") == "yes") {
      n();
      t();
      $("#snow_type").parent().parent().parent().show()
  } else {
      n();
      $("#snow_type").parent().parent().parent().hide()
  }
  $("#enable_snow").prop("checked", localStorage.getItem("enable_snow") === "yes");
  $("#enable_snow").off("change").on("change", function() {
      localStorage.setItem("enable_snow", $("#enable_snow").is(":checked") ? "yes" : "no");
      if ($("#enable_snow").is(":checked")) {
          t();
          $("#snow_type").parent().parent().parent().fadeIn()
      } else {
          n();
          $("#snow_type").parent().parent().parent().fadeOut()
      }
      browser.runtime.sendMessage({
          changeOptions: utils.getGlobalOptions()
      })
  });
  if (localStorage.getItem("snow_type")) {
      $("#snow_type").val(localStorage.getItem("snow_type"))
  }
  $("#snow_type").off("change").on("change", function() {
      var e = $(this).val();
      localStorage.setItem("snow_type", e);
      browser.runtime.sendMessage({
          changeOptions: utils.getGlobalOptions()
      });
      n();
      t();
      browser.runtime.sendMessage({
          name: "click-Snow-" + ("" + e).capitalize()
      })
  })
};