// ==UserScript==
// @name         TSC - Companion NEXT
// @namespace    TSC
// @version      NEXT-1
// @author       mavri [2402357]
// @description  A very early version of the new TSC Companion script
// @copyright    2024, diicot.cc
// @icon         https://i.imgur.com/8eydsOA.png
// @match        https://www.torn.com/profiles.php?*
// @match        https://www.torn.com/factions.php?step=your*
// @connect      api.torn.com
// @connect      api.diicot.cc
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(o=>{if(typeof GM_addStyle=="function"){GM_addStyle(o);return}const c=document.createElement("style");c.textContent=o,document.head.append(c)})(" body{--tsc-bg-color: #f0f0f0;--tsc-border-color: #ccc;--tsc-input-color: #ccc;--tsc-text-color: #000}body.dark-mode{--tsc-bg-color: #333;--tsc-border-color: #444;--tsc-input-color: #504f4f;--tsc-text-color: #ccc}.tsc-accordion{background-color:var(--tsc-bg-color);border:1px solid var(--tsc-border-color);border-radius:5px;margin:10px 0;padding:10px}.tsc-setting-entry{display:flex;align-items:center;gap:5px;margin-bottom:5px}.tsc-key-input{width:120px;padding-left:5px;background-color:var(--tsc-input-color);color:var(--tsc-text-color)} ");

(function () {
  'use strict';

  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };
  const Features = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    get ProfilePage() {
      return ProfilePage;
    },
    get SettingsPanel() {
      return SettingsPanel;
    }
  }, Symbol.toStringTag, { value: "Module" }));
  const Constants = {
    Debug: true,
    Colours: {
      Info: "#05668D",
      Warn: "#EDDEA4",
      Error: "#ff0000",
      Debug: "#5C415D"
    }
  };
  class Logger {
    static info(message, ...obj) {
      console.info(
        `%c[TSC Companion] ${message}`,
        `color: ${Constants.Colours.Info}`,
        ...obj
      );
    }
    static warn(message, ...obj) {
      console.log(
        `%c[TSC Companion] ${message}`,
        `color: ${Constants.Colours.Warn}`,
        ...obj
      );
    }
    static error(message, ...obj) {
      console.error(
        `%c[TSC Companion] ${message}`,
        `color: ${Constants.Colours.Error}`,
        ...obj
      );
    }
    static debug(message, ...obj) {
      console.log(
        `%c[TSC Companion] ${message}`,
        `color: ${Constants.Colours.Debug}`,
        ...obj
      );
    }
  }
  class Page {
    constructor({ name, description, shouldRun, start }) {
      __publicField(this, "name");
      __publicField(this, "description");
      __publicField(this, "shouldRun");
      __publicField(this, "start");
      this.name = name;
      this.description = description;
      this.shouldRun = shouldRun;
      this.start = start;
    }
  }
  class Settings {
    constructor(storageKey) {
      __publicField(this, "storageKey");
      this.storageKey = storageKey;
    }
    getToggle(key) {
      return this.getSetting(key) === "true";
    }
    getSetting(key) {
      return localStorage.getItem(`${this.storageKey}-${key}`);
    }
    setSetting(key, value) {
      localStorage.setItem(`${this.storageKey}-${key}`, value);
    }
  }
  const Settings$1 = new Settings("kwack.mavri.tsc.rocks");
  const ProfilePage = new Page({
    name: "Profile Page",
    description: "Shows a user's spy on their profile page",
    shouldRun: async function() {
      return Settings$1.getToggle(this.name) && window.location.pathname === "/profiles.php";
    },
    start: async () => console.log("Profile Page Started")
  });
  function waitForElement(querySelector, timeout) {
    return new Promise((resolve, _reject) => {
      let timer;
      if (document.querySelectorAll(querySelector).length) {
        return resolve(document.querySelector(querySelector));
      }
      const observer = new MutationObserver(() => {
        if (document.querySelectorAll(querySelector).length) {
          observer.disconnect();
          if (timer != null) {
            clearTimeout(timer);
          }
          return resolve(document.querySelector(querySelector));
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      if (timeout) {
        timer = setTimeout(() => {
          observer.disconnect();
          resolve(null);
        }, timeout);
      }
    });
  }
  const SettingsPanel = new Page({
    name: "Settings Panel",
    description: "Adds a settings panel to the factions page.",
    shouldRun: async function() {
      return window.location.pathname === "/factions.php";
    },
    start: async function() {
      const element = await waitForElement(`#factions > ul`);
      if (element === null) {
        Logger.warn(`${this.name}: Failed to find element to append to.`);
        return;
      }
      const relevantFeatures = Object.values(Features).filter(
        (f) => f.name !== "Settings Panel"
      );
      Logger.debug(`Features:`, relevantFeatures);
      $(element).after(
        $("<details>").attr("open", "").addClass("tsc-accordion").append($("<summary>").text("TSC Settings")).append(
          $("<p>").css("margin-top", "5px").text(
            "This is the settings panel for the Torn Spies Central script."
          ),
          $("<p>").text(
            "Here you can configure the settings to your liking. Please note that changes will be saved automatically."
          ),
          // TODO: Clear cached spies, Clear all cache
          $("<br>"),
          // GLOBAL TOGGLE - BEGIN
          $("<div>").addClass("tsc-setting-entry").append(
            $("<input>").attr("type", "checkbox").attr("id", "enable").prop("checked", Settings$1.getToggle("enable")).on("change", function() {
              Settings$1.setSetting("enable", $(this).prop("checked"));
              Logger.debug(`Set enable to ${$(this).prop("checked")}`);
            })
          ).append($("<p>").text("Enable Script")),
          // GLOBAL TOGGLE - END
          $("<br>"),
          // API KEY INPUT - BEGIN
          $("<div>").addClass("tsc-setting-entry").append(
            $("<label>").attr("for", "api-key").text("API Key"),
            $("<input>").attr("type", "text").attr("id", "api-key").attr("placeholder", "Paste your key here...").addClass("tsc-key-input").val(Settings$1.getSetting("api-key") || "").on("change", function() {
              const key = $(this).val();
              if (typeof key !== "string") {
                Logger.warn("API Key is not a string.");
                return;
              }
              if (!/^[a-zA-Z0-9]{16}$/.test(key)) {
                Logger.warn("API Key is not valid.");
                this.style.outline = "1px solid red";
                return;
              }
              this.style.outline = "none";
              if (key === Settings$1.getSetting("api-key"))
                return;
              Settings$1.setSetting("api-key", key);
              Logger.debug(`Set api-key to ${key}`);
            })
          ),
          // API KEY INPUT - END
          $("<br>"),
          // FEATURE TOGGLES - BEGIN
          relevantFeatures.map(
            (feature) => $("<div>").append(
              $("<div>").addClass("tsc-setting-entry").append(
                $("<input>").attr("type", "checkbox").attr("id", feature.name).prop("checked", Settings$1.getToggle(feature.name)).on("change", function() {
                  Settings$1.setSetting(
                    feature.name,
                    $(this).prop("checked")
                  );
                  Logger.debug(
                    `Set ${feature.name} to ${$(this).prop("checked")}`
                  );
                })
              ).append($("<p>").text(feature.name))
            ).append($("<p>").text(feature.description))
          )
          // FEATURE TOGGLES - END
        )
      );
    }
  });
  async function main() {
    for (const Feature of Object.values(Features)) {
      if (await Feature.shouldRun() === false) {
        Logger.info(`${Feature.name} feature not applicable`);
        continue;
      }
      try {
        await Feature.start();
        Logger.info(`${Feature.name} feature started`);
      } catch (err) {
        Logger.error(`Failed to start ${Feature.name} feature:`, err);
      }
    }
  }
  main().catch((err) => {
    Logger.error("TSC failed catastrophically:", err);
  });

})();