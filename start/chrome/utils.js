(function(e) {
  "use strict";

  // Use appStorage (browser.storage.local wrapper) if available, fallback to localStorage
  var store = e.appStorage || localStorage;

  function t(key) {
      return store.getItem ? store.getItem(key) : store[key];
  }

  function o(key, value) {
      if (store.setItem) {
          store.setItem(key, value);
      } else {
          store[key] = value;
      }
  }

  function a() {
      if (store.clear) {
          store.clear();
      }
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
          var e = t("ext_id") || browser.app.getDetails().id;
          return e
      },
      get id4() {
          var e = t("ext_id") || browser.app.getDetails().id;
          return e.substring(0, 4)
      },
      get version() {
          var e = t("version") || browser.app.getDetails().version;
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
      set: function(e, val) {
          o(e, val)
      },
      remove: function(key) {
          if (store.removeItem) {
              store.removeItem(key);
          } else {
              delete store[key];
          }
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
          var opts = {
              disable_weather: t("disable_weather"),
              enable_most_visited: t("enable_most_visited"),
              enable_apps: t("enable_apps"),
              enable_share: t("enable_share"),
              enable_todo: t("enable_todo"),
              hideTodoPanel: t("hideTodoPanel"),
              todoList: t("todoList"),
              enable_note: t("enable_note"),
              notes: t("notes"),
              bg_animation: t("bg_animation"),
              enable_autohide: t("enable_autohide"),
              enable_snow: t("enable_snow"),
              snow_type: t("snow_type"),
              enable_countdown: t("enable_countdown"),
              countdownPosition: t("countdownPosition"),
              countdownText: t("countdownText"),
              countdownToTime: t("countdownToTime"),
              countdown_text_color: t("countdown_text_color"),
              countdown_background: t("countdown_background"),
              countdown_notified: t("countdown_notified"),
              setTimeAutomatically: t("setTimeAutomatically"),
              latency: t("latency"),
              time_format: t("time_format"),
              date_format: t("date_format"),
              units_weather: t("units_weather"),
              hideLink: t("hideLink"),
              hideApp: t("hideApp"),
              had_wl: t("had_wl"),
              random_all_newtab: t("random_all_newtab")
          };
          for (var idx = 0; idx < e.storageDefaultKeys.length; idx++) {
              var key = e.storageDefaultKeys[idx];
              if (typeof opts[key] !== "undefined") delete opts[key]
          }
          return opts
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
              var h = 0,
                  len = e.length;
              for (var j = 0; j < len; j++) {
                  h = (h << 5) - h + e.charCodeAt(j);
                  h |= 0
              }
              return h
          } else return 0
      },
      localstorage2cookie: function() {}
  };
  e.utils = i;
  e.debug = t("debug") === "debug";
  if (browser.management && browser.management.getSelf) {
      browser.management.getSelf(function(info) {
          if (info.installType === "development") {
              e.debug = true;
              o("debug", "debug")
          } else {
              e.debug = false;
              i.remove("debug")
          }
      })
  }
})(this);