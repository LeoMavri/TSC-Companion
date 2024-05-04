// ==UserScript==
// @name         Torn Spies Central Companion
// @namespace    TSC
// @version      2.0.6
// @author       mitza [2549762] && mavri [2402357]
// @description  Companion script for Torn Spies Central
// @license      MIT
// @copyright    2024, diicot.cc
// @icon         https://i.imgur.com/8eydsOA.png
// @downloadURL  https://github.com/LeoMavri/TSC-Companion/raw/main/dist/tsc-companion-script.user.js
// @updateURL    https://github.com/LeoMavri/TSC-Companion/raw/main/dist/tsc-companion-script.user.js
// @match        https://www.torn.com/profiles.php?*
// @grant        GM.deleteValue
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(o=>{if(typeof GM_addStyle=="function"){GM_addStyle(o);return}const e=document.createElement("style");e.textContent=o,document.head.append(e)})(" /*! If it ever breaks on phones, this is why :p  */@media only screen and (max-width: 600px){.profile-buttons .empty-block{border-top:1px solid #fff;border-top:var(--profile-empty-block-border-top);height:60px!important}}table.customTable{position:relative;top:-8px;width:100%;height:100%;background-color:#fff;border-collapse:collapse;border-width:2px;border-color:#7ea8f8;border-style:solid;overflow:scroll;z-index:999}table.customTable td,table.customTable th{border-width:2px;border-color:#282242;border-style:solid;padding:5px;color:#fff}table.customTable tbody{background-color:#333}table.customTable thead{background-color:#cf2696}.hed{padding:20px;display:flex;justify-content:center;align-items:center;color:#fff}.hed:link{color:#3777ff}.tablecolor{position:relative;top:-53px;left:100%}.clr-btn{color:#ddd;height:75%;width:17%;box-sizing:border-box;border-radius:4px;line-height:14px;padding:4px 8px;text-shadow:0 1px 0 #ffffff66;text-decoration:none;text-transform:uppercase;background:#333;min-width:30px;position:relative;top:-53px;left:100%;border:1px solid transparent;border-color:#fff;display:block}.clr-btn:hover{background:#111;color:#fff} ");

(function () {
  'use strict';

  async function waitForElement(querySelector, timeout) {
    return await new Promise((resolve, reject) => {
      let timer;
      if (document.querySelectorAll(querySelector).length) {
        return resolve();
      }
      const observer = new MutationObserver(() => {
        if (document.querySelectorAll(querySelector).length) {
          observer.disconnect();
          if (timer != null) {
            clearTimeout(timer);
          }
          return resolve();
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      {
        timer = setTimeout(() => {
          observer.disconnect();
          reject();
        }, timeout);
      }
    });
  }
  function createErrorHeader(text, url) {
    return `
    <div>
        <h3 class = "hed"><a href="${url}" style="color: #3777FF;">${text}</a></h3>
    </div>
    `;
  }
  const API_KEY_ENTRY = "tsc_api_key";
  const PROFILE_ELEMENT = `#profileroot > div > div > div > div:nth-child(1) > div.profile-right-wrapper.right > div.profile-buttons.profile-action > div > div.cont.bottom-round > div > div > div.empty-block`;
  (async function() {
    await Promise.all([
      waitForElement(PROFILE_ELEMENT, 1e4)
      // getSpy(key, userId),
    ]);
    const profile = Array.from(
      document.getElementsByClassName(`profile-right-wrapper right`)
    )[0].getElementsByClassName(`empty-block`)[0];
    profile.innerHTML += createErrorHeader(
      'Update to the "Next" version.',
      "https://github.com/LeoMavri/TSC-Companion/tree/next"
    );
    await GM.deleteValue(API_KEY_ENTRY);
  })();

})();