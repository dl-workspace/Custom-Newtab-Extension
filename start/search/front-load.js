(function(e) {
  e.listAllThreads = {};
  e.chosenRandomBG = "";
  var t = [],
      a = [];
  if (localStorage.getItem("backgroundLoaded")) {
      t = JSON.parse(localStorage.getItem("backgroundLoaded"))
  }
  if (localStorage.getItem("exclude_list")) {
      a = JSON.parse(localStorage.getItem("exclude_list"));
      a.forEach(function(e, t) {
          a[t] = Number(e.slice(3, -4))
      })
  }
  e.animations = [{
      value: "fadeIn",
      text: "Fade-In"
  }, {
      value: "pulse",
      text: "Pulse"
  }, {
      value: "bounceInDown",
      text: "Bounce-In-Down"
  }, {
      value: "bounceInLeft",
      text: "Bounce-In-Left"
  }, {
      value: "bounceInRight",
      text: "Bounce-In-Right"
  }, {
      value: "bounceInUp",
      text: "Bounce-In-Up"
  }, {
      value: "fadeInDown",
      text: "Fade-In-Down"
  }, {
      value: "fadeInLeft",
      text: "Fade-In-Left"
  }, {
      value: "fadeInRight",
      text: "Fade-In-Right"
  }, {
      value: "fadeInUp",
      text: "Fade-In-Up"
  }, {
      value: "lightSpeedIn",
      text: "Flip-Speed-In"
  }, {
      value: "rotateInDownLeft",
      text: "Rotate-In-Down-Left"
  }, {
      value: "rotateInDownRight",
      text: "Rotate-In-Down-Right"
  }, {
      value: "rotateInUpLeft",
      text: "Rotate-In-Up-Left"
  }, {
      value: "rotateInUpRight",
      text: "Rotate-In-Up-Right"
  }, {
      value: "rollIn",
      text: "Roll-In"
  }, {
      value: "zoomIn",
      text: "Zoom-In"
  }, {
      value: "slideInDown",
      text: "Slide-In-Down"
  }, {
      value: "slideInLeft",
      text: "Slide-In-Left"
  }, {
      value: "slideInRight",
      text: "Slide-In-Right"
  }, {
      value: "slideInUp",
      text: "Slide-In-Up"
  }];
  var o = document.getElementById("__bg");
  e.setBackgroundGIFOrJPG = function(e) {
      var n;
      var l = localStorage.getItem("bg_animation");
      if (!l) l = "default";
      if (l === "default") {
          n = animations[Math.floor(Math.random() * animations.length)].value
      } else {
          n = l
      }
      var r = e.replace("bg-0", "").replace("bg-", "").replace(".jpg", "").replace(".gif", "");
      localStorage.setItem("last_bg", r);
      var g = true;
      if (localStorage.getItem("shuffle_background") === "yes") {
          if (t.concat(a).unique().length + 1 >= Number(user["bg_img_list"])) {
              t = [];
              localStorage.setItem("backgroundLoaded", JSON.stringify(t))
          }
      } else if (localStorage.getItem("shuffle_favorites") === "yes") {
          var i = JSON.parse(localStorage.getItem("mark_favor"));
          if (t.length + 1 >= i.length) {
              t = [];
              localStorage.setItem("backgroundLoaded", JSON.stringify(t))
          }
      }
      t.forEach(function(e, t) {
          if (Number(e) === Number(r)) {
              g = false
          }
      });
      if (g) {
          t.push(r);
          localStorage.setItem("backgroundLoaded", JSON.stringify(t))
      }
      var f = Object.keys(user["bg_color_gif"]).indexOf(e.replace(/\.jpg$/, ".gif"));
      if (f > -1) {
          chosenRandomBG = e.replace(/\.jpg$/, ".gif");
          o.style.backgroundImage = "url(" + browser.runtime.getURL("/start/skin/images/" + chosenRandomBG) + ")";
          var s = Object.values(user["bg_color_gif"])[f];
          if (Math.floor(Math.random() * 100) < 10 || s.indexOf("frame") > -1 || s === "white" || s === "#ffffff") {
              var c = Math.floor(Math.random() * user["frame_bg_list"]);
              var d = "frame-bg-" + ("0" + c).slice(-2) + ".png";
              if (!document.getElementById("frame_bg")) {
                  var u = document.createElement("div");
                  u.setAttribute("id", "frame_bg");
                  u.style = 'background-image: url("/start/skin/images/' + d + '"); width: 100%; height: 100%; background-repeat: no-repeat; background-size: 900px; background-position: center center;';
                  o.insertBefore(u, o.childNodes[0])
              }
              if (s.indexOf("frame") > -1 || s === "#ffffff") {
                  s = s.replace("frame", "").replace(/[ ,\-]/g, "");
                  if (!s || s === "white" || s === "#ffffff") s = "black"
              }
              o.style.backgroundColor = s;
              o.style.backgroundSize = "485px 320px"
          } else {
              if (u) u.remove();
              o.style.backgroundColor = s;
              o.style.backgroundSize = "490px"
          }
      } else {
          chosenRandomBG = e.replace(/\.gif$/, ".jpg");
          o.style.backgroundImage = "url(" + browser.runtime.getURL("/start/skin/images/" + chosenRandomBG) + ")";
          o.style.backgroundColor = "none";
          o.style.backgroundSize = "cover";
          if (document.getElementById("frame_bg")) {
              document.getElementById("frame_bg").remove()
          }
      }
      o.className = "background animated " + n;
      setTimeout(function() {
          o.className = "background"
      }, 1e3)
  };
  e.setNewTabBackground = function() {
      var o = "" + localStorage.getItem("last_bg");
      var n = [],
          l = [];
      if (localStorage.getItem("mark_favor")) {
          n = JSON.parse(localStorage.getItem("mark_favor"));
          if (n.length >= 2 && n.indexOf(o) > -1) {
              n.splice(n.indexOf(o), 1)
          }
          if (n.length) l = n.join("|").split("|")
      }
      for (var r = 1; r <= user["bg_img_list"]; r++) {
          if ("" + r !== o) l.push("" + r)
      }
      if (localStorage.getItem("shuffle_background") == "yes" || localStorage.getItem("shuffle_favorites") == "yes" && n.length == 0) {
          var g;
          if (o == "0") {
              g = 1
          } else {
              g = l.diff(t)[Math.floor(Math.random() * l.diff(t).length)]
          }
          if (localStorage.getItem("shuffle_background") == "yes") {
              if (Number(user["bg_img_list"]) === a.length) {
                  g = o
              } else {
                  while (a.indexOf(Number(g)) >= 0) {
                      g = l.diff(t)[Math.floor(Math.random() * l.diff(t).length)]
                  }
              }
          }
          chosenRandomBG = "bg-" + (Number(g) < 100 ? ("0" + g).slice(-2) : g) + ".jpg"
      } else if (localStorage.getItem("shuffle_favorites") == "yes") {
          var g = n.diff(t)[Math.floor(Math.random() * n.diff(t).length)];
          chosenRandomBG = "bg-" + (Number(g) < 100 ? ("0" + g).slice(-2) : g) + ".jpg"
      } else {
          if (localStorage.getItem("enable_slideshow") === "yes") {
              var g = Number(o) + 1;
              if (g > user["bg_img_list"]) {
                  g = 1
              }
              chosenRandomBG = "bg-" + (Number(g) < 100 ? ("0" + g).slice(-2) : g) + ".jpg"
          } else {
              chosenRandomBG = "bg-" + (Number(o) < 100 ? ("0" + o).slice(-2) : o) + ".jpg"
          }
      }
      e.setBackgroundGIFOrJPG(chosenRandomBG)
  };
  if (localStorage.getItem("c_bg_b_d") === "no" || !localStorage.getItem("c_bg_b_d")) {
      e.setNewTabBackground()
  } else {
      var n = localStorage.getItem("last_bg");
      if (n) {
          chosenRandomBG = "bg-" + (Number(n) < 100 ? ("0" + n).slice(-2) : n) + ".jpg"
      } else {
          chosenRandomBG = "bg-01.jpg"
      }
      e.setBackgroundGIFOrJPG(chosenRandomBG)
  }
})(this);