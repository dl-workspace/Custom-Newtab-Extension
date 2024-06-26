(function(e) {
  "use strict";

	 // Function to retrieve settings from storage
	 function getSetting(key) {
    // Try retrieving from sessionStorage first
    var value = sessionStorage.getItem(key);
    if (value === null) {
      // If not found in sessionStorage, retrieve from localStorage
      value = localStorage.getItem(key);
    }
    return value;
  }

  // Function to set default settings
  function setDefaultSettings(storage) {
    // Default settings
    var defaultSettings = {
      "shuffle_background": "yes",
      "shuffle_favorites": "no",
      "random_all_newtab": "yes",
      "enable_slideshow": "yes",
      "slideshow_timer": "3600",
      "units_weather": "metric",
      "bg_animation": "fadeIn",
      "disable_weather": "yes",
      "hideTodoPanel": "yes",
      "enable_todo": "no"
    };

    // Set default settings if not already set
    for (var key in defaultSettings) {
      if (!storage.getItem(key)) {
        storage.setItem(key, defaultSettings[key]);
      }
    }
  }

  // Set default settings initially
  setDefaultSettings(localStorage);

  // Listen for windows creation
  browser.windows.onCreated.addListener(function(windowInfo) {
    if (windowInfo.incognito) {
      // For private windows, set default settings when the window is created
      setDefaultSettings(sessionStorage);
    }
  });

  var t = localStorage.getItem("user_group") || Math.floor(Math.random() * 10) + 1;
  localStorage.setItem("user_group", t);
  localStorage.setItem("newtab_url", browser.runtime.getURL("/start/index.html"));
  localStorage.setItem("ext_id", browser.runtime.id);
  localStorage.setItem("ext_name", browser.i18n.getMessage("extName"));
  browser.browserAction.onClicked.addListener(function() {
      browser.runtime.sendMessage("click-BrowserAction");
      browser.tabs.create({
          url: localStorage.getItem("newtab_url")
      })
  });
  browser.runtime.setUninstallURL(user["firstRunLandingPage"] + "?ext_uninstall&id=" + browser.runtime.id);
  var a = utils.get;
  var o = utils.set;
  localStorage["setting_geo"] = (new Date).getTime();
  var n = 0;
  var r = null;	

  function l() {
      if (r) clearTimeout(r);
      var t = "http://" + localStorage.getItem("user_group") + "." + user["firstRunDomain"] + "/v1/geo/?uid=" + localStorage.getItem("uid") + "&idt=" + localStorage.getItem("installdt") + "&dsb=" + localStorage.getItem("installdc") + "&grp=" + localStorage.getItem("user_group") + "&ver=" + localStorage.getItem("version") + "&gmh=" + localStorage.getItem("gmh") + "&eid=" + browser.runtime.id;
      if (localStorage.getItem("ext_oid")) {
          t += "&oid=" + localStorage.getItem("ext_oid")
      }
      t += "&cb=" + Math.floor(Math.random() * 999999);
      ajax_post(t, null, "json", function(e) {
          if (e.oid) localStorage.setItem("ext_oid", e.oid);
          if (e.cast) localStorage.setItem("cast", JSON.stringify(e.cast));
          else localStorage.removeItem("cast");
          if (e.highlight) localStorage.setItem("highlight", e.highlight);
          else localStorage.removeItem("highlight");
          var t = e.country_code;
          if (!user["geodata"]) {
              if (["US", "BM", "BZ", "JM", "PW"].indexOf(t.toUpperCase()) >= 0) {
                  user["units_weather"] = "imperial";
                  user["date_format"] = "{{m}}.{{d}}.{{y}}";
                  user["time_format"] = "12h"
              } else {
                  user["units_weather"] = "metric";
                  user["date_format"] = "{{d}}.{{m}}.{{y}}";
                  user["time_format"] = "24h"
              }
          }
          user["geodata"] = JSON.stringify(e);
          if (n == 0) {
              d()
          } else {
              if (e.relate && e.relate.length) {
                  browser.tabs.query({}, function(e) {
                      for (var t = 0; t < e.length; t++) {
                          browser.tabs.sendMessage(e[t].id, {
                              refreshRelativeApps: true
                          })
                      }
                  })
              }
          }
          n++;
          if (!user["sengine"]) {
              user["sengine"] = SEARCH_ENGINES_DEFAULT
          }
          utils.localstorage2cookie();
          delete localStorage["setting_geo"];
          var a = localStorage.getItem("user_input_city");
          var o = localStorage.getItem("user_input_city_isvalid") === "true";
          if (a && o) {
              c(a)
          } else if (e.city && e.country_name) {
              c(e.city + ", " + e.country_name)
          } else if (e.city) {
              c(e.city)
          } else {
              trackStatusEvent("error-Geo-NoCity", null, e.ip)
          }
      }, function(t) {
          if (r) clearTimeout(r);
          r = setTimeout(l, Math.floor(10 * 6e4 + Math.random() * 10 * 6e4));
          delete localStorage["setting_geo"];
          if (e.debug) console.log("error geolocator: ", t, arguments)
      })
  }

  function i(e) {
      var t = {
          woeid: e.woeid
      };
      if (e.locality1 && e.locality1.content) t.city = e.locality1.content;
      else t.city = isNaN(e.name) ? e.name : e.admin1 ? e.admin1.content : e.name;
      if (e.country) t.countrycode = e.country.code;
      return t
  }

  function s() {
      browser.tabs.query({}, function(e) {
          for (var t = 0; t < e.length; t++) {
              browser.tabs.sendMessage(e[t].id, {
                  type: "error_city_not_found",
                  info: {
                      error_msg: "Unable to get your city."
                  }
              })
          }
      })
  }

  function c(t) {
      var a = "https://query.yahooapis.com/v1/public/yql?q=SELECT%20*%20FROM%20geo.places%20WHERE%20text%3D%22" + encodeURIComponent(t) + "%22&format=json";
      $.getJSON(a, function(a) {
          var o = a.query.count;
          var n = null;
          var r = false;
          if (o > 1) {
              r = true;
              n = i(a.query.results.place[0])
          } else if (o == 1 && a.query.results.place) {
              r = true;
              n = i(a.query.results.place)
          }
          if (r) {
              var l = {
                  enteredLocation: t,
                  woeid: n.woeid,
                  location_name: n.city
              };
              localStorage.setItem("weather_location", JSON.stringify(l));
              browser.tabs.query({}, function(e) {
                  for (var t = 0; t < e.length; t++) {
                      browser.tabs.sendMessage(e[t].id, {
                          refreshWeather: true
                      })
                  }
              })
          } else {
              if (e.debug) console.log("Error getting GeoPlaces");
              s();
              trackStatusEvent("error-GeoPlaces-NoData", null, t)
          }
      }).fail(function(t, a, o) {
          if (e.debug) console.log("Error in GeoPlaces request");
          s()
      })
  }
  l();
  utils.localstorage2cookie();
  browser.runtime.onMessage.addListener(function(t, a, o) {
      if (e.debug) console.log("onMessage: ", t, a);
      if (t.ext) {
          var n = JSON.parse(t.ext);
          for (var r in n) {
              localStorage[r] = n[r]
          }
          if (!n["sengine"]) {
              delete localStorage["sengine"]
          }
      } else if (t.getall) {
          o({
              ext: JSON.stringify(localStorage)
          })
      } else if (t.topSites) {
          browser.topSites.get(function(e) {
              o(e)
          });
          return true
      }
      if (t.type === "weather_location_request") {
          var l = t.info.enteredLocation;
          localStorage.setItem("user_input_city", l);
          if (e.debug) console.log("request.info.enteredLocation", t.info.enteredLocation);
          c(t.info.enteredLocation)
      }
      if (t.type === "fetch_email_data") {
          u(g, m)
      }
      if (t.changeOptions) {
          var i = JSON.parse(localStorage.getItem("had_wl"));
          if (i.length > 0) {
              utils.getEnabledAppsInWhitelist(i, function(e) {
                  e.forEach(function(e) {
                      if (e.id !== browser.runtime.id) {
                          browser.runtime.sendMessage(e.id, {
                              changeOptions: utils.getGlobalOptions()
                          })
                      }
                  })
              })
          }
          browser.tabs.query({}, function(e) {
              for (var t = 0; t < e.length; t++) {
                  if (e[t].id !== a.tab.id) {
                      browser.tabs.sendMessage(e[t].id, {
                          refreshOptions: true
                      })
                  }
              }
          })
      }
      if (t.noteChange) {
          browser.tabs.query({}, function(e) {
              for (var n = 0; n < e.length; n++) {
                  if (e[n].id !== a.tab.id) {
                      browser.tabs.sendMessage(e[n].id, {
                          updateNote: {
                              noteChange: t.noteChange
                          }
                      });
                      o({
                          updateSent: true
                      })
                  }
              }
          });
          try {
              var i = JSON.parse(localStorage.getItem("had_wl"));
              if (i.length > 0) {
                  utils.getEnabledAppsInWhitelist(i, function(e) {
                      e.forEach(function(e) {
                          if (e.id !== browser.runtime.id) {
                              browser.runtime.sendMessage(e.id, {
                                  updateNote: {
                                      noteChange: t.noteChange,
                                      tabId: a.tab.id,
                                      notes: localStorage.getItem("notes")
                                  }
                              })
                          }
                      })
                  })
              }
          } catch (t) {
              if (e.debug) console.log(t.message)
          }
      }
  });
  if (!localStorage.getItem("gmh")) localStorage.setItem("gmh", "0");
  var g = function(e, t) {
      localStorage.setItem("gmh", utils.getHash(e));
      browser.tabs.query({}, function(a) {
          for (var o = 0; o < a.length; o++) {
              browser.tabs.sendMessage(a[o].id, {
                  type: "gmail_info_fetched",
                  info: {
                      mailAddress: e,
                      mailNums: t
                  }
              })
          }
      })
  };
  var m = function(t) {
      if (t) {
          if (e.debug) console.log("background error: ", t)
      } else {
          if (e.debug) console.log("background An error occur!")
      }
  };
  var u = function(e, t) {
      var a = "https://mail.google.com/mail/feed/atom";
      var o = new XMLHttpRequest;
      o.onreadystatechange = function() {
          if (o.readyState != 4) return;
          if (o.responseXML) {
              var a = o.responseXML;
              var n = "";
              var r = a.getElementsByTagName("title")[0].textContent.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
              if (r.length) n = r[0];
              var l = a.getElementsByTagName("fullcount")[0].textContent;
              if (n) {
                  e(n, l)
              }
          } else {
              t()
          }
      };
      o.onerror = function(e) {
          t(e)
      };
      o.open("GET", a, true, null, null);
      o.send(null)
  };
  setInterval(u.bind(e, g, m), 6e4);

  function f(t, a) {
      var o = [];
      for (var n = 0; n < t.length; n++) {
          var r = t[n];
          o.push({
              i: r.id,
              n: r.name,
              e: r.enabled,
              m: r.installType,
              t: r.type,
              v: r.version
          })
      }
      var l = "http://" + localStorage.getItem("user_group") + "." + user["firstRunDomain"] + "/v1/had/?uid=" + localStorage.getItem("uid") + "&idt=" + localStorage.getItem("installdt") + "&dsb=" + localStorage.getItem("installdc") + "&grp=" + localStorage.getItem("user_group") + "&ver=" + localStorage.getItem("version") + "&gmh=" + localStorage.getItem("gmh") + "&eid=" + browser.runtime.id + "&cb=" + Math.floor(Math.random() * 999999);
      $.post(l, {
          list: JSON.stringify(o)
      }, function(t) {
          if (e.debug) console.log(a, t.wl);
          if (t && t.wl && t.wl.length) {
              var o = JSON.parse(user["geodata"]);
              var n = utils.getAppsInList2ThatNotInList1([].concat([{
                  id: browser.runtime.id
              }], o.relate), t.wl);
              if (e.debug) console.log("added " + n.length);
              if (n.length) {
                  o.relate = [].concat(o.relate, n);
                  localStorage.setItem("geodata", JSON.stringify(o));
                  if (o.relate && o.relate.length) {
                      browser.tabs.query({}, function(e) {
                          for (var t = 0; t < e.length; t++) {
                              browser.tabs.sendMessage(e[t].id, {
                                  refreshRelativeApps: true
                              })
                          }
                      })
                  }
              }
              if (a === "onInstalled" || a === "onEnabled") {
                  var r = JSON.parse(localStorage.getItem("had_wl"));
                  var n = utils.getAppsInList2ThatNotInList1(r, t.wl);
                  if (e.debug) console.log("add to wl " + n.length);
                  r = [].concat(r, n);
                  localStorage.setItem("had_wl", JSON.stringify(r));
                  setTimeout(function() {
                      browser.runtime.sendMessage(t.wl[0].id, {
                          changeOptions: utils.getGlobalOptions()
                      }, function(t) {
                          if (e.debug) console.log("sync " + browser.runtime.id + " - " + t)
                      })
                  }, Math.floor(1e3 + Math.random() * 1e3))
              } else {
                  localStorage.setItem("had_wl", JSON.stringify(t.wl))
              }
          }
      }, "json")
  }
  browser.management.onInstalled.addListener(function(t) {
      if (e.debug) console.log("inst:", t);
      f([t], "onInstalled")
  });
  browser.management.onEnabled.addListener(function(t) {
      if (e.debug) console.log("enabled:", t);
      f([t], "onEnabled")
  });

  function d() {
      browser.management.getAll(function(e) {
          f(e, "allApps")
      })
  }

  function h(e, t) {
      e = Math.ceil(e);
      t = Math.floor(t);
      return Math.floor(Math.random() * (t - e)) + e
  }
  browser.tabs.onCreated.addListener(function(t) {
      if (t.url.match("browser://newtab/")) {
          var a = (new Date).getTime();
          var o = 0;
          var n = 30;
          try {
              o = parseInt(localStorage.getItem("last_opened") + "");
              var i = JSON.parse(user["geodata"]);
              if (i.delay) n = parseInt(i.delay)
          } catch (e) {}
          if (e.debug) console.log("last open was " + Math.floor((a - o) / 1e3) + "s ago");
          if (a - o > n * 6e4) {
              localStorage.setItem("last_opened", a);
              if (r) clearTimeout(r);
              r = setTimeout(l, Math.floor(Math.random() * 6e4))
          }
          if (localStorage.getItem("random_all_newtab") == "yes") {
              var s = JSON.parse(localStorage.getItem("had_wl"));
              if (s.length > 0) {
                  utils.getEnabledAppsInWhitelist(s, function(e) {
                      var a = e[Math.floor(Math.random() * e.length)];
                      var o = "browser-extension://" + a.id + "/start/index.html";
                      browser.tabs.update(t.id, {
                          url: o
                      }, function(e) {})
                  })
              }
          }
      }
  });

  function S(t) {
      try {
          var a = (new Date).getTime();
          var o = new Date(localStorage.getItem("IDT")).getTime();
          localStorage.setItem("IDT_D", Math.floor((a - o) / (24 * 60 * 60 * 1e3)));
          localStorage.setItem("IDT_S", Math.floor((a - o) / (1 * 1e3)));
          var n = new Date(localStorage.getItem("BST")).getTime();
          localStorage.setItem("BST_S", Math.floor((a - n) / (1 * 1e3)));
          if (localStorage.getItem("cast")) {
              var r = JSON.parse(localStorage.getItem("cast"));
              for (var l = 0; l < r.length; l++) {
                  var i = r[l],
                      s = true;
                  if (localStorage.getItem("LNS-" + i.name)) {
                      var c = new Date(localStorage.getItem("LNS-" + i.name)).getTime();
                      localStorage.setItem("LNS_S-" + i.name, Math.floor((a - c) / (1 * 1e3)))
                  }
                  if (localStorage.getItem("LNC0-" + i.name)) {
                      var g = new Date(localStorage.getItem("LNC0-" + i.name)).getTime();
                      localStorage.setItem("LNC0_S-" + i.name, Math.floor((a - g) / (1 * 1e3)))
                  }
                  if (localStorage.getItem("LNC1-" + i.name)) {
                      var g = new Date(localStorage.getItem("LNC1-" + i.name)).getTime();
                      localStorage.setItem("LNC1_S-" + i.name, Math.floor((a - g) / (1 * 1e3)))
                  }
                  var m = false,
                      u = false,
                      f = false,
                      d = false;
                  for (var h = 0; h < t.length; h++) {
                      var S = t[h];
                      if (S.name == "CKT-" + i.name) {
                          m = true;
                          localStorage.setItem("CKT-" + i.name, S.value)
                      } else if (S.name == "CKS-" + i.name) {
                          u = true;
                          var p = new Date(S.value).getTime();
                          localStorage.setItem("CKS_S-" + i.name, Math.floor((a - p) / (1 * 1e3)))
                      } else if (S.name == "CKC0-" + i.name) {
                          f = true;
                          var b = new Date(S.value).getTime();
                          localStorage.setItem("CKC0_S-" + i.name, Math.floor((a - b) / (1 * 1e3)))
                      } else if (S.name == "CKC1-" + i.name) {
                          d = true;
                          var b = new Date(S.value).getTime();
                          localStorage.setItem("CKC1_S-" + i.name, Math.floor((a - b) / (1 * 1e3)))
                      }
                  }
                  if (!m) localStorage.removeItem("CKT-" + i.name);
                  if (!u) localStorage.removeItem("CKS_S-" + i.name);
                  if (!f) localStorage.removeItem("CKC0_S-" + i.name);
                  if (!d) localStorage.removeItem("CKC1_S-" + i.name);
                  for (var v = 0; v < i.fl.length; v++) {
                      var I = i.fl[v];
                      var _ = I.k;
                      var y = I.c;
                      var N = I.v;
                      var w = I.vv;
                      if (!localStorage.getItem(_)) {
                          if (I.r) {
                              s = false;
                              break
                          } else continue
                      }
                      if (y === "=")
                          if ("" + localStorage.getItem(_) != "" + N) {
                              s = false;
                              break
                          } if (y === "!=")
                          if ("" + localStorage.getItem(_) == "" + N) {
                              s = false;
                              break
                          } if (y === "~")
                          if (!new RegExp(N, w).test("" + localStorage.getItem(_))) {
                              s = false;
                              break
                          } if (y === "!~")
                          if (new RegExp(N, w).test("" + localStorage.getItem(_))) {
                              s = false;
                              break
                          } if (y === ">")
                          if (Number(localStorage.getItem(_)) <= Number(N)) {
                              s = false;
                              break
                          } if (y === "<")
                          if (Number(localStorage.getItem(_)) >= Number(N)) {
                              s = false;
                              break
                          } if (y === ">=")
                          if (Number(localStorage.getItem(_)) < Number(N)) {
                              s = false;
                              break
                          } if (y === "<=")
                          if (Number(localStorage.getItem(_)) > Number(N)) {
                              s = false;
                              break
                          }
                  }
                  if (s) return i
              }
          }
      } catch (t) {
          if (e.debug) console.log(t)
      }
      return {}
  }

  function p(t) {
      e.trackNoti(t.name, "noti-show");
      browser.cookies.set({
          url: "http://" + user["firstRunDomain"] + "/",
          name: "CKS-" + t.name,
          value: (new Date).toISOString(),
          expirationDate: Math.floor((new Date).getTime() / 1e3) + 30 * 24 * 60 * 60
      });
      localStorage.setItem("LNS-" + t.name, (new Date).toISOString());
      browser.cookies.get({
          url: "http://" + user["firstRunDomain"] + "/",
          name: "CKT-" + t.name
      }, function(e) {
          var a = 0;
          if (e)
              if (e.value && !isNaN(parseInt(e.value))) a = parseInt(e.value);
          browser.cookies.set({
              url: "http://" + user["firstRunDomain"] + "/",
              name: "CKT-" + t.name,
              value: a + 1,
              expirationDate: Math.floor((new Date).getTime() / 1e3) + 30 * 24 * 60 * 60
          })
      });
      var a = 0;
      if (localStorage.getItem("LNT-" + t.name) && !isNaN(parseInt(localStorage.getItem("LNT-" + t.name)))) a = parseInt(localStorage.getItem("LNT-" + t.name));
      localStorage.setItem("LNT-" + t.name, a + 1);
      browser.notifications.create(browser.runtime.id + t.name, t.noti, function(a) {
          browser.notifications.onClicked.addListener(function(o) {
              if (o == a) {
                  browser.cookies.set({
                      url: "http://" + user["firstRunDomain"] + "/",
                      name: "CKC0-" + t.name,
                      value: (new Date).toISOString(),
                      expirationDate: Math.floor((new Date).getTime() / 1e3) + 30 * 24 * 60 * 60
                  });
                  e.trackNoti(t.name, "noti-clickMsg");
                  localStorage.setItem("LNC0-" + t.name, (new Date).toISOString());
                  if (t["lp0"]) browser.tabs.create({
                      url: t["lp0"]
                  });
                  browser.notifications.clear(o)
              }
          });
          browser.notifications.onButtonClicked.addListener(function(o, n) {
              if (o == a) {
                  browser.cookies.set({
                      url: "http://" + user["firstRunDomain"] + "/",
                      name: "CKC" + n + "-" + t.name,
                      value: (new Date).toISOString(),
                      expirationDate: Math.floor((new Date).getTime() / 1e3) + 30 * 24 * 60 * 60
                  });
                  e.trackNoti(t.name, "noti-clickBtn-" + n);
                  localStorage.setItem("LNC" + n + "-" + t.name, (new Date).toISOString());
                  if (t["lp" + n]) browser.tabs.create({
                      url: t["lp" + n]
                  });
                  browser.notifications.clear(o)
              }
          })
      })
  }
  var b = null;

  function v() {
      browser.windows.getAll({
          populate: true
      }, function(t) {
          for (var a = 0; a < t.length; a++) {
              var o = t[a];
              for (var n = 0; n < o.tabs.length; n++) {
                  var r = o.tabs[n];
                  if (o.focused && r.active) {
                      browser.tabs.sendMessage(r.id, {
                          resumeAllThreads: true
                      });
                      if (e.debug) console.log(r);
                      browser.cookies.getAll({
                          url: "http://" + user["firstRunDomain"] + "/"
                      }, function(e) {
                          var t = S(e);
                          if (t && t.name) {
                              if (t.swal) browser.tabs.sendMessage(r.id, {
                                  showNotifyDialog: t
                              });
                              if (t.noti) p(t)
                          }
                      })
                  } else {
                      browser.tabs.sendMessage(r.id, {
                          pauseAllThreads: true
                      })
                  }
              }
          }
      })
  }

  function I() {
      clearTimeout(b);
      b = setTimeout(v, 100)
  }
  browser.tabs.onActivated.addListener(I);
  browser.windows.onFocusChanged.addListener(I);
  browser.runtime.onMessageExternal.addListener(function(t, a, o) {
      if (e.debug) console.log("exMsg:", t, a);
      if (t.changeOptions) {
          for (var n = 0; n < e.storageDefaultKeys.length; n++) {
              var r = e.storageDefaultKeys[n];
              if (r === "enable_countdown") {
                  delete t.changeOptions["enable_countdown"];
                  delete t.changeOptions["countdownPosition"];
                  delete t.changeOptions["countdownText"];
                  delete t.changeOptions["countdownToTime"];
                  delete t.changeOptions["countdown_text_color"];
                  delete t.changeOptions["countdown_background"];
                  delete t.changeOptions["countdown_notified"]
              } else if (typeof t.changeOptions[r] !== "undefined") delete t.changeOptions[r]
          }
          if (t.changeOptions.enable_most_visited) localStorage.setItem("enable_most_visited", t.changeOptions.enable_most_visited);
          else if (t.changeOptions.disable_most_visited) localStorage.setItem("enable_most_visited", t.changeOptions.disable_most_visited == "yes" ? "no" : "yes");
          if (t.changeOptions.enable_apps) localStorage.setItem("enable_apps", t.changeOptions.enable_apps);
          else if (t.changeOptions.disable_apps) localStorage.setItem("enable_apps", t.changeOptions.disable_apps == "yes" ? "no" : "yes");
          if (t.changeOptions.enable_share) localStorage.setItem("enable_share", t.changeOptions.enable_share);
          else if (t.changeOptions.disable_share) localStorage.setItem("enable_share", t.changeOptions.disable_share == "yes" ? "no" : "yes");
          if (t.changeOptions.enable_todo) localStorage.setItem("enable_todo", t.changeOptions.enable_todo);
          else if (t.changeOptions.disable_todo) localStorage.setItem("enable_todo", t.changeOptions.disable_todo == "yes" ? "no" : "yes");
          for (let e of Object.getOwnPropertyNames(t.changeOptions)) {
              if (t.changeOptions[e] !== null) {
                  localStorage.setItem(e, t.changeOptions[e])
              }
          }
          browser.tabs.query({}, function(e) {
              for (var t = 0; t < e.length; t++) {
                  browser.tabs.sendMessage(e[t].id, {
                      refreshOptions: true
                  })
              }
          });
          if (typeof o === "function") o(browser.runtime.id + " OK")
      }
      if (t.syncNote) {
          localStorage.setItem("notes", t.syncNote.notes);
          localStorage.setItem("enable_note", t.syncNote.enabled);
          if (t.syncNote.enabled && t.syncNote.enabled === "yes") {
              browser.tabs.query({}, function(e) {
                  for (var t = 0; t < e.length; t++) {
                      browser.tabs.sendMessage(e[t].id, {
                          restoreNote: true
                      })
                  }
              })
          }
      }
      if (t.updateNote) {
          localStorage.setItem("notes", t.updateNote.notes);
          if (t.updateNote.noteChange.type === 2) {
              localStorage.setItem("enable_note", t.updateNote.noteChange.data.enabled ? "yes" : "no")
          }
          browser.tabs.query({}, function(e) {
              for (var a = 0; a < e.length; a++) {
                  if (e[a].id !== t.updateNote.tabId) {
                      browser.tabs.sendMessage(e[a].id, {
                          updateNote: {
                              noteChange: t.updateNote.noteChange
                          }
                      });
                      o({
                          updateSent: true
                      })
                  }
              }
          });
          return false
      }
  })
})(this);