// ==UserScript==
// @name            TSC Spies
// @namespace       Torn Stats Central
// @version         1.0.6
// @author          mitza [2549762]
// @description     Thanks mitza! <3
// @copyright       2023, diicot.cc
// @grant           GM_addStyle
// @grant           GM.setValue
// @grant           GM.getValue
// @grant           GM_xmlhttpRequest
// @run-at          document-end
// @match           https://www.torn.com/profiles.php?*
// @icon            https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @updateURL       https://github.com/LeoMavri/torn-stats-central-script/raw/main/dist/lib.tsc.user.js
// @downloadURL     https://github.com/LeoMavri/torn-stats-central-script/raw/main/dist/lib.tsc.user.js
// ==/UserScript==
/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
GM_addStyle(`
table.customTable {
  position:relative;
  top: -10px;
  width: 386px;
  background-color: #FFFFFF;
  border-collapse: collapse;
  border-width: 2px;
  border-color: #7ea8f8;
  border-style: solid;
  overflow: scroll;
}
table.customTable td, table.customTable th {
  border-width: 2px;
  border-color: #282242;
  border-style: solid;
  padding: 5px;
  color: #FFFFFF;
}
table.customTable tbody {
  background-color: #333333;
}
table.customTable thead {
  background-color: #cf2696;
}
.hed {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #FFFFFF;
}
`);
function shortenNumber(number) {
    let prefix = '';
    if (number < 0)
        prefix = '-';
    let num = parseInt(number.toString().replace(/[^0-9.]/g, ''));
    if (num < 1000) {
        return num.toString();
    }
    let si = [
        { v: 1e3, s: 'K' },
        { v: 1e6, s: 'M' },
        { v: 1e9, s: 'B' },
        { v: 1e12, s: 'T' },
        { v: 1e15, s: 'P' },
        { v: 1e18, s: 'E' },
    ];
    let index;
    for (index = si.length - 1; index > 0; index--) {
        if (num >= si[index].v) {
            break;
        }
    }
    return (prefix +
        (num / si[index].v).toFixed(2).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') +
        si[index].s);
}
async function getSpy(key, id, debug) {
    let res = null;
    const url = debug
        ? `http://localhost:25565/stats/update` :
        `https://tsc.diicot.cc/stats/update`;
    const bdy = JSON.stringify({
        apiKey: key,
        userId: id,
    });
    await GM.xmlHttpRequest({
        method: 'POST',
        url: url,
        headers: {
            Authorization: '10000000-6000-0000-0009-000000000001',
            'x-requested-with': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        },
        data: bdy,
        onload: function (response) {
            res = response.responseText;
        },
        onerror: function () {
            res = {
                success: false,
                serviceDown: true
            };
        }
    });
    // This is horrible, but it works.
    res ?? (res = `{
        "success": false,
        "serviceDown": true
    }`);
    return res;
}
async function waitForElement(querySelector, timeout) {
    return await new Promise((resolve, reject) => {
        let timer = null;
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
                if (timer !== null) {
                    clearTimeout(timer);
                }
                return resolve();
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
}
(async function () {
    const debug = false;
    let key = await GM.getValue('tsc_api_key', '');
    if (key === '') {
        key = prompt(`Please fill in your API key with the one used in Torn Stats Central`);
        await GM.setValue('tsc_api_key', key);
        return;
    }
    const keyRegex = new RegExp(/^[a-zA-Z0-9]{16}$/);
    if (keyRegex.test(key) === false) {
        key = prompt(`The API key you have entered is invalid, please try again`);
        await GM.setValue('tsc_api_key', key);
    }
    const userIdRegex = new RegExp(/XID=(\d+)/);
    const userId = window.location.href.match(userIdRegex)[1];
    const spyInfo = JSON.parse(await getSpy(key, userId, debug));
    if (spyInfo.success === false && spyInfo?.maintenance !== true && spyInfo?.serviceDown !== true) {
        key = prompt(`Something went wrong. Are you using the correct API key? Please try again. If the problem persists, please contact the developer with the apropriate logs found in the console (F12).`);
        await GM.setValue('tsc_api_key', key);
        console.warn(`TORN STATS CENTRAL DEBUG INFORMATION BELOW`);
        console.warn(`The API has returned the following message:`);
        console.table(spyInfo);
        console.warn(`TORN STATS CENTRAL DEBUG INFORMATION ABOVE`);
    }
    await waitForElement('#profileroot > div > div > div > div:nth-child(1) > div.profile-right-wrapper.right > div.profile-buttons.profile-action > div > div.cont.bottom-round > div > div > div.empty-block', 10000);
    console.log(spyInfo);
    let arr = Array.from(document.getElementsByClassName(`profile-right-wrapper right`))[0].getElementsByClassName(`empty-block`)[0];
    if (spyInfo == null) {
        arr.innerHTML += `
            <div>
                <h3 class = "hed">User not spied</h3>
            </div>
            `;
    }
    else if (spyInfo.maintenance === true) {
        arr.innerHTML += `
        <div>
            <h3 class = "hed">TSC is undergoing maintenance</h3>
        </div>
        `;
    }
    else if (spyInfo.serviceDown === true) {
        arr.innerHTML += `
        <div>
            <h3 class = "hed">TSC is down</h3>
        </div>
        `;
    }
    else if (spyInfo.spy.statInterval.battleScore > 0) {
        arr.innerHTML += `
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
                        <td>${new Date(spyInfo.spy.statInterval.lastUpdated)
            .toLocaleString()
            .split(',')[0]}</td>
                    </tr>
                </tbody>
            </table>
            </div>
            `;
    }
    else {
        arr.innerHTML += `
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
                        <td>${new Date(spyInfo.spy.estimate.lastUpdated)
            .toLocaleString()
            .split(',')[0]}</td>
                    </tr>
                </tbody>
            </table>
            </div>
        `;
    }
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUcsQ0FBQyxDQUFDLENBQUMsQ0FDckI7Ozs7O2FBS1gsQ0FBQztLQUNUO1NBQU07UUFDSCxHQUFHLENBQUMsU0FBUyxJQUFJOzs7Ozs7Ozs7OzhCQVVLLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7OEJBRTNDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQzthQUNyQyxjQUFjLEVBQUU7YUFDaEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FDckI7Ozs7O1NBS2YsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFDLEVBQUUsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3N0YXQtZXN0aW1hdGUtYXBpLy4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIkdNX2FkZFN0eWxlKGBcbnRhYmxlLmN1c3RvbVRhYmxlIHtcbiAgcG9zaXRpb246cmVsYXRpdmU7XG4gIHRvcDogLTEwcHg7XG4gIHdpZHRoOiAzODZweDtcbiAgYmFja2dyb3VuZC1jb2xvcjogI0ZGRkZGRjtcbiAgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTtcbiAgYm9yZGVyLXdpZHRoOiAycHg7XG4gIGJvcmRlci1jb2xvcjogIzdlYThmODtcbiAgYm9yZGVyLXN0eWxlOiBzb2xpZDtcbiAgb3ZlcmZsb3c6IHNjcm9sbDtcbn1cbnRhYmxlLmN1c3RvbVRhYmxlIHRkLCB0YWJsZS5jdXN0b21UYWJsZSB0aCB7XG4gIGJvcmRlci13aWR0aDogMnB4O1xuICBib3JkZXItY29sb3I6ICMyODIyNDI7XG4gIGJvcmRlci1zdHlsZTogc29saWQ7XG4gIHBhZGRpbmc6IDVweDtcbiAgY29sb3I6ICNGRkZGRkY7XG59XG50YWJsZS5jdXN0b21UYWJsZSB0Ym9keSB7XG4gIGJhY2tncm91bmQtY29sb3I6ICMzMzMzMzM7XG59XG50YWJsZS5jdXN0b21UYWJsZSB0aGVhZCB7XG4gIGJhY2tncm91bmQtY29sb3I6ICNjZjI2OTY7XG59XG4uaGVkIHtcbiAgcGFkZGluZzogMjBweDtcbiAgZGlzcGxheTogZmxleDtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGNvbG9yOiAjRkZGRkZGO1xufVxuYCk7XG5cbmludGVyZmFjZSBTcHkge1xuICAgIHN1Y2Nlc3M6IGJvb2xlYW47XG4gICAgbWVzc2FnZTogc3RyaW5nO1xuICAgIG1haW50ZW5hbmNlPzogYm9vbGVhbjtcbiAgICBzZXJ2aWNlRG93bj86IGJvb2xlYW47XG4gICAgc3B5OiB7XG4gICAgICAgIHVzZXJJZDogbnVtYmVyO1xuICAgICAgICB1c2VyTmFtZTogc3RyaW5nO1xuICAgICAgICBlc3RpbWF0ZToge1xuICAgICAgICAgICAgc3RhdHM6IG51bWJlcjtcbiAgICAgICAgICAgIGxhc3RVcGRhdGVkOiBEYXRlO1xuICAgICAgICB9O1xuICAgICAgICBzdGF0SW50ZXJ2YWw6IHtcbiAgICAgICAgICAgIG1pbjogbnVtYmVyO1xuICAgICAgICAgICAgbWF4OiBudW1iZXI7XG4gICAgICAgICAgICBiYXR0bGVTY29yZTogbnVtYmVyO1xuICAgICAgICAgICAgbGFzdFVwZGF0ZWQ6IERhdGU7XG4gICAgICAgIH07XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gc2hvcnRlbk51bWJlcihudW1iZXI6IG51bWJlcik6IHN0cmluZyB7XG4gICAgbGV0IHByZWZpeCA9ICcnO1xuICAgIGlmIChudW1iZXIgPCAwKSBwcmVmaXggPSAnLSc7XG5cbiAgICBsZXQgbnVtID0gcGFyc2VJbnQobnVtYmVyLnRvU3RyaW5nKCkucmVwbGFjZSgvW14wLTkuXS9nLCAnJykpO1xuICAgIGlmIChudW0gPCAxMDAwKSB7XG4gICAgICAgIHJldHVybiBudW0udG9TdHJpbmcoKTtcbiAgICB9XG4gICAgbGV0IHNpID0gW1xuICAgICAgICB7IHY6IDFlMywgczogJ0snIH0sXG4gICAgICAgIHsgdjogMWU2LCBzOiAnTScgfSxcbiAgICAgICAgeyB2OiAxZTksIHM6ICdCJyB9LFxuICAgICAgICB7IHY6IDFlMTIsIHM6ICdUJyB9LFxuICAgICAgICB7IHY6IDFlMTUsIHM6ICdQJyB9LFxuICAgICAgICB7IHY6IDFlMTgsIHM6ICdFJyB9LFxuICAgIF07XG4gICAgbGV0IGluZGV4O1xuICAgIGZvciAoaW5kZXggPSBzaS5sZW5ndGggLSAxOyBpbmRleCA+IDA7IGluZGV4LS0pIHtcbiAgICAgICAgaWYgKG51bSA+PSBzaVtpbmRleF0udikge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgICAgcHJlZml4ICtcbiAgICAgICAgKG51bSAvIHNpW2luZGV4XS52KS50b0ZpeGVkKDIpLnJlcGxhY2UoL1xcLjArJHwoXFwuWzAtOV0qWzEtOV0pMCskLywgJyQxJykgK1xuICAgICAgICBzaVtpbmRleF0uc1xuICAgICk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFNweShrZXk6IHN0cmluZywgaWQ6IHN0cmluZywgZGVidWc6IGJvb2xlYW4pOiBQcm9taXNlPGFueT4ge1xuICAgIGxldCByZXMgPSBudWxsO1xuICAgIGNvbnN0IHVybCA9IGRlYnVnXG4gICAgICAgID8gYGh0dHA6Ly9sb2NhbGhvc3Q6MjU1NjUvc3RhdHMvdXBkYXRlYCA6XG4gICAgICAgIGBodHRwczovL3RzYy5kaWljb3QuY2Mvc3RhdHMvdXBkYXRlYFxuXG4gICAgY29uc3QgYmR5ID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBhcGlLZXk6IGtleSxcbiAgICAgICAgdXNlcklkOiBpZCxcbiAgICB9KTtcblxuICAgIGF3YWl0IEdNLnhtbEh0dHBSZXF1ZXN0KHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIHVybDogdXJsLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICBBdXRob3JpemF0aW9uOiAnMTAwMDAwMDAtNjAwMC0wMDAwLTAwMDktMDAwMDAwMDAwMDAxJyxcbiAgICAgICAgICAgICd4LXJlcXVlc3RlZC13aXRoJzogJ1hNTEh0dHBSZXF1ZXN0JyxcbiAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgIH0sXG4gICAgICAgIGRhdGE6IGJkeSxcbiAgICAgICAgb25sb2FkOiBmdW5jdGlvbiAocmVzcG9uc2U6IFRhbXBlcm1vbmtleS5SZXNwb25zZTxhbnk+KSB7XG4gICAgICAgICAgICByZXMgPSByZXNwb25zZS5yZXNwb25zZVRleHQ7XG4gICAgICAgIH0sXG4gICAgICAgIG9uZXJyb3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJlcyA9IHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzZXJ2aWNlRG93bjogdHJ1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gVGhpcyBpcyBob3JyaWJsZSwgYnV0IGl0IHdvcmtzLlxuICAgIHJlcyA/Pz0gYHtcbiAgICAgICAgXCJzdWNjZXNzXCI6IGZhbHNlLFxuICAgICAgICBcInNlcnZpY2VEb3duXCI6IHRydWVcbiAgICB9YDtcblxuICAgIHJldHVybiByZXM7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHdhaXRGb3JFbGVtZW50KHF1ZXJ5U2VsZWN0b3I6IHN0cmluZywgdGltZW91dD86IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGxldCB0aW1lciA9IG51bGw7XG4gICAgICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHF1ZXJ5U2VsZWN0b3IpLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHF1ZXJ5U2VsZWN0b3IpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICBpZiAodGltZXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwge1xuICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbihhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgZGVidWcgPSBmYWxzZTtcbiAgICBsZXQga2V5OiBzdHJpbmcgPSBhd2FpdCBHTS5nZXRWYWx1ZSgndHNjX2FwaV9rZXknLCAnJyk7XG4gICAgaWYgKGtleSA9PT0gJycpIHtcbiAgICAgICAga2V5ID0gcHJvbXB0KGBQbGVhc2UgZmlsbCBpbiB5b3VyIEFQSSBrZXkgd2l0aCB0aGUgb25lIHVzZWQgaW4gVG9ybiBTdGF0cyBDZW50cmFsYCk7XG4gICAgICAgIGF3YWl0IEdNLnNldFZhbHVlKCd0c2NfYXBpX2tleScsIGtleSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBrZXlSZWdleCA9IG5ldyBSZWdFeHAoL15bYS16QS1aMC05XXsxNn0kLyk7XG4gICAgaWYgKGtleVJlZ2V4LnRlc3Qoa2V5KSA9PT0gZmFsc2UpIHtcbiAgICAgICAga2V5ID0gcHJvbXB0KGBUaGUgQVBJIGtleSB5b3UgaGF2ZSBlbnRlcmVkIGlzIGludmFsaWQsIHBsZWFzZSB0cnkgYWdhaW5gKTtcbiAgICAgICAgYXdhaXQgR00uc2V0VmFsdWUoJ3RzY19hcGlfa2V5Jywga2V5KTtcbiAgICB9XG5cbiAgICBjb25zdCB1c2VySWRSZWdleCA9IG5ldyBSZWdFeHAoL1hJRD0oXFxkKykvKTtcbiAgICBjb25zdCB1c2VySWQgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5tYXRjaCh1c2VySWRSZWdleClbMV07XG4gICAgY29uc3Qgc3B5SW5mbzogU3B5ID0gSlNPTi5wYXJzZShhd2FpdCBnZXRTcHkoa2V5LCB1c2VySWQsIGRlYnVnKSk7XG5cbiAgICBpZiAoc3B5SW5mby5zdWNjZXNzID09PSBmYWxzZSAmJiBzcHlJbmZvPy5tYWludGVuYW5jZSAhPT0gdHJ1ZSAmJiBzcHlJbmZvPy5zZXJ2aWNlRG93biAhPT0gdHJ1ZSkge1xuICAgICAgICBrZXkgPSBwcm9tcHQoXG4gICAgICAgICAgICBgU29tZXRoaW5nIHdlbnQgd3JvbmcuIEFyZSB5b3UgdXNpbmcgdGhlIGNvcnJlY3QgQVBJIGtleT8gUGxlYXNlIHRyeSBhZ2Fpbi4gSWYgdGhlIHByb2JsZW0gcGVyc2lzdHMsIHBsZWFzZSBjb250YWN0IHRoZSBkZXZlbG9wZXIgd2l0aCB0aGUgYXByb3ByaWF0ZSBsb2dzIGZvdW5kIGluIHRoZSBjb25zb2xlIChGMTIpLmBcbiAgICAgICAgKTtcbiAgICAgICAgYXdhaXQgR00uc2V0VmFsdWUoJ3RzY19hcGlfa2V5Jywga2V5KTtcbiAgICAgICAgY29uc29sZS53YXJuKGBUT1JOIFNUQVRTIENFTlRSQUwgREVCVUcgSU5GT1JNQVRJT04gQkVMT1dgKTtcbiAgICAgICAgY29uc29sZS53YXJuKGBUaGUgQVBJIGhhcyByZXR1cm5lZCB0aGUgZm9sbG93aW5nIG1lc3NhZ2U6YCk7XG4gICAgICAgIGNvbnNvbGUudGFibGUoc3B5SW5mbyk7XG4gICAgICAgIGNvbnNvbGUud2FybihgVE9STiBTVEFUUyBDRU5UUkFMIERFQlVHIElORk9STUFUSU9OIEFCT1ZFYCk7XG4gICAgfVxuXG4gICAgYXdhaXQgd2FpdEZvckVsZW1lbnQoXG4gICAgICAgICcjcHJvZmlsZXJvb3QgPiBkaXYgPiBkaXYgPiBkaXYgPiBkaXY6bnRoLWNoaWxkKDEpID4gZGl2LnByb2ZpbGUtcmlnaHQtd3JhcHBlci5yaWdodCA+IGRpdi5wcm9maWxlLWJ1dHRvbnMucHJvZmlsZS1hY3Rpb24gPiBkaXYgPiBkaXYuY29udC5ib3R0b20tcm91bmQgPiBkaXYgPiBkaXYgPiBkaXYuZW1wdHktYmxvY2snLFxuICAgICAgICAxMF8wMDBcbiAgICApO1xuXG4gICAgY29uc29sZS5sb2coc3B5SW5mbyk7XG5cbiAgICBsZXQgYXJyID0gQXJyYXkuZnJvbShcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShgcHJvZmlsZS1yaWdodC13cmFwcGVyIHJpZ2h0YClcbiAgICApWzBdLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoYGVtcHR5LWJsb2NrYClbMF07XG5cbiAgICBpZiAoc3B5SW5mbyA9PSBudWxsKSB7XG4gICAgICAgIGFyci5pbm5lckhUTUwgKz0gYFxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8aDMgY2xhc3MgPSBcImhlZFwiPlVzZXIgbm90IHNwaWVkPC9oMz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgYDtcbiAgICB9IGVsc2UgaWYgKHNweUluZm8ubWFpbnRlbmFuY2UgPT09IHRydWUpIHtcbiAgICAgICAgYXJyLmlubmVySFRNTCArPSBgXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8aDMgY2xhc3MgPSBcImhlZFwiPlRTQyBpcyB1bmRlcmdvaW5nIG1haW50ZW5hbmNlPC9oMz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIGA7XG4gICAgfSBlbHNlIGlmIChzcHlJbmZvLnNlcnZpY2VEb3duID09PSB0cnVlKSB7XG4gICAgICAgIGFyci5pbm5lckhUTUwgKz0gYFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgzIGNsYXNzID0gXCJoZWRcIj5UU0MgaXMgZG93bjwvaDM+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICBgO1xuICAgIH0gZWxzZSBpZiAoc3B5SW5mby5zcHkuc3RhdEludGVydmFsLmJhdHRsZVNjb3JlID4gMCkge1xuICAgICAgICBhcnIuaW5uZXJIVE1MICs9IGBcbiAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3M9XCJjdXN0b21UYWJsZVwiPlxuICAgICAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoPkJhdHRsZSBzY29yZTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGg+TWluIHN0YXQgcmFuZ2U8L3RoPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoPk1heCBzdGF0IHJhbmdlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5EYXRlIHNwaWVkPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgPC90aGRlYWQ+XG4gICAgICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQ+JHtzaG9ydGVuTnVtYmVyKHNweUluZm8uc3B5LnN0YXRJbnRlcnZhbC5iYXR0bGVTY29yZSl9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD4ke3Nob3J0ZW5OdW1iZXIoc3B5SW5mby5zcHkuc3RhdEludGVydmFsLm1pbil9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD4ke3Nob3J0ZW5OdW1iZXIoc3B5SW5mby5zcHkuc3RhdEludGVydmFsLm1heCl9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD4ke1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKHNweUluZm8uc3B5LnN0YXRJbnRlcnZhbC5sYXN0VXBkYXRlZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRvTG9jYWxlU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNwbGl0KCcsJylbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgIH08L3RkPlxuICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICBgO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGFyci5pbm5lckhUTUwgKz0gYFxuICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwiY3VzdG9tVGFibGVcIj5cbiAgICAgICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5TdGF0IGVzdGltYXRlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5EYXRlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgPC90aGRlYWQ+XG4gICAgICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQ+JHtzaG9ydGVuTnVtYmVyKHNweUluZm8uc3B5LmVzdGltYXRlLnN0YXRzKX08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkPiR7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUoc3B5SW5mby5zcHkuZXN0aW1hdGUubGFzdFVwZGF0ZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50b0xvY2FsZVN0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zcGxpdCgnLCcpWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICB9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICBgO1xuICAgIH1cbn0pKCk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=