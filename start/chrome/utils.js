(function(e) {
  "use strict";

  function t(e) {
      return localStorage[e]
  }

  function o(e, t) {
      localStorage[e] = t
  }

  function a(e) {
      localStorage.clear()
  }
  var n = navigator.languages[0] || navigator.language;
  var l = n.substr(0, 2);
  var r = function() {
      var e = navigator.userAgent.toLowerCase();
      if (/x11; cros /.test(e)) {
          return "chromeOS"
      } else if (/macintosh; intel mac os x /.test(e)) {
          return "macOS"
      } else if (/x11; .*; linux /.test(e)) {
          return "linux"
      } else if (/windows nt 5.0/.test(e)) {
          return "winXP"
      } else if (/windows nt 6.0/.test(e)) {
          return "winVista"
      } else if (/windows nt 6.1/.test(e)) {
          return "win7"
      } else if (/windows nt 6.2/.test(e)) {
          return "win8"
      } else if (/windows nt 6.3/.test(e)) {
          return "win8.1"
      } else if (/windows nt 10.0/.test(e)) {
          return "win10"
      }
  }();
  var i = {
      get os() {
          return r
      },
      get id() {
          var e = localStorage.getItem("ext_id") || browser.app.getDetails().id;
          return e
      },
      get id4() {
          var e = localStorage.getItem("ext_id") || browser.app.getDetails().id;
          return e.substring(0, 4)
      },
      get version() {
          var e = localStorage.getItem("version") || browser.app.getDetails().version;
          return e
      },
      get locale() {
          return n
      },
      get language() {
          return l
      },
      get: function(e) {
          return t(e)
      },
      set: function(e, t) {
          o(e, t)
      },
      remove: function(e) {
          delete localStorage[e]
      },
      yymmdd: function() {
          try {
              var e = new Date;
              return (e.getUTCFullYear() + "").slice(-2) + ("0" + (e.getUTCMonth() + 1)).slice(-2) + ("0" + e.getUTCDate()).slice(-2) + ("0" + e.getUTCHours()).slice(-2)
          } catch (e) {}
      },
      count: function(e) {
          var t = this.get(e);
          if (t == null) t = 1;
          else t++;
          this.set(e, t)
      },
      mark_time: function(e) {
          this.set(e, (new Date).getTime())
      },
      resetMouseEnterHandler: function(e, t) {
          e.off("mouseenter");
          e.on("mouseenter", t)
      },
      resetClickHandler: function(e, t) {
          e.off("click");
          e.on("click", t)
      },
      getExtensionURL: function(e) {
          return browser.runtime.getURL(e)
      },
      getGlobalOptions: function() {
          var t = {
              disable_weather: localStorage.getItem("disable_weather"),
              enable_most_visited: localStorage.getItem("enable_most_visited"),
              enable_apps: localStorage.getItem("enable_apps"),
              enable_share: localStorage.getItem("enable_share"),
              enable_todo: localStorage.getItem("enable_todo"),
              hideTodoPanel: localStorage.getItem("hideTodoPanel"),
              todoList: localStorage.getItem("todoList"),
              enable_note: localStorage.getItem("enable_note"),
              notes: localStorage.getItem("notes"),
              bg_animation: localStorage.getItem("bg_animation"),
              enable_autohide: localStorage.getItem("enable_autohide"),
              enable_snow: localStorage.getItem("enable_snow"),
              snow_type: localStorage.getItem("snow_type"),
              enable_countdown: localStorage.getItem("enable_countdown"),
              countdownPosition: localStorage.getItem("countdownPosition"),
              countdownText: localStorage.getItem("countdownText"),
              countdownToTime: localStorage.getItem("countdownToTime"),
              countdown_text_color: localStorage.getItem("countdown_text_color"),
              countdown_background: localStorage.getItem("countdown_background"),
              countdown_notified: localStorage.getItem("countdown_notified"),
              setTimeAutomatically: localStorage.getItem("setTimeAutomatically"),
              latency: localStorage.getItem("latency"),
              time_format: localStorage.getItem("time_format"),
              date_format: localStorage.getItem("date_format"),
              units_weather: localStorage.getItem("units_weather"),
              hideLink: localStorage.getItem("hideLink"),
              hideApp: localStorage.getItem("hideApp"),
              had_wl: localStorage.getItem("had_wl"),
              random_all_newtab: localStorage.getItem("random_all_newtab")
          };
          for (var o = 0; o < e.storageDefaultKeys.length; o++) {
              var a = e.storageDefaultKeys[o];
              if (typeof t[a] !== "undefined") delete t[a]
          }
          return t
      },
      getInstalledAppsInWhitelist: function(e, t) {
          browser.management.getAll(function(o) {
              var a = [];
              for (var n = 0; n < e.length; n++) {
                  var l = e[n];
                  for (var r = 0; r < o.length; r++) {
                      var i = o[r];
                      if (l.id === i.id) {
                          a.push(i)
                      }
                  }
              }
              t(a)
          })
      },
      getEnabledAppsInWhitelist: function(e, t) {
          browser.management.getAll(function(o) {
              var a = [];
              for (var n = 0; n < e.length; n++) {
                  var l = e[n];
                  for (var r = 0; r < o.length; r++) {
                      var i = o[r];
                      if (i.enabled && l.id === i.id) {
                          a.push(i)
                      }
                  }
              }
              t(a)
          })
      },
      getAppsInList2ThatNotInList1: function(e, t) {
          var o = [];
          for (var a = 0; a < t.length; a++) {
              var n = true;
              for (var l = 0; l < e.length; l++) {
                  if (t[a].id === e[l].id) {
                      n = false;
                      break
                  }
              }
              if (n) o.push(t[a])
          }
          return o
      },
      getHash: function(e) {
          if (e) {
              e = e.replace(/\-|\{|\}/g, "");
              var t = 0,
                  o = e.length;
              for (var a = 0; a < o; a++) {
                  t = (t << 5) - t + e.charCodeAt(a);
                  t |= 0
              }
              return t
          } else return 0
      },
      localstorage2cookie: function() {}
  };
  e.utils = i;
  e.debug = localStorage.getItem("debug") === "debug";
  if (browser.management && browser.management.getSelf) {
      browser.management.getSelf(function(t) {
          if (t.installType === "development") {
              e.debug = true;
              localStorage.setItem("debug", "debug")
          } else {
              e.debug = false;
              localStorage.removeItem("debug")
          }
      })
  }
})(this);