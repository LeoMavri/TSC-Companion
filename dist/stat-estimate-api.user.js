// ==UserScript==
// @name         TSC Spies
// @namespace    Torn Stats Central
// @version      2.0.0
// @author       mitza [2549762] && mavri [2402357]
// @description  Companion script for TSC
// @license      MIT
// @copyright    2023, diicot.cc
// @icon         https://i.imgur.com/8eydsOA.png
// @downloadURL  https://github.com/LeoMavri/torn-stats-central-script/raw/main/dist/lib.tsc.user.js
// @updateURL    https://github.com/LeoMavri/torn-stats-central-script/raw/main/dist/lib.tsc.user.js
// @match        https://www.torn.com/profiles.php?*
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.xmlHttpRequest
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(o=>{if(typeof GM_addStyle=="function"){GM_addStyle(o);return}const e=document.createElement("style");e.textContent=o,document.head.append(e)})(" table.customTable{position:static;top:-8px;width:386px;background-color:#fff;border-collapse:collapse;border-width:2px;border-color:#7ea8f8;border-style:solid;overflow:scroll;z-index:999}table.customTable td,table.customTable th{border-width:2px;border-color:#282242;border-style:solid;padding:5px;color:#fff}table.customTable tbody{background-color:#333}table.customTable thead{background-color:#cf2696}.hed{padding:20px;display:flex;justify-content:center;align-items:center;color:#fff}.hed:link{color:#3777ff}.tablecolor{position:relative;top:-53px;left:100%}.clr-btn{color:#ddd;height:75%;width:17%;box-sizing:border-box;border-radius:4px;line-height:14px;padding:4px 8px;text-shadow:0 1px 0 #ffffff66;text-decoration:none;text-transform:uppercase;background:#333;min-width:30px;position:relative;top:-53px;left:100%;border:1px solid transparent;border-color:#fff;display:block}.clr-btn:hover{background:#111;color:#fff} ");

(function () {
  'use strict';

  var ErrorCode = /* @__PURE__ */ ((ErrorCode2) => {
    ErrorCode2[ErrorCode2["InvalidRequest"] = 1] = "InvalidRequest";
    ErrorCode2[ErrorCode2["Maintenance"] = 2] = "Maintenance";
    ErrorCode2[ErrorCode2["InvalidApiKey"] = 3] = "InvalidApiKey";
    ErrorCode2[ErrorCode2["InternalError"] = 4] = "InternalError";
    ErrorCode2[ErrorCode2["UserDisabled"] = 5] = "UserDisabled";
    ErrorCode2[ErrorCode2["CachedOnly"] = 6] = "CachedOnly";
    ErrorCode2[ErrorCode2["ServiceDown"] = 999] = "ServiceDown";
    return ErrorCode2;
  })(ErrorCode || {});
  function shortenNumber(number) {
    let prefix = "";
    if (number < 0)
      prefix = "-";
    let num = parseInt(number.toString().replace(/[^0-9.]/g, ""));
    if (num < 1e3) {
      return num.toString();
    }
    let si = [
      { v: 1e3, s: "K" },
      { v: 1e6, s: "M" },
      { v: 1e9, s: "B" },
      { v: 1e12, s: "T" },
      { v: 1e15, s: "P" },
      { v: 1e18, s: "E" }
    ];
    let index;
    for (index = si.length - 1; index > 0; index--) {
      if (num >= si[index].v) {
        break;
      }
    }
    return prefix + (num / si[index].v).toFixed(2).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + si[index].s;
  }
  async function waitForElement(querySelector, timeout) {
    return await new Promise((resolve, reject) => {
      let timer;
      if (timeout) {
        timer = setTimeout(() => {
          observer.disconnect();
          reject();
        }, timeout);
      }
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
    });
  }
  function createErrorHeader(text, url) {
    if (!url) {
      return `
        <div>
            <h3 class = "hed">${text}</h3>
        </div>
        `;
    }
    return `
    <div>
        <h3 class = "hed"><a href="${url}" style="color: #3777FF;">${text}</a></h3>
    </div>
    `;
  }
  const TSC_API = "https://tsc.diicot.cc/stats/update";
  const AUTHORIZATION = "10000000-6000-0000-0009-000000000001";
  const API_KEY_ENTRY = "tsc_api_key";
  async function getSpy(key, id) {
    return await new Promise((resolve, reject) => {
      const request = GM.xmlHttpRequest ?? GM.xmlhttpRequest;
      request({
        method: "POST",
        url: TSC_API,
        headers: {
          authorization: AUTHORIZATION,
          "x-requested-with": "XMLHttpRequest",
          "Content-Type": "application/json"
        },
        data: JSON.stringify({
          apiKey: key,
          userId: id
        }),
        onload(response) {
          const test = JSON.parse(response.responseText);
          console.log(test);
          resolve(test);
        },
        onerror() {
          reject({
            success: false,
            code: ErrorCode.ServiceDown
          });
        },
        timeout: 5e3
      });
    });
  }
  (async function() {
    var _a, _b;
    let key = await GM.getValue(API_KEY_ENTRY, null);
    if (key === "" || key == null) {
      key = prompt(`Please fill in your API key with the one used in Torn Stats Central.`);
      await GM.setValue(API_KEY_ENTRY, key);
      return;
    }
    const keyRegex = new RegExp(/^[a-zA-Z0-9]{16}$/);
    if (keyRegex.test(key) === false || typeof key !== "string") {
      key = prompt(
        `The API key you have entered is invalid, please try again and refresh the page.`
      );
      await GM.setValue(API_KEY_ENTRY, key);
      return;
    }
    const userIdRegex = new RegExp(/XID=(\d+)/);
    const userId = window.location.href.match(userIdRegex)[1];
    const spyInfo = await getSpy(key, userId);
    await waitForElement(
      "#profileroot > div > div > div > div:nth-child(1) > div.profile-right-wrapper.right > div.profile-buttons.profile-action > div > div.cont.bottom-round > div > div > div.empty-block",
      1e4
    );
    const profile = Array.from(
      document.getElementsByClassName(`profile-right-wrapper right`)
    )[0].getElementsByClassName(`empty-block`)[0];
    console.log(spyInfo);
    if ("error" in spyInfo) {
      profile.innerHTML += createErrorHeader(`Unexpected Response`);
      console.warn(`The API encountered an error before it could finish your request`);
      console.warn(spyInfo);
      return;
    }
    let text;
    if (spyInfo.success === false) {
      let requestNewKey = false;
      switch (spyInfo.code) {
        case ErrorCode.Maintenance:
          text = createErrorHeader(`TSC is undergoing maintenance.`);
          break;
        case ErrorCode.InvalidApiKey:
          text = createErrorHeader(`Invalid API key.`);
          requestNewKey = true;
          break;
        case ErrorCode.InternalError:
          text = createErrorHeader(`Torn API Down`);
          break;
        case ErrorCode.InvalidRequest:
          text = createErrorHeader(`Invalid request.`);
          break;
        case ErrorCode.ServiceDown:
          text = createErrorHeader(
            `TSC is down. Check Discord`,
            `https://discord.gg/eegQhTUqPS`
          );
          break;
        case ErrorCode.UserDisabled:
          text = createErrorHeader(
            `Account disabled. Check Discord`,
            `https://discord.gg/eegQhTUqPS`
          );
          break;
        case ErrorCode.CachedOnly:
          text = createErrorHeader(`User not found in cache.`);
          break;
        default:
          text = createErrorHeader(`Unknown error.`);
          break;
      }
      console.warn(`TORN STATS CENTRAL DEBUG INFORMATION BELOW`);
      console.warn(`The API has returned the following message:`);
      console.log(spyInfo);
      console.warn(`TORN STATS CENTRAL DEBUG INFORMATION ABOVE`);
      profile.innerHTML += text;
      if (requestNewKey) {
        key = prompt(
          `The API key you have entered does not match the one used in Torn Stats Central, please try again. If you believe this is an error, please contact Mavri.`
        );
        await GM.setValue(API_KEY_ENTRY, key);
      }
      return;
    }
    if ((_b = (_a = spyInfo == null ? void 0 : spyInfo.spy) == null ? void 0 : _a.statInterval) == null ? void 0 : _b.battleScore) {
      text = `
                    <table class="customTable">
                    <thead>
                        <tr>
                            <th>Battle score</th>
                            <th>Min stat range</th>
                            <th>Max stat range</th>
                            <th>Date spied</th>
                        </tr>
                        </thdead>
                    <tbody>
                        <tr>
                            <td>${shortenNumber(spyInfo.spy.statInterval.battleScore)}</td>
                            <td>${shortenNumber(spyInfo.spy.statInterval.min)}</td>
                            <td>${shortenNumber(spyInfo.spy.statInterval.max)}</td>
                            <td>${new Date(spyInfo.spy.statInterval.lastUpdated).toLocaleString().split(",")[0]}</td>
                        </tr>
                    </tbody>
                </table>
                </div>
                `;
    } else {
      text = `
                <table class="customTable">
                    <thead>
                        <tr>
                            <th>Stat estimate</th>
                            <th>Date</th>
                        </tr>
                        </thdead>
                    <tbody>
                        <tr>
                            <td>${shortenNumber(spyInfo.spy.estimate.stats)}</td>
                            <td>${new Date(spyInfo.spy.estimate.lastUpdated).toLocaleString().split(",")[0]}</td>
                        </tr>
                    </tbody>
                </table>
                </div>
            `;
    }
    profile.innerHTML += text;
  })();

})();