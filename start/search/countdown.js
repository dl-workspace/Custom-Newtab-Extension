// Use appStorage (browser.storage.local wrapper) if available, fallback to localStorage
var store = window.appStorage || localStorage;

window.loadCountDownModule = function(e) {
  if (e.countDownThread) clearTimeout(e.countDownThread);
  e.countDownThread = null;
  var t = $("#enable_countdown"),
      o = $("#countdown_setPosition"),
      n = $("#countdown_setText"),
      a = $("#countdown_setTime"),
      l = $("#countdown_text_color"),
      r = $("#countdown_background"),
      c = function() {
          o.val(store.getItem("countdownPosition"));
          $(".countDown").removeClass("miniSize");
          $(".countDown").removeClass("center_center");
          if (store.getItem("countdownPosition")) {
              if (store.getItem("countdownPosition").toLowerCase() == "bottom center") {
                  $(".countDown").removeClass("miniSize")
              } else if (store.getItem("countdownPosition").toLowerCase() == "center") {
                  $(".countDown").removeClass("miniSize");
                  $(".countDown").addClass("center_center")
              } else {
                  $(".countDown").addClass("miniSize")
              }
          }
          n.parent().parent().fadeIn();
          a.parent().parent().fadeIn();
          o.parent().parent().fadeIn();
          l.parent().fadeIn();
          r.parents("li").fadeIn();
          $("#countdown").fadeIn();
          o.off("change");
          o.on("change", function() {
              store.setItem("countdownPosition", $(this).val());
              var e = $(this).val().toLowerCase();
              if (e === "bottom center") {
                  $(".countDown").removeClass("miniSize");
                  $(".countDown").removeClass("center_center")
              } else if (e === "center") {
                  $(".countDown").removeClass("miniSize");
                  $(".countDown").addClass("center_center")
              } else {
                  $(".countDown").addClass("miniSize");
                  $(".countDown").removeClass("center_center")
              }
              browser.runtime.sendMessage({
                  changeOptions: utils.getGlobalOptions()
              })
          });
          var c = 0;
          var i = "";
          if (store.getItem("countdownToTime")) {
              a.val(store.getItem("countdownToTime"));
              c = new Date(store.getItem("countdownToTime")).getTime()
          }
          if (store.getItem("countdownText")) {
              n.val(store.getItem("countdownText"));
              i = "Countdown to " + store.getItem("countdownText");
              $("#countdownTitle").text(i)
          }
          var s = function(e) {
              if (e.handleObj.type == "blur" || e.keyCode == 13) {
                  if ($(this).val() == "") {
                      $(this).attr("type", "text");
                      $(this).val("Invalid time");
                      a.off("focus");
                      a.on("focus", function() {
                          $(this).attr("type", "datetime-local")
                      })
                  } else {
                      c = new Date($(this).val()).getTime();
                      store.setItem("countdownToTime", $(this).val());
                      var t = (new Date).getTime();
                      if (store.getItem("latency")) {
                          t += Number(store.getItem("latency"))
                      }
                      if (t > c) {
                          store.setItem("countdown_notified", "yes")
                      } else {
                          store.setItem("countdown_notified", "no")
                      }
                      browser.runtime.sendMessage({
                          changeOptions: utils.getGlobalOptions()
                      })
                  }
                  if (e.keyCode == 13) {
                      $(this).trigger("blur")
                  }
              }
          };
          var u = function(e) {
              if (e.handleObj.type == "blur" || e.keyCode == 13) {
                  if ($(this).val().length > 0) {
                      i = "Countdown to " + $(this).val()
                  } else {
                      i = ""
                  }
                  $("#countdownTitle").text(i);
                  store.setItem("countdownText", $(this).val());
                  browser.runtime.sendMessage({
                      changeOptions: utils.getGlobalOptions()
                  });
                  if (e.keyCode == 13) {
                      $(this).trigger("blur")
                  }
              }
          };
          a.off("blur");
          a.on("blur", s);
          a.off("keydown");
          a.on("keydown", s);
          n.off("blur");
          n.on("blur", u);
          n.off("keydown");
          n.on("keydown", u);
          var d, g, m, f;

          function w() {
              var i = (new Date).getTime();
              if (store.getItem("latency")) {
                  i += Number(store.getItem("latency"))
              }
              if (i > c) {
                  d = 0;
                  g = 0;
                  m = 0;
                  f = 0;
                  if (store.getItem("countdown_notified") === "no") {
                      e.startFireworksCanvas();
                      swal({
                          allowOutsideClick: true,
                          customClass: "countdown-reached-notify",
                          title: "Congratulations!",
                          text: '<p style="font-size:large;">You\'ve reached <span style="font-weight:bold;color:red;">' + store.getItem("countdownText") + "</span>.</p>",
                          type: "success",
                          html: true,
                          animation: false,
                          showConfirmButton: true,
                          confirmButtonColor: "#DD6B55",
                          confirmButtonText: "OK",
                          showCancelButton: false,
                          closeOnConfirm: true,
                          closeOnCancel: true
                      }, function(i) {
                          var s = new Date;
                          var u = new Date(store.getItem("countdownToTime"));
                          var d = s.getFullYear();
                          var g = u.getMonth() + 1;
                          var m = u.getDate();
                          var f = u.getHours();
                          var w = u.getMinutes();
                          if (g == 10 && m == 31 || g == 12 && m == 24 || g == 12 && m == 25 || g == 12 && m == 31 || g == 1 && m == 1) {
                              var h = `${d}-${("0"+g).slice(-2)}-${("0"+m).slice(-2)}T${("0"+f).slice(-2)}:${("0"+w).slice(-2)}`;
                              if (s > new Date(h)) h = `${d+1}-${("0"+g).slice(-2)}-${("0"+m).slice(-2)}T${("0"+f).slice(-2)}:${("0"+w).slice(-2)}`;
                              c = new Date(h).getTime();
                              a.val(h);
                              store.setItem("countdownToTime", h);
                              store.setItem("countdown_notified", "no")
                          } else {
                              store.setItem("countdown_notified", "yes");
                              store.setItem("enable_countdown", "no");
                              t.prop("checked", false);
                              n.parent().parent().fadeOut();
                              a.parent().parent().fadeOut();
                              o.parent().parent().fadeOut();
                              l.parent().fadeOut();
                              r.parents("li").fadeOut();
                              $("#countdown").fadeOut();
                              clearTimeout(e.countDownThread)
                          }
                          browser.runtime.sendMessage({
                              changeOptions: utils.getGlobalOptions()
                          });
                          if (store.getItem("snow_type") !== "fireworks") e.stopFireworksCanvas();
                          browser.runtime.sendMessage({
                              name: "click-CountdownReach",
                              data: store.getItem("countdownText")
                          })
                      })
                  }
              } else {
                  if ($(".countdown-reached-notify").size()) {
                      $(".sweet-overlay").remove();
                      $(".countdown-reached-notify").remove();
                      if (store.getItem("snow_type") !== "fireworks") e.stopFireworksCanvas()
                  }
                  var s = (i - c) / 1e3;
                  s = Math.abs(Math.floor(s));
                  d = Math.floor(s / (24 * 60 * 60));
                  f = s - d * 24 * 60 * 60;
                  g = Math.floor(f / (60 * 60));
                  f = f - g * 60 * 60;
                  m = Math.floor(f / 60);
                  f = f - m * 60
              }
          }

          function h() {
              clearTimeout(e.countDownThread);
              w();
              $("#days .number").text(d < 10 ? ("0" + d).slice(-2) : d);
              $("#hours .number").text(("0" + g).slice(-2));
              $("#minutes .number").text(("0" + m).slice(-2));
              $("#seconds .number").text(("0" + f).slice(-2));
              if (store.getItem("enable_countdown") == "yes") e.countDownThread = setTimeout(h, 999)
          }
          e.countDownThread = setTimeout(h, 1);
          e.listAllThreads.threadCountdown = {
              pause: function() {
                  clearInterval(e.countDownThread)
              },
              resume: function() {
                  h()
              }
          }
      };
  if (store.getItem("countdown_notified") == "yes") {
      if ($(".countdown-reached-notify").size()) {
          $(".sweet-overlay").remove();
          $(".countdown-reached-notify").remove();
          if (store.getItem("snow_type") !== "fireworks") e.stopFireworksCanvas()
      }
  }
  if (store.getItem("enable_countdown") == "yes") {
      t.prop("checked", true);
      c()
  } else {
      t.prop("checked", false);
      o.parent().parent().hide();
      a.parent().parent().hide();
      n.parent().parent().hide();
      l.parent().hide();
      r.parents("li").hide();
      $("#countdown").hide()
  }
  r.prop("checked", store.getItem("countdown_background") === "yes" ? true : false);
  r.off("change");
  r.on("change", function(e) {
      if ($(this).is(":checked")) {
          $("ul#countdown").css({
              background: "radial-gradient(rgba(0,0,0,0.9)-4%, rgba(0,0,0,0)68%)"
          })
      } else {
          $("ul#countdown").css({
              background: "transparent"
          })
      }
      store.setItem("countdown_background", $(this).is(":checked") ? "yes" : "no");
      browser.runtime.sendMessage({
          changeOptions: utils.getGlobalOptions()
      })
  });
  if (store.getItem("countdown_text_color")) {
      l.val(store.getItem("countdown_text_color"))
  } else {
      l.val("#fff")
  }
  t.off("change");
  t.on("change", function() {
      if ($(this).is(":checked")) {
          store.setItem("enable_countdown", "yes");
          var t = 0;
          if (store.getItem("countdownToTime")) t = new Date(store.getItem("countdownToTime")).getTime();
          var i = (new Date).getTime();
          if (store.getItem("latency")) {
              i += Number(store.getItem("latency"))
          }
          if (i > t) {
              store.setItem("countdown_notified", "yes")
          } else {
              store.setItem("countdown_notified", "no")
          }
          c()
      } else {
          store.setItem("enable_countdown", "no");
          n.parent().parent().fadeOut();
          a.parent().parent().fadeOut();
          o.parent().parent().fadeOut();
          l.parent().fadeOut();
          r.parents("li").fadeOut();
          $("#countdown").fadeOut();
          clearTimeout(e.countDownThread)
      }
      browser.runtime.sendMessage({
          changeOptions: utils.getGlobalOptions()
      })
  })
};