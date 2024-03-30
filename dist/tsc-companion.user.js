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
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(o=>{if(typeof GM_addStyle=="function"){GM_addStyle(o);return}const r=document.createElement("style");r.textContent=o,document.head.append(r)})(" body{--tsc-bg-color: #f0f0f0;--tsc-border-color: #ccc}body.dark-mode{--tsc-bg-color: #333;--tsc-border-color: #444}.tsc-accordion{background-color:var(--tsc-bg-color);border:1px solid var(--tsc-border-color);border-radius:5px;margin:10px 0;padding:10px} ");

(function () {
  'use strict';

  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };
  const CONSTANTS = {
    DEBUG: true,
    COLOURS: {
      INFO: "#05668D",
      WARN: "#EDDEA4",
      ERROR: "#ff0000",
      DEBUG: "#5C415D"
    }
  };
  class Logger {
    static info(message, ...obj) {
      console.info(
        `%c[TSC Companion] ${message}`,
        `color: ${CONSTANTS.COLOURS.INFO}`,
        ...obj
      );
    }
    static warn(message, ...obj) {
      console.log(
        `%c[TSC Companion] ${message}`,
        `color: ${CONSTANTS.COLOURS.WARN}`,
        ...obj
      );
    }
    static error(message, ...obj) {
      console.error(
        `%c[TSC Companion] ${message}`,
        `color: ${CONSTANTS.COLOURS.ERROR}`,
        ...obj
      );
    }
    static debug(message, ...obj) {
      console.log(
        `%c[TSC Companion] ${message}`,
        `color: ${CONSTANTS.COLOURS.DEBUG}`,
        ...obj
      );
    }
  }
  class ProfilePage {
    constructor() {
      __publicField(this, "name", "Profile Page");
      __publicField(this, "description", "Shows a user's spy on their profile page");
      __publicField(this, "enabled", true);
    }
    // todo: fetch from ls
    async shouldRun() {
      return false;
    }
    async start() {
      console.log("Profile Page started");
    }
  }
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
  class SettingsPanel {
    constructor() {
      __publicField(this, "name", "Settings Panel");
      __publicField(this, "description", "Adds a settings panel to the factions page.");
      __publicField(this, "enabled", true);
    }
    // can't be disabled lol
    async shouldRun() {
      return window.location.pathname === "/factions.php";
    }
    async start() {
      const element = await waitForElement(`#factions > ul`);
      if (element === null) {
        Logger.warn(`${this.name}: Failed to find element to append to.`);
        return;
      }
      $(element).after(
        $("<details>").addClass("tsc-accordion").append($("<summary>").text("TSC Settings")).append(
          $("<p>").text(
            "This is the settings panel for the Torn Spies Central script."
          ),
          $("<p>").text(
            "Here you can configure the settings to your liking. Please note that changes will be saved automatically."
          )
          // todo: for loop through all of the settings and create a checkbox for each
        )
      );
    }
  }
  const Features = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    ProfilePage,
    SettingsPanel
  }, Symbol.toStringTag, { value: "Module" }));
  async function main() {
    for (const entry of Object.values(Features)) {
      const Feature = new entry();
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