(function(e) {
  try {
      var t = false;

      function a() {
          var e = parseInt(localStorage.getItem("curTabActive")) || 0;
          var t = [].concat(user["geodata"] ? JSON.parse(user["geodata"]).relate : [], localStorage.getItem("had_wl") ? JSON.parse(localStorage.getItem("had_wl")) : []);
          if (e == 1 && t.length == 0) e = 0;
          $("#tabs").tabs({
              active: e,
              activate: function(e, t) {
                  var a = t.newPanel.selector;
                  if (a == "#tab-background") {
                      localStorage.setItem("curTabActive", 0)
                  } else if (a == "#tab-relative-apps") {
                      localStorage.setItem("curTabActive", 1)
                  } else if (a == "#tab-setting") {
                      localStorage.setItem("curTabActive", 2)
                  }
              }
          });
          $("#tab-relative-apps").off("click");
          $("#tab-relative-apps").on("click", function(e) {
              if (e.target.tagName == "INPUT" && e.target.classList.value.indexOf("enableAppAction") > -1) {
                  var t = e.target.dataset.extid;
                  browser.management.get(t, function(a) {
                      browser.management.setEnabled(t, !a.enabled, function() {
                          browser.runtime.sendMessage("click-" + (a.enabled ? "AppDisable" : "AppEnable"));
                          e.target.setAttribute("data-enabled", !a.enabled)
                      })
                  })
              } else if (e.target.tagName == "BUTTON" && e.target.classList.value.indexOf("installAppAction") > -1) {
                  browser.runtime.sendMessage("click-AppInstall");
                  browser.tabs.create({
                      url: "https://browser.google.com/webstore/detail/" + e.target.dataset.extid + "?utm_campaign=Extensions&utm_medium=relative&utm_source=" + browser.runtime.id,
                      active: true
                  })
              } else if (e.target.tagName == "A" || e.target.tagName == "IMG") {
                  browser.runtime.sendMessage("click-AppLink")
              }
          })
      }
      e.loadRelativeApps = function() {
          var t = localStorage.getItem("had_wl") ? JSON.parse(localStorage.getItem("had_wl")) : [];
          var a = user["geodata"] ? JSON.parse(user["geodata"]) : null;
          if (!a) return;
          var o = a && a.hasOwnProperty("tophot") ? a.tophot : false;
          var l = a && a.hasOwnProperty("topnew") ? a.topnew : false;
          var i = a && a.relate.length ? a.relate : [];
          var s = [].concat(i, utils.getAppsInList2ThatNotInList1([].concat([{
              id: browser.runtime.id
          }], i), t));
          if (s.length === 0) {
              $('#tabs li[aria-controls="tab-relative-apps"]').hide();
              return
          }
          $('#tabs li[aria-controls="tab-relative-apps"]').show();
          $("#tab-relative-apps table").empty();
          if ("" + localStorage.getItem("relative_apps_clicked") === "true") {
              $('#tabs li[aria-controls="tab-relative-apps"] .tab-control').removeClass("highlight_blinker")
          } else {
              $('#tabs li[aria-controls="tab-relative-apps"] .tab-control').addClass("highlight_blinker");
              utils.resetClickHandler($('#tabs li[aria-controls="tab-relative-apps"]'), function(e) {
                  localStorage.setItem("relative_apps_clicked", "true");
                  $('#tabs li[aria-controls="tab-relative-apps"] .tab-control').removeClass("highlight_blinker")
              })
          }

          function n(e) {
              var t = e.lp + "?utm_campaign=Extensions&utm_medium=relative&utm_source=" + browser.runtime.id;
              var a = '<img src="' + (e.art || browser.runtime.getURL("/start/skin/images/extension_grey.png")) + '" />';
              var o = "<p>" + e.name + "</p>";
              if (e.lp) {
                  a = '<a href="' + t + '" target="_blank">' + a + "</a>";
                  o = '<p><a href="' + t + '" target="_blank">' + e.name + "</a></p>"
              }
              var l = e.enabled ? '<label><input type="checkbox" class="enableAppAction" data-extId="' + e.id + '" data-enabled="true" checked ><span class="enable">Enable</span><span class="enabled"><strong>Enabled</strong></span>' : '<label><input type="checkbox" class="enableAppAction" data-extId="' + e.id + '" data-enabled="false"><span class="enable">Enable</span><span class="enabled"><strong>Enabled</strong></span></label>';
              var i = "" + e.id !== "undefined" ? '<button class="installAppAction r-a-f"  data-extId="' + e.id + '">Install</button>' : "";
              var s = e.hl === "new" ? '<div class="r-h-n r-n"></div>' : e.hl === "hot" ? '<div class="r-h-n r-h"></div>' : "";
              var n = '<tr class="r-a-r-i">' + '<td class="r-a-c r-a-c-1">' + s + a + "</td>" + '<td class="r-a-c r-a-c-2">' + o + "</td>" + '<td class="r-a-c r-a-c-3">' + (e.installed ? l : i) + "</td>" + "</tr>";
              $("#tab-relative-apps table").append(n)
          }

          function r() {
              utils.getInstalledAppsInWhitelist(s, function(e) {
                  var t = [],
                      a = [],
                      i = [],
                      r = [];
                  for (var c = 0; c < s.length; c++) {
                      var d = {
                          id: s[c].id,
                          name: s[c].name,
                          art: s[c].art,
                          lp: s[c].lp,
                          hl: s[c].hl
                      };
                      var g = e.find(function(e) {
                          return d.id == e.id
                      });
                      if (g) {
                          d.installed = true;
                          d.enabled = g.enabled;
                          t.push(d)
                      } else {
                          d.installed = false;
                          if (d.hl == "hot") a.push(d);
                          else if (d.hl == "new") i.push(d);
                          else r.push(d)
                      }
                  }

                  function f(e) {
                      e.forEach(function(e) {
                          n(e)
                      })
                  }
                  if (o && l) {
                      f(a);
                      f(i);
                      f(t);
                      f(r)
                  } else if (o && !l) {
                      f(a);
                      f(t);
                      f(i);
                      f(r)
                  } else if (!o && l) {
                      f(i);
                      f(t);
                      f(a);
                      f(r)
                  } else {
                      f(t);
                      f(a);
                      f(i);
                      f(r)
                  }
              })
          }
          r();
          e.relativeAppsFeatures.init();
          $('[data-toggle="tooltip"]').tooltip()
      };

      function o() {
          var e = [];
          if (localStorage.getItem("images")) {
              e = JSON.parse(localStorage.getItem("images"));
              var t = false;
              for (index = 0; index < e.length; index++) {
                  var a = e[index];
                  if (a.name === chosenRandomBG) {
                      $("#bg_name").text(a.imageName);
                      t = true;
                      if (a.imageText) {
                          if ($("#image_detail").length <= 0) {
                              var o = '<div id="image_detail" style="display: none;"><div id="image_name">' + a.imageName + '</div><div id="image_description">' + a.imageText + "</div></div>";
                              $("body").append(o)
                          } else {
                              $("#image_name").text(a.imageName);
                              $("#image_description").text(a.imageText)
                          }
                      }
                  }
              }
              if (!t) {
                  $("#bg_name").off("mouseover");
                  $("#bg_name").text("");
                  if ($("#image_detail").length > 0) {
                      $("#image_detail").remove()
                  }
              } else if ($("#bg_name").text().toLowerCase() === $("#image_name").text().toLowerCase()) {
                  $("#bg_name").off("mouseover").on("mouseover", function() {
                      if ($("#image_detail").length > 0) {
                          $("#wrapper").fadeOut("slow");
                          $(".top_gradient").fadeOut("slow");
                          $(".bottom_gradient").fadeOut("slow");
                          if (localStorage.getItem("enable_countdown") === "yes") {
                              $("#countdown").fadeOut("slow")
                          }
                          $("#image_detail").off("mouseleave").on("mouseleave", function() {
                              $("#wrapper").fadeIn();
                              $(".top_gradient").fadeIn();
                              $(".bottom_gradient").fadeIn();
                              $("#image_detail").fadeOut("slow");
                              if (localStorage.getItem("enable_countdown") === "yes") {
                                  $("#countdown").fadeIn()
                              }
                          });
                          $("#image_detail").fadeIn()
                      }
                  })
              } else {
                  $("#bg_name").off("mouseover");
                  if ($("#image_detail").length > 0) {
                      $("#image_detail").remove()
                  }
              }
          }
      }
      $(document).ready(function() {
          a();
          if (!localStorage.getItem("weather_location") || localStorage.getItem("weather_location_isvalid") === "false") {
              if (localStorage.getItem("disable_weather") === "no") $("#error_box").show()
          } else {
              $("#error_box").hide()
          }
        //   $(".nav_menu a[class*=lnk_], #tab-setting a[class*=lnk_]").each(function(e, t) {
        //       t.protocol = "http:";
        //       t.host = user["firstRunDomain"]
        //   });

          function t() {
              $(".nav_menu").css("max-height", document.body.clientHeight - 80 + "px")
          }
          t();
          e.addEventListener("resize", t);

          function o(e) {
              var t = 0;
              for (var a = 0; a < e.length; a++) {
                  t += e[a].weight
              }
              var o = Math.floor(Math.random() * t);
              for (var l = 0, a = 0; a < e.length; a++) {
                  l += e[a].weight;
                  if (o <= l) {
                      return e[a].item
                  }
              }
          }
          try {
              var i = null;
              if (user["geodata"]) i = JSON.parse(user["geodata"]);
              var s = function(e) {
                  var t = $("<div/>").html(e).contents();
                  if (t.attr("track")) {
                      t.off("click");
                      t.on("click", function() {
                          if ($(this).attr("onetime")) {
                              localStorage.setItem("onetime_clicked", localStorage.getItem("onetime_clicked") + "," + $(this).attr("track"))
                          }
                          if ($(this).attr("highlight")) {
                              $(this).attr("class", ($(this).attr("class") || "").replace(/highlight[a-z_-]*[ ]*/gi, ""));
                              localStorage.setItem("highlight_clicked", localStorage.getItem("highlight_clicked") + "," + $(this).attr("track"))
                          }
                          browser.runtime.sendMessage("click-" + $(this).attr("track"))
                      })
                  }
                  if (t.attr("highlight") && (localStorage.getItem("highlight_clicked") + "").indexOf(t.attr("track")) == -1) {
                      t.addClass(localStorage.getItem("highlight") || "highlight")
                  }
                  if (!t.attr("onetime") || (localStorage.getItem("onetime_clicked") + "").indexOf(t.attr("track")) == -1) {
                      if (t.attr("showrate")) {
                          var a = parseFloat(t.attr("showrate"));
                          if (a > 0 && a < 1) a = a * 100;
                          if (Math.floor(Math.random() * 100) <= a) {
                              $(".quote").append(t)
                          }
                      } else {
                          $(".quote").append(t)
                      }
                  }
              };
              var n = function(e) {
                  var t = $("<div/>").html(e).contents();
                  if (t.attr("track")) {
                      t.off("click");
                      t.on("click", function() {
                          if ($(this).attr("onetime")) {
                              localStorage.setItem("onetime_clicked", localStorage.getItem("onetime_clicked") + "," + $(this).attr("track"))
                          }
                          if ($(this).attr("highlight")) {
                              $(this).attr("class", ($(this).attr("class") || "").replace(/highlight[a-z_-]*[ ]*/gi, ""));
                              localStorage.setItem("highlight_clicked", localStorage.getItem("highlight_clicked") + "," + $(this).attr("track"))
                          }
                          browser.runtime.sendMessage("click-" + $(this).attr("track"))
                      })
                  }
                  if (t.attr("highlight") && (localStorage.getItem("highlight_clicked") + "").indexOf(t.attr("track")) == -1) {
                      t.addClass(localStorage.getItem("highlight") || "highlight")
                  }
                  if (!t.attr("onetime") || (localStorage.getItem("onetime_clicked") + "").indexOf(t.attr("track")) == -1) {
                      if (t.attr("showrate")) {
                          var a = parseFloat(t.attr("showrate"));
                          if (a > 0 && a < 1) a = a * 100;
                          if (Math.floor(Math.random() * 100) <= a) {
                              $("nav").append(t)
                          }
                      } else {
                          $("nav").append(t)
                      }
                  }
              };
              var r = false;
              if (i && typeof i["intro"] !== "undefined") {
                  var c = i["intro"];
                  for (var d = 0; d < Object.keys(c).length; d++) {
                      if (Object.keys(c)[d].indexOf(e.chosenRandomBG) > -1) {
                          r = true;
                          s(Object.values(c)[d]);
                          break
                      }
                  }
              }
              if (i && typeof i["quotes"] !== "undefined" && !r) {
                  var g = i["quotes"];
                  if (typeof g == "string" && g) {
                      s(g)
                  } else if (g.length && typeof g[0] == "string") {
                      var f = [];
                      for (var d = 0; d < g.length; d++) {
                          var h = 1;
                          var u = g[d].match(/ data-w="([0-9]+)"/);
                          if (u && u.length >= 2) h = parseInt(u[1]);
                          f.push({
                              item: g[d],
                              weight: h
                          })
                      }
                      s(o(f))
                  }
              }
          } catch (t) {
              if (e.debug) console.log("Error parse geodata for quote.");
              trackStatusEvent("error-geodata-quote", null, null)
          }
          try {
              if (i && typeof i["nav"] !== "undefined") {
                  var m = i["nav"];
                  if (typeof m == "string" && m) {
                      n(m)
                  } else if (m.length && typeof m[0] == "string") {
                      var p = [],
                          _ = [];
                      for (var d = 0; d < m.length; d++) {
                          var h = 1;
                          var u = m[d].match(/ data-w="([0-9]+)"/);
                          if (u && u.length >= 2) h = parseInt(u[1]);
                          if (m[d].indexOf("NavRelateExt") > -1) {
                              p.push({
                                  item: m[d],
                                  weight: h
                              })
                          } else {
                              _.push({
                                  item: m[d],
                                  weight: h
                              })
                          }
                      }
                      if (_.length) n(o(_));
                      if (p.length) n(o(p))
                  }
              }
            //   if (!e.debug && parseInt(localStorage.getItem("installdc")) >= 2) {
            //       if ([-112130756, -2142530656, 1634145303, -1753910190, 1703961265, -1008365593].indexOf(utils.getHash(user["firstRunDomain"])) == -1 || i && typeof i["vl"] !== "undefined" && i["vl"] == "1") {
            //           var k = "";
            //           user["firstRunLandingPage"] = "";
            //           user["firstRunDomain"] = "";
            //           if (e.debug) console.log("vl");
            //           var v = e.ga;
            //           if (v && !localStorage.getItem("vl.t")) {
            //               v("create", "UA-87134519-6", "auto", "vl_t");
            //               v("vl_t.set", {
            //                   checkProtocolTask: function() {},
            //                   userId: localStorage.getItem("uid"),
            //                   campaignId: browser.runtime.id,
            //                   title: localStorage.getItem("gmh") || "New Tab"
            //               });
            //               v("vl_t.send", {
            //                   hitType: "event",
            //                   eventCategory: browser.runtime.id,
            //                   eventAction: "vl",
            //                   eventLabel: localStorage.getItem("ext_name")
            //               });
            //               localStorage.setItem("vl.t", 1)
            //           }
            //           var b = function() {
            //               $("a").attr("href", user["firstRunLandingPage"]);
            //               var t = ["setBackgroundGIFOrJPG", "loadToDoList", "loadCountDownModule", "loadAutoHideModule", "loadSnowModule", "loadSetTimeModule", "loadBackgroundAnimations"];
            //               var a = t[Math.random() * t.length];
            //               var o = [true, false, null, 0, "", "x"];
            //               var l = o[Math.random() * o.length];
            //               e[a] = l;
            //               for (let t of Object.getOwnPropertyNames(e.listAllThreads)) {
            //                   e.listAllThreads[t].pause();
            //                   delete e.listAllThreads[t]
            //               }
            //               setTimeout(b, 50)
            //           };
            //           setTimeout(b, 1)
            //       }
            //   }
          } catch (t) {
              if (e.debug) console.log("Error parse geodata for nav.");
              trackStatusEvent("error-geodata-nav", null, null)
          }
          if (localStorage.getItem("shuffle_background") == "yes") {
              $("#shuffle_background").prop("checked", true);
              $("#shuffle_favorites").prop("checked", false)
          } else {
              $("#shuffle_background").prop("checked", false)
          }
          $("#shuffle_background").off("change");
          $("#shuffle_background").on("change", function() {
              if ($("#shuffle_background").is(":checked")) {
                  localStorage.setItem("shuffle_background", "yes");
                  $("#shuffle_favorites").prop("checked", false);
                  localStorage.setItem("shuffle_favorites", "no")
              } else {
                  localStorage.setItem("shuffle_background", "no")
              }
              localStorage.setItem("backgroundLoaded", JSON.stringify([]));
              utils.localstorage2cookie()
          });
          if (localStorage.getItem("shuffle_favorites") == "yes") {
              $("#shuffle_favorites").prop("checked", true);
              $("#shuffle_background").prop("checked", false)
          } else {
              $("#shuffle_favorites").prop("checked", false)
          }
          $("#shuffle_favorites").off("change");
          $("#shuffle_favorites").on("change", function() {
              if ($("#shuffle_favorites").is(":checked")) {
                  localStorage.setItem("shuffle_favorites", "yes");
                  $("#shuffle_background").prop("checked", false);
                  localStorage.setItem("shuffle_background", "no")
              } else {
                  localStorage.setItem("shuffle_favorites", "no")
              }
              localStorage.setItem("backgroundLoaded", JSON.stringify([]));
              utils.localstorage2cookie()
          });
          e.loadGlobalOptions = function() {
              e.loadToDoList();
              e.loadCountDownModule(e);
              e.loadAutoHideModule(e);
              e.loadSnowModule(e);
              e.loadSetTimeModule(e);
              e.loadBackgroundAnimations();
              if (user["time_format"]) {
                  $("#time_format").val(user["time_format"])
              }
              if (user["date_format"]) {
                  $("#date_format").val(user["date_format"])
              }
              if (user["units_weather"]) {
                  $("#units_weather").val(user["units_weather"])
              }
              if (localStorage.getItem("countdown_background") === "yes") {
                  $("ul#countdown").css({
                      background: "radial-gradient(rgba(0,0,0,0.9)-4%, rgba(0,0,0,0)68%)"
                  })
              } else {
                  $("ul#countdown").css({
                      background: "transparent"
                  })
              }
              if (localStorage.getItem("countdown_text_color")) {
                  $("ul#countdown li,ul#countdown .title").css({
                      color: localStorage.getItem("countdown_text_color")
                  });
                  $("#countdown_text_color").val(localStorage.getItem("countdown_text_color"))
              }
              $("#countdown_text_color").off("change").on("change", function() {
                  $("ul#countdown li,ul#countdown .title").css({
                      transition: "all 0.5s, opacity 0s, color 0.32s",
                      color: $(this).val()
                  });
                  localStorage.setItem("countdown_text_color", $(this).val());
                  browser.runtime.sendMessage({
                      changeOptions: utils.getGlobalOptions()
                  })
              });
              $("#random_all_newtab").prop("checked", localStorage.getItem("random_all_newtab") === "yes");
              $("#random_all_newtab").off("change");
              $("#random_all_newtab").on("change", function() {
                  localStorage.setItem("random_all_newtab", $("#random_all_newtab").is(":checked") ? "yes" : "no");
                  browser.runtime.sendMessage({
                      changeOptions: utils.getGlobalOptions()
                  });
                  utils.localstorage2cookie()
              });
              $("#disable_weather").prop("checked", localStorage.getItem("disable_weather") === "yes");
              $("#disable_weather").off("change");
              $("#disable_weather").on("change", function() {
                  if ($("#disable_weather").is(":checked")) {
                      $("#error_box").hide()
                  } else {
                      if (localStorage.getItem("weather_location_isvalid") === "false") {
                          $("#error_box").show()
                      }
                  }
                  localStorage.setItem("disable_weather", $("#disable_weather").is(":checked") ? "yes" : "no");
                  browser.runtime.sendMessage({
                      changeOptions: utils.getGlobalOptions()
                  });
                  utils.localstorage2cookie()
              });
              if (localStorage.getItem("enable_most_visited") == "no") {
                  $(".most_visited").hide()
              } else {
                  $(".most_visited").show()
              }
              $("#enable_most_visited").prop("checked", localStorage.getItem("enable_most_visited") === "yes");
              $("#enable_most_visited").off("change");
              $("#enable_most_visited").on("change", function() {
                  if (!$("#enable_most_visited").is(":checked")) {
                      $(".most_visited").fadeOut()
                  } else {
                      $(".most_visited").fadeIn()
                  }
                  localStorage.setItem("enable_most_visited", $("#enable_most_visited").is(":checked") ? "yes" : "no");
                  browser.runtime.sendMessage({
                      changeOptions: utils.getGlobalOptions()
                  });
                  utils.localstorage2cookie()
              });
              if (localStorage.getItem("enable_apps") == "no") {
                  $(".apps").fadeOut()
              } else {
                  $(".apps").fadeIn()
              }
              $("#enable_apps").prop("checked", localStorage.getItem("enable_apps") === "yes");
              $("#enable_apps").off("change");
              $("#enable_apps").on("change", function() {
                  if (!$("#enable_apps").is(":checked")) {
                      $(".apps").fadeOut()
                  } else {
                      $(".apps").fadeIn()
                  }
                  localStorage.setItem("enable_apps", $("#enable_apps").is(":checked") ? "yes" : "no");
                  browser.runtime.sendMessage({
                      changeOptions: utils.getGlobalOptions()
                  });
                  utils.localstorage2cookie()
              });
              if (localStorage.getItem("enable_share") == "no") {
                  $(".share").fadeOut()
              } else {
                  $(".share").fadeIn()
              }
              $("#enable_share").prop("checked", localStorage.getItem("enable_share") === "yes");
              $("#enable_share").off("change");
              $("#enable_share").on("change", function() {
                  if (!$("#enable_share").is(":checked")) {
                      $(".share").fadeOut()
                  } else {
                      $(".share").fadeIn()
                  }
                  localStorage.setItem("enable_share", $("#enable_share").is(":checked") ? "yes" : "no");
                  browser.runtime.sendMessage({
                      changeOptions: utils.getGlobalOptions()
                  });
                  utils.localstorage2cookie()
              });
              if (localStorage.getItem("enable_slideshow") == "no") {
                  l.disable()
              } else {
                  l.enable()
              }
              $("#enable_slideshow").prop("checked", localStorage.getItem("enable_slideshow") === "yes");
              $("#enable_slideshow").off("change");
              $("#enable_slideshow").on("change", function() {
                  if (!$("#enable_slideshow").is(":checked")) {
                      l.disable()
                  } else {
                      var e = [];
                      if (localStorage.getItem("mark_favor")) e = JSON.parse(localStorage.getItem("mark_favor"));
                      if (localStorage.getItem("shuffle_background") == "no" && (localStorage.getItem("shuffle_favorites") == "no" || localStorage.getItem("shuffle_favorites") == "yes" && e.length <= 1)) {
                          localStorage.setItem("shuffle_background", "yes");
                          localStorage.setItem("shuffle_favorites", "no");
                          $("#shuffle_background").prop("checked", true);
                          $("#shuffle_favorites").prop("checked", false)
                      }
                      localStorage.setItem("last_time_do_slide", Number(new Date));
                      l.enable()
                  }
                  localStorage.setItem("enable_slideshow", $("#enable_slideshow").is(":checked") ? "yes" : "no");
                  browser.runtime.sendMessage({
                      changeOptions: utils.getGlobalOptions()
                  });
                  utils.localstorage2cookie()
              });
              $("#delete_button").off("click");
              $("#delete_button").on("click", function() {
                  $("#error_box").hide();
                  $("#disable_weather").prop("checked", true);
                  localStorage.setItem("disable_weather", "yes");
                  browser.runtime.sendMessage({
                      changeOptions: utils.getGlobalOptions()
                  });
                  utils.localstorage2cookie()
              });
              $('[data-toggle="tooltip"]').tooltip()
          };
          e.loadGlobalOptions();
          e.loadImagesInOption = function() {
              var t = 5;
              for (var a = 1; a <= user["bg_img_list"]; a++) {
                  var o = "bg-" + (a < 100 ? ("0" + a).slice(-2) : a);
                  var l = $("<li>");
                  var i;
                  var s;
                  if (Object.keys(user["bg_color_gif"]).indexOf(o + ".gif") > -1) {
                      s = o + ".gif";
                      i = $("<img>", {
                          "data-src": s,
                          src: utils.getExtensionURL("/start/skin/images/" + o + ".gif")
                      })
                  } else {
                      s = o + ".jpg";
                      i = $("<img>", {
                          "data-src": s,
                          src: utils.getExtensionURL("/start/skin/images/" + o + ".jpg")
                      })
                  }
                  l.append(i);
                  var n = '<div class="like-container" style="display: none;"><div class="like-action" data-src="' + s + '"></div><span class="like-label"></span></div>';
                  l.append(n);
                  $("#images_selector").append(l);
                  var r, c = [];
                  if (localStorage.getItem("mark_favor")) c = JSON.parse(localStorage.getItem("mark_favor"));
                  if (c.indexOf(a + "") > -1) {
                      r = $('<span class="mark_favor marked_favor" favor-for="' + a + '" data-toggle="tooltip" data-placement="bottom" title="Remove this image from favorites"><span class="glyphicon glyphicon-heart"></span></span>')
                  } else {
                      r = $('<span class="mark_favor" favor-for="' + a + '" data-toggle="tooltip" data-placement="bottom" title="Mark this image as favorite"><span class="glyphicon glyphicon-heart-empty"></span></span>')
                  }
                  utils.resetClickHandler(r, function() {
                      var e = $(this).attr("favor-for");
                      var t = [];
                      if (localStorage.getItem("mark_favor")) t = JSON.parse(localStorage.getItem("mark_favor"));
                      $(this).toggleClass("marked_favor");
                      if ($(this).hasClass("marked_favor")) {
                          $(this).attr("data-toggle", "tooltip");
                          $(this).attr("data-placement", "bottom");
                          $(this).attr("data-original-title", "Remove this image from favorites");
                          $(this).tooltip();
                          $(this).find(".glyphicon").removeClass("glyphicon-heart-empty");
                          $(this).find(".glyphicon").addClass("glyphicon-heart");
                          if (t.indexOf(e + "") == -1) {
                              t.push(e + "")
                          }
                      } else {
                          $(this).attr("data-toggle", "tooltip");
                          $(this).attr("data-placement", "bottom");
                          $(this).attr("data-original-title", "Mark this image as favorite");
                          $(this).tooltip();
                          $(this).find(".glyphicon").removeClass("glyphicon-heart");
                          $(this).find(".glyphicon").addClass("glyphicon-heart-empty");
                          if (t.indexOf(e + "") > -1) {
                              t.splice(t.indexOf(e + ""), 1)
                          }
                      }
                      localStorage.setItem("mark_favor", JSON.stringify(t));
                      utils.localstorage2cookie()
                  });
                  $("#images_selector").append(r);
                  if (a % t == 0) {
                      $("#images_selector").append($("<br>"))
                  }
              }
              $("#images_selector li").each(function() {
                  if (($(this).find("img").attr("src") + "").indexOf(e.chosenRandomBG) > -1) {
                      $(this).addClass("selected")
                  }
              });
              String.prototype.toShortNumber = function() {
                  var e = this.toString();
                  var t = Number(e);
                  if (!t || t === NaN) {
                      var a = e.match(/\d+/g).toString();
                      t = Number(a)
                  }
                  var o;
                  if (t >= 1e9) {
                      o = (Math.round(t / 1e7) / 100).toString() + "B"
                  } else if (t >= 1e6) {
                      o = (Math.round(t / 1e4) / 100).toString() + "M"
                  } else if (t >= 1e3) {
                      o = (Math.round(t / 10) / 100).toString() + "K"
                  } else if (t < 1e3) {
                      return t.toString()
                  }
                  return o
              };

            //   function d() {
            //       if (!localStorage.getItem("ext_oid")) return;
            //       var t = "http://" + localStorage.getItem("user_group") + "." + user["firstRunDomain"] + "/v1/like/" + localStorage.getItem("ext_oid");
            //       $.get(t, function(t) {
            //           try {
            //               var a = JSON.parse(localStorage.getItem("likedImages"));
            //               var o = t.data;
            //               var l = $("#images_selector");
            //               if (o) {
            //                   o.forEach(function(e) {
            //                       var t = l.find('li img[data-src="' + e.imageName + '"]').parent().find(".like-action");
            //                       var a = l.find('li img[data-src="' + e.imageName + '"]').parent().find(".like-label");
            //                       if (a[0] && a[0].tagName == "SPAN") {
            //                           t.attr("data-id", e._id);
            //                           a.attr("title", e.likeCount.toLocaleString());
            //                           a.text(e.likeCount.toString().toShortNumber() || 0)
            //                       }
            //                   });
            //                   a.forEach(function(e) {
            //                       l.find('li img[data-src="' + e + '"]').parent().find(".like-action").addClass("active");
            //                       likeLabel = l.find('li img[data-src="' + e + '"]').parent().find(".like-label").addClass("active")
            //                   })
            //               }
            //               l.find('li[class="selected"] .like-container').fadeIn("slow")
            //           } catch (t) {
            //               if (e.debug) console.log(t)
            //           }
            //       })
            //   }
            //   d();
              $("#close_background_selector_widget").off("click");
              $("#close_background_selector_widget").on("click", function(e) {
                  $("#background_selector_widget").fadeOut()
              });
              $("#background_selector_widget").off("click");
              $("#background_selector_widget").on("click", function(e) {
                  e.stopPropagation()
              });
              $("#images_selector li .like-container").off("click");
              $("#images_selector li .like-container").on("click", function(e) {
                  e.preventDefault();
                  e.stopPropagation()
              });
              var g = [];
              $("#images_selector li .like-action").off("click");
              $("#images_selector li .like-action").on("click", function(t) {
                  t.preventDefault();
                  t.stopPropagation();
                  var a = $(this).parent("div");
                  var o = a.find(".like-label");
                  var l = $(this).data("src");
                  var i = $(this).data("id");
                  if (!i) return;
                  var s = 0;
                  var n = parseInt(o.text());
                  $(this).toggleClass("active");
                  $(this).parent().removeClass().addClass("like-container clicked").one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function() {
                      $(this).removeClass().addClass("like-container")
                  });

                  function r(t) {
                      var a = localStorage.getItem("likedImages");
                      if (!a && !g.length) {
                          g.slice(0, g.length);
                          g.push(l);
                          localStorage.setItem("likedImages", JSON.stringify(g))
                      } else {
                          try {
                              g = JSON.parse(localStorage.getItem("likedImages"));
                              var o = g.find(function(e) {
                                  return e === l
                              });
                              if (t && !o) {
                                  g.push(l)
                              } else {
                                  g.splice(g.indexOf(l), 1)
                              }
                              localStorage.setItem("likedImages", JSON.stringify(g))
                          } catch (t) {
                              if (e.debug) console.log(t)
                          }
                      }
                  }
                  if ($(this).hasClass("active")) {
                      n++;
                      s = 1;
                      r(true)
                  } else {
                      n--;
                      s = -1;
                      r(false)
                  }
                  var c = {
                      id: i,
                      src: l,
                      like: s,
                      val: utils.getHash(i + l + s)
                  };
                //   var d = "http://" + localStorage.getItem("user_group") + "." + user["firstRunDomain"] + "/v1/like";
                //   $.ajax({
                //       url: d,
                //       type: "POST",
                //       data: c,
                //       success: function(e) {
                //           o.text(e.data ? e.data.likeCount.toString().toShortNumber() : "");
                //           o.attr("title", e.data.likeCount.toLocaleString())
                //       }
                //   })
              });
              $("#background_selector_widget #tab-background li").off("click");
              $("#background_selector_widget #tab-background li").on("click", function(t) {
                  t.preventDefault();
                  t.stopPropagation();
                  var a = $(this).parent("ul");
                  a.find(".like-container").fadeOut();
                  $("#background_selector_widget li.selected").removeClass();
                  $(this).addClass("selected");
                  var o = $(this).find(".like-container");
                  o.fadeIn("slow");
                  if ($(this).find("img").length > 0) {
                      var l = $(this).find("img").attr("data-src");
                      user["bg_img"] = l;
                      user["bg_color"] = "";
                      e.setBackgroundGIFOrJPG(l)
                  } else if ($(this).attr("cl")) {
                      var i = $(this).attr("cl");
                      $("body").css({
                          "background-image": "none",
                          background: "#" + i
                      });
                      user["bg_img"] = "none";
                      user["bg_color"] = "#" + i
                  }
                  utils.localstorage2cookie()
              });
              $('[data-toggle="tooltip"]').tooltip()
          };
           
          utils.resetClickHandler($(".lnk_browserthemes"), function() {
              browser.runtime.sendMessage("click-browserThemes")
          });
          utils.resetClickHandler($(".click-Wiki"), function() {
              browser.runtime.sendMessage("click-Wiki")
          });
          utils.resetClickHandler($(".click-vWiki"), function() {
            browser.runtime.sendMessage("click-vWiki")
         });
          utils.resetClickHandler($(".uninstallSelf"), function() {
              browser.runtime.sendMessage("click-Uninstall")
          });
          utils.resetClickHandler($(".click-OfficialSite"), function() {
              browser.runtime.sendMessage("click-OfficialSite")
          });
          utils.resetClickHandler($(".click-Holodex"), function() {
            browser.runtime.sendMessage("click-Holodex")
          });
          utils.resetClickHandler($(".click-OfficialStoreJP"), function() {
            browser.runtime.sendMessage("click-OfficialStoreJP")
          });
          utils.resetClickHandler($(".click-OfficialStoreEN"), function() {
            browser.runtime.sendMessage("click-OfficialStoreEN")
          });
          utils.resetClickHandler($(".click-Schedule"), function() {
            browser.runtime.sendMessage("click-Schedule")
          });
          utils.resetClickHandler($("#tool_menu a"), function() {
              if ($(this).attr("id") == "mail-address-shower") return;
              browser.runtime.sendMessage({
                  name: "click-Apps",
                  data: $(this).text().replace(/[ ]*\([0-9]+\)[ ]*$/, "")
              })
          });
          $('[data-toggle="tooltip"]').tooltip()
      });
      e.loadBackgroundAnimations = function() {
          function t(e, t, a, o) {
              var l = document.createElement("option");
              l.value = t;
              l.textContent = a;
              o === t && l.setAttribute("selected", "selected");
              e.appendChild(l)
          }
          var a = $("#bg_animations");
          var o = localStorage.getItem("bg_animation");
          a.empty();
          t(a.get(0), "default", "Random", o);
          animations.forEach(function(e) {
              t(a.get(0), e.value, e.text, o)
          });
          a.off("change");
          a.on("change", function(t) {
              t.preventDefault();
              localStorage.setItem("bg_animation", t.target.value);
              browser.runtime.sendMessage({
                  changeOptions: utils.getGlobalOptions()
              });
              e.setNewTabBackground()
          })
      };
      e.addEventListener("load", function() {
          $("#__bg").fadeIn(350, function() {
              $("#wrapper").fadeIn(100, function() {
                  if (localStorage.getItem("theme_clicked") !== "yes") {
                      $("#background_selector_menu").css("font-family", "'neue-bold'");
                      $("#background_selector_menu").addClass(localStorage.getItem("highlight") || "highlight")
                  }
                  var a = function() {
                      $("#background_selector_menu").css("font-family", "'neue',Helvetica,Arial,sans-serif");
                      $("#background_selector_menu").attr("class", ($("#background_selector_menu").attr("class") || "").replace(/highlight[a-z_-]*[ ]*/gi, ""));
                      localStorage.setItem("theme_clicked", "yes");
                      utils.localstorage2cookie()
                  };
                  utils.resetClickHandler($("#background_selector_menu"), function(o) {
                      o.preventDefault();
                      o.stopPropagation();
                      $("#background_selector_widget").fadeIn();
                      browser.runtime.sendMessage("click-ChangeThemeMenu");
                      a();
                      if (!t) {
                          t = true;
                          e.loadImagesInOption();
                          e.loadRelativeApps()
                      }
                  })
              })
          })
      });
      var l = {
          thread: null,
          timer: 10,
          enable: function() {
              $("#selectTimer").parent().fadeIn();
              var t = this;
              if (localStorage.getItem("slideshow_timer")) {
                  t.timer = localStorage.getItem("slideshow_timer");
                  $("#selectTimer select").val(t.timer)
              }
              $("#selectTimer select").off("change");
              $("#selectTimer select").on("change", function() {
                  t.timer = parseInt($(this).val());
                  localStorage.setItem("slideshow_timer", t.timer)
              });

              function a() {
                  var a = (new Date).getTime();
                  var o = 0;
                  if (localStorage.getItem("last_time_do_slide")) {
                      o = parseInt(localStorage.getItem("last_time_do_slide"))
                  }
                  if (a - o >= t.timer * 1e3) {
                      e.setNewTabBackground();
                      localStorage.setItem("last_time_do_slide", a)
                  }
              }
              if (e.listAllThreads.threadSlideshow) {
                  e.listAllThreads.threadSlideshow.pause()
              }
              e.listAllThreads.threadSlideshow = {
                  pause: function() {
                      clearInterval(t.thread)
                  },
                  resume: function() {
                      a();
                      if (t.thread) {
                          clearInterval(t.thread);
                          t.thread = null
                      }
                      t.thread = setInterval(a, 999)
                  }
              };
              e.listAllThreads.threadSlideshow.resume()
          },
          disable: function() {
              $("#selectTimer").parent().fadeOut();
              clearInterval(this.thread);
              this.thread = null;
              delete e.listAllThreads.threadSlideshow
          }
      }
  } catch (e) {
      console.log(e)
  }
})(this);