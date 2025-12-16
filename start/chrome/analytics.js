(function(e) {
  // Use appStorage (browser.storage.local wrapper) if available, fallback to localStorage
  var store = e.appStorage || localStorage;
  
  var t = browser.runtime.id;
  var a = browser.i18n.getMessage("extName");
  var o = function(t) {
      if (e.debug) console.log("ga: send pageview " + t);
      ga("send", "pageview", t)
  };
  var l = function(t) {
      if (e.debug) console.log("ga: send event", t);
      if (t.eventAction.indexOf("active") > -1) ga("trackActive.send", t);
      else if (t.eventAction.indexOf("install") == 0 || t.eventAction.indexOf("update") == 0) ga("trackInstall.send", t);
      else if (t.eventAction.indexOf("click") == 0) ga("trackClick.send", t);
      else if (t.eventAction.indexOf("search") == 0) ga("trackSearch.send", t);
      else if (t.eventAction.indexOf("error") == 0) ga("trackError.send", t);
      else ga("send", t)
  };
  var r = function(t, o) {
      if (t != "opt-out" && t != "opted-out" && store.getItem("optout") == "1") return;
      if (e.debug) console.log("TRACK: ", t, o);
      else {
          var r = {
              hitType: "event",
              eventCategory: a,
              eventAction: t
          };
          if (o) r.eventLabel = o;
          l(r)
      }
  };
  e.trackNoti = function(t, a) {
      if (e.debug) console.log("TRACK NOTI: ", t, a);
      else {
          var o = {
              hitType: "event",
              eventCategory: t,
              eventAction: a
          };
          ga("trackNoti.send", o)
      }
  };
  var c, s;
  var i = function() {
      var e = new Date;
      var t = "" + e.getUTCFullYear();
      var a = e.getUTCMonth() < 9 ? "0" + (e.getUTCMonth() + 1) : "" + (e.getUTCMonth() + 1);
      var o = e.getUTCDate() < 10 ? "0" + e.getUTCDate() : "" + e.getUTCDate();
      c = t + a + o;
      s = 0;
      var l = store.getItem("installdt");
      if (!l) {
          store.setItem("installdt", c)
      } else {
          try {
              var r = l.substr(0, 4);
              var i = l.substr(4, 2) - 1;
              var n = l.substr(6, 2);
              var g = new Date(r, i, n);
              var m = e.getTime() - g.getTime();
              s = Math.floor(m / (1e3 * 60 * 60 * 24))
          } catch (e) {}
      }
      store.setItem("installdc", s);
      store.setItem("BST", (new Date).toISOString())
  };

  function n() {
      var e = browser.runtime.getManifest();
      return e.version
  }

  function g() {
      var e = browser.runtime.getManifest();
      return e.name
  }
  var m = user["firstRunDomain"];
  var f = user["firstRunLandingPage"];
  var d = false,
      u = false;
  var h = n().split(".");
  var S = "http://" + m + "/update-" + h[0] + "-" + h[1] + "-" + h[2] + "/";
  var I = "update-" + h[0] + "-" + h[1] + "-" + h[2];
  var p = function(e, a) {
      r(e, a);
      var o = store.getItem("confSE") || t;
      if (o.length === 32 && o.indexOf("://") === -1) o = "https://chrome.google.com/webstore/detail/" + n().replace(/\./g, "_") + "/" + o;
    if (e == "click-ChangeCity") {
          browser.tabs.create({
              url: f + "?utm_campaign=Extensions&utm_medium=changecity&utm_source=" + browser.runtime.id,
              active: true
          })
      } else if (e == "click-OfficialSite") {
            browser.tabs.create({
                url: "https://en.hololive.tv/"
            })
      } else if (e == "click-OfficialStoreJP") {
            browser.tabs.create({
                url: "https://shop.hololivepro.com/"
            })
      } else if (e == "click-OfficialStoreEN") {
            browser.tabs.create({
                url: "https://shop.geekjack.net/pages/hololive"
            })        
      } else if (e == "click-Wiki") {
            browser.tabs.create({
                url: "https://github.com/DeaLoux/Hololive-Newtab-Extension"
            })
      } else if (e == "click-vWiki") {
            browser.tabs.create({
                url: "https://virtualyoutuber.fandom.com/wiki/Virtual_YouTuber_Wiki"
            })
      } else if (e == "click-Holodex") {
            browser.tabs.create({
                url: "https://holodex.net"
            })
      } else if (e == "click-Schedule") {
            browser.tabs.create({
                url: "https://schedule.hololive.tv/lives"
            })
      } else if (e == "click-Uninstall") {
            browser.management.uninstallSelf({
                showConfirmDialog: true
            }, function(e) {})
      }
  };
  var _ = [];
  browser.tabs.onUpdated.addListener(function(t, a, o) {
      if ((a.status == "complete" || _.indexOf(t) == -1) && (o.url.replace(/^https?:\/\//, "").indexOf(f.replace(/^https?:\/\//, "")) > -1 || o.url.replace(/^https?:\/\//, "").indexOf(S.replace(/^https?:\/\//, "")) > -1)) {
          _.push(t);
          browser.tabs.executeScript(t, {
              file: "/start/search/content-homepage.js",
              allFrames: false,
              runAt: "document_start"
          }, function() {
              if (e.debug) browser.tabs.sendMessage(t, {
                  debug: e.debug
              });
              if (d && o.url.replace(/^https?:\/\//, "").indexOf(S.replace(/^https?:\/\//, "")) > -1) {
                  browser.tabs.sendMessage(t, {
                      type: "showMajor"
                  })
              } else if (u) {
                  browser.tabs.sendMessage(t, {
                      type: "showInstall"
                  })
              } else {
                  browser.tabs.sendMessage(t, {
                      type: "showMinor"
                  })
              }
              var a = JSON.parse(store.getItem("weather_location"));
              var l = JSON.parse(store.getItem("weather_data"));
              var r = store.getItem("weather_location_isvalid") === "true";
              if (r) {
                  browser.tabs.sendMessage(t, {
                      type: "weather_info",
                      info: {
                          weather_location: a,
                          weather_data: l
                      }
                  })
              } else {
                  browser.tabs.sendMessage(t, {
                      type: "error_get_weather_in_city",
                      info: {
                          weather_location: JSON.parse(store.getItem("weather_location")),
                          error_msg: "Unable to get weather data."
                      }
                  })
              }
          })
      }
  });

  function b(t) {
      if (e.debug) console.log("Extension Installed");
      r("installed");
      if (store.getItem("installdt") === null) {
          store.setItem("installdt", c)
      }
      y();
      u = true;
      browser.tabs.create({
          url: store.getItem("newtab_url"),
          active: false
      }, function() {});
      browser.tabs.query({
          url: ["http://" + m + "/*", "https://" + m + "/*", "http://www." + m + "/*", "https://www." + m + "/*"]
      }, function(e) {
          if (e.length) {
              browser.tabs.update(e[0].id, {
                  url: f,
                  active: true
              })
          } else {
              browser.tabs.create({
                  url: f,
                  active: true
              })
          }
      });
      setTimeout(function() {
          r("install-alive")
      }, 15e3)
  }

  function v(t, a) {
      if (e.debug) console.log("Extension Updated");
      r("updated" + "-" + t);
      try {
          y();
          if ((user["ver_update_ignore"] + "").indexOf(a) >= 0) {
              return
          }
          if ((user["ver_update_major"] + "").indexOf(t) >= 0) {
              browser.cookies.get({
                  url: S,
                  name: I
              }, function(e) {
                  if (e) return;
                  d = true;
                  browser.tabs.query({
                      url: ["http://" + m + "/*", "https://" + m + "/*", "http://www." + m + "/*", "https://www." + m + "/*"]
                  }, function(e) {
                      if (e.length) {
                          browser.tabs.update(e[0].id, {
                              url: S,
                              active: true
                          })
                      } else {
                          browser.tabs.create({
                              url: S,
                              active: true
                          })
                      }
                  })
              })
          } else if (s >= 3 && (user["ver_update_minor"] + "").indexOf(t) >= 0) {
              browser.tabs.query({
                  url: ["http://" + m + "/*", "https://" + m + "/*", "http://www." + m + "/*", "https://www." + m + "/*"]
              }, function(e) {
                  if (e.length) {
                      browser.tabs.update(e[0].id, {
                          url: f,
                          active: true
                      })
                  } else {
                      browser.tabs.create({
                          url: f,
                          active: true
                      })
                  }
              })
          }
          if ((user["ver_reset_clicked_options"] + "").indexOf(t) >= 0) {
              store.removeItem("theme_clicked")
          }
          if (store.getItem("countdownToTime")) {
              var o = new Date;
              var l = new Date(store.getItem("countdownToTime"));
              if (o > l) {
                  var c = o.getFullYear();
                  var i = l.getMonth() + 1;
                  var n = l.getDate();
                  var g = l.getHours();
                  var u = l.getMinutes();
                  if (i == 10 && n == 31 || i == 12 && n == 24 || i == 12 && n == 25 || i == 12 && n == 31 || i == 1 && n == 1) {
                      var h = `${c}-${("0"+i).slice(-2)}-${("0"+n).slice(-2)}T${("0"+g).slice(-2)}:${("0"+u).slice(-2)}`;
                      if (o > new Date(h)) h = `${c+1}-${("0"+i).slice(-2)}-${("0"+n).slice(-2)}T${("0"+g).slice(-2)}:${("0"+u).slice(-2)}`;
                      store.setItem("countdownToTime", h);
                      store.setItem("countdown_notified", "no")
                  }
              }
          }
      } catch (e) {}
  }

  function w(t, a) {
      if (e.debug) console.log("Extension Active");
      if (store.getItem("optout") === "1") {
          r("opted-out", a)
      } else {
          r("active", a)
      }
  }
  i();
  e.currVersion = e.currVersion || n();
  e.prevVersion = e.prevVersion || store.getItem("version") || store.getItem("installed");
  if (currVersion != prevVersion) {
      if (prevVersion === null) {
          b(currVersion)
      } else {
          store.setItem("instact", 1);
          v(currVersion, prevVersion)
      }
      store.setItem("version", currVersion)
  }
  var k = store.getItem("last_active");
  e.last_active = false;
  if (!k || k !== c) {
      if (k) store.setItem("instact", 1);
      w(currVersion, s);
      store.setItem("last_active", c);
      e.last_active = true
  }
  browser.runtime.onMessage.addListener(function(t, a, o) {
      if (typeof t == "string" && t.indexOf("click-") == 0) {
          p(t);
          return
      } else if (typeof t.name == "string" && t.name.indexOf("click-") == 0) {
          p(t.name, t.data);
          return
      } else if (t.search) {
          r(t.search, t.query);
          o("ok");
          return
      } else if (t.trackNoti) {
          e.trackNoti(t.category, t.action)
      } else if (t.rateStatus) {
          if (s < 1) {
              o(0)
          } else if (store.getItem("rate_clicked") == null) {
              o(1)
          } else if (store.getItem("rate_clicked") == "yes" || store.getItem("rate_clicked") == "feedback") {
              o(0)
          } else if (store.getItem("rate_clicked") == "cws") {
              o(-1)
          }
      }
  });

  function storageSettings(storage) {
    if (!storage.getItem("disable_weather")) {
        storage.setItem("disable_weather", "no")
    }
    if (!storage.getItem("enable_most_visited")) {
        if (!storage.getItem("disable_most_visited")) {
            storage.setItem("enable_most_visited", "yes")
        } else if (storage.getItem("disable_most_visited") == "yes") {
            storage.setItem("enable_most_visited", "no")
        } else {
            storage.setItem("enable_most_visited", "yes")
        }
        storage.removeItem("disable_most_visited")
    }
    if (!storage.getItem("enable_apps")) {
        if (!storage.getItem("disable_apps")) {
            storage.setItem("enable_apps", "yes")
        } else if (storage.getItem("disable_apps") == "yes") {
            storage.setItem("enable_apps", "no")
        } else {
            storage.setItem("enable_apps", "yes")
        }
        storage.removeItem("disable_apps")
    }
    if (!storage.getItem("enable_share")) {
        if (!storage.getItem("disable_share")) {
            storage.setItem("enable_share", "yes")
        } else if (storage.getItem("disable_share") == "yes") {
            storage.setItem("enable_share", "no")
        } else {
            storage.setItem("enable_share", "yes")
        }
        storage.removeItem("disable_share")
    }
    if (!storage.getItem("enable_todo")) {
        if (!storage.getItem("disable_todo")) {
            storage.setItem("enable_todo", "yes")
        } else if (storage.getItem("disable_todo") == "yes") {
            storage.setItem("enable_todo", "no")
        } else {
            storage.setItem("enable_todo", "yes")
        }
        storage.removeItem("disable_todo")
    }
    if (!storage.getItem("enable_slideshow")) {
        storage.setItem("enable_slideshow", "yes")
    }
    if (!storage.getItem("hideTodoPanel")) {
        storage.setItem("hideTodoPanel", "yes")
    }
    if (!storage.getItem("todoList")) {
        storage.setItem("todoList", "[]")
    }
    if (!storage.getItem("enable_note")) {
        storage.setItem("enable_note", "yes")
    }
    if (!storage.getItem("notes")) {
        storage.setItem("notes", "[]")
    }
    if (!storage.getItem("bg_animation")) {
        storage.setItem("bg_animation", "fadeIn")
    }
    if (!storage.getItem("enable_autohide")) {
        storage.setItem("enable_autohide", "no")
    }
    if (!storage.getItem("enable_snow")) {
        storage.setItem("enable_snow", "no")
    }
    if (!storage.getItem("snow_type")) {
        storage.setItem("snow_type", "flake")
    }
    if (!storage.getItem("enable_countdown")) {
        storage.setItem("enable_countdown", "no")
    }
    if (storage.getItem("countdownText") === null || storage.getItem("countdownToTime") === null) {
        var e = (new Date).getUTCFullYear() + 1 + "-01-01T00:00:00";
        storage.setItem("countdownToTime", e);
        storage.setItem("countdownText", "New Year")
    }
    if (!storage.getItem("countdownPosition")) {
        storage.setItem("countdownPosition", "Bottom Center")
    }
    if (!storage.getItem("countdown_text_color")) {
        storage.setItem("countdown_text_color", "#ffffff")
    }
    if (!storage.getItem("countdown_background")) {
        storage.setItem("countdown_background", "no")
    }
    if (!storage.getItem("countdown_notified")) {
        storage.setItem("countdown_notified", "no")
    }
    if (!storage.getItem("setTimeAutomatically")) {
        storage.setItem("setTimeAutomatically", "yes")
    }
    if (!storage.getItem("latency")) {
        storage.setItem("latency", "0")
    }
    if (!storage.getItem("time_format")) {
        storage.setItem("time_format", "24h")
    }
    if (!storage.getItem("date_format")) {
        storage.setItem("date_format", "{{d}}.{{m}}.{{y}}")
    }
    if (!storage.getItem("units_weather")) {
        storage.setItem("units_weather", "metric")
    }
    if (!storage.getItem("hideLink")) {
        storage.setItem("hideLink", "[]")
    }
    if (!storage.getItem("hideApp")) {
        storage.setItem("hideApp", "[]")
    }
    if (!storage.getItem("had_wl")) {
        storage.setItem("had_wl", "[]")
    }
    if (!storage.getItem("random_all_newtab")) {
        storage.setItem("random_all_newtab", "yes")
    }
    if (!storage.getItem("last_opened")) {
        storage.setItem("last_opened", (new Date).getTime())
    }
    if (!storage.getItem("bg_img")) {
        storage.setItem("bg_img", "bg-01.jpg")
    }
    if (!storage.getItem("last_bg")) {
        storage.setItem("last_bg", "0")
    }
    if (!storage.getItem("shuffle_background") || !storage.getItem("shuffle_favorites")) {
        storage.setItem("shuffle_background", "yes");
        storage.setItem("shuffle_favorites", "no")
    }
    storage.setItem("bg_img", storage.getItem("bg_img").replace("url(", "").replace("/start/skin/images/", "").replace("/skin/images/", "").replace(")", ""));
    if (!storage.getItem("mark_favor")) {
        storage.setItem("mark_favor", JSON.stringify([]))
    }
    if (!storage.getItem("likedImages")) {
        storage.setItem("likedImages", JSON.stringify([]))
    }
    if (!storage.getItem("IDT")) {
        storage.setItem("IDT", (new Date).toISOString())
    }
	}

  function y() {
    if(windowInfo.incognito){
			storageSettings(sessionStorage);
		}
		else{
			storageSettings(store);
		}
  }
})(this);