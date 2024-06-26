(function(e) {
  "use strict";
  e.ga = null;
  if (e.debug) e.ga = function() {
      return false
  };
  else(function(e, t, a, r, n, o, i) {
      e["GoogleAnalyticsObject"] = n;
      e[n] = e[n] || function() {
          (e[n].q = e[n].q || []).push(arguments)
      }, e[n].l = 1 * new Date;
      o = t.createElement(a), i = t.getElementsByTagName(a)[0];
      o.async = 1;
      o.src = r;
      i.parentNode.insertBefore(o, i)
  })(e, document, "script", "https://www.google-analytics.com/analytics.js", "ga");
  var t = function() {
      var e = function() {
          return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1)
      };
      return e() + e() + "-" + e() + "-" + e() + "-" + e() + "-" + e() + e() + e()
  };
  var a = localStorage.getItem("uid") || t();
  localStorage.setItem("uid", a);
  var r = localStorage.getItem("user_group") || Math.floor(Math.random() * 10) + 1;
  localStorage.setItem("user_group", r);
  var n = {
      userId: a,
      checkProtocolTask: function() {},
      campaignId: browser.runtime.id,
      title: localStorage.getItem("gmh") || "New Tab"
  };
  ga("create", "UA-87134519-1", "auto");
  ga("set", n);
  ga("create", "UA-87134519-6", "auto", "trackInstall");
  ga("trackInstall.set", n);
  ga("create", "UA-87134519-7", "auto", "trackClick");
  ga("trackClick.set", n);
  ga("create", "UA-87134519-8", "auto", "trackSearch");
  ga("trackSearch.set", n);
  ga("create", "UA-87134519-13", "auto", "trackNoti");
  ga("trackNoti.set", n);
  ga("create", "UA-87134519-9", "auto", "trackError");
  ga("trackError.set", n);
  ga("create", "UA-91642342-" + r, "auto", "trackActive");
  ga("trackActive.set", n);
  if (location.pathname.indexOf("background") == -1) {
      var o = "/" + localStorage.getItem("ext_name") + location.pathname;
      if (e.debug) console.log("TRACK: ", "pageview", o);
      else ga("trackActive.send", "pageview", o)
  }
  Array.prototype.diff = function(e) {
      return this.filter(function(t) {
          return e.indexOf(t) < 0
      })
  };
  Array.prototype.unique = function() {
      var e = this.concat();
      for (var t = 0; t < e.length; ++t) {
          for (var a = t + 1; a < e.length; ++a) {
              if (e[t] === e[a]) e.splice(a--, 1)
          }
      }
      return e
  };
  String.prototype.capitalize = function() {
      return this.charAt(0).toUpperCase() + this.slice(1)
  };
  e.ajax = function(e, t, a, r, n) {
      var o = new XMLHttpRequest;
      o.open(e, t);
      o.timeout = 5e3;
      o.onreadystatechange = function() {
          if (o.readyState == 4 && o.status == 200) {
              if (typeof r == "function") {
                  r(o)
              }
          } else if (o.readyState == 4) {
              if (typeof n == "function") {
                  n(o.status)
              }
          }
      };
      o.send(a)
  };
  e.ajax_get = function(e, t, a, r, n) {
      ajax("GET", e, t, function(e) {
          if (typeof r == "function") {
              if (a == "xml") {
                  r(e.responseXML)
              } else if (a == "text") {
                  r(e.responseText)
              } else {
                  r(JSON.parse(e.responseText))
              }
          }
      }, n)
  };
  e.ajax_post = function(t, a, r, n, o) {
      ajax("POST", t, a, function(t) {
          if (typeof n == "function") {
              if (r == "xml") {
                  n(t.responseXML)
              } else if (r == "text") {
                  n(t.responseText)
              } else {
                  n(JSON.parse(t.responseText));
                  if (e.debug) console.log("JSON.parse(xhr.responseText)", JSON.parse(t.responseText))
              }
          }
      }, o)
  };
  e.ajax_head = function(e, t, a) {
      ajax("HEAD", e, null, function(e) {
          if (typeof t == "function") t(e)
      }, a)
  };
  e.trackStatusEvent = function(e, t, a, r) {
      var n = "";
      if (e.indexOf("search") == 0) {
          browser.runtime.sendMessage({
              search: e,
              query: a
          }, r);
          return
      } else if (e.indexOf("error") == 0) {
          n = "trackError"
      }
      if (n) {
          ga(n + "." + "send", {
              hitType: "event",
              eventCategory: browser.i18n.getMessage("extName"),
              eventAction: e,
              eventLabel: a == null || typeof a == "string" ? a : JSON.stringify(a)
          })
      }
  }
})(this);