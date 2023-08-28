// ==UserScript==
// @name            TSC Spies
// @namespace       Torn Stats Central
// @version         1.1.5
// @author          mitza [2549762]
// @description     Thanks mitza! <3
// @copyright       2023, diicot.cc
// @grant           GM_addStyle
// @grant           GM.setValue
// @grant           GM.getValue
// @grant           GM_xmlhttpRequest
// @run-at          document-end
// @match           https://www.torn.com/profiles.php?*
// @icon            https://i.imgur.com/8eydsOA.png
// @updateURL       https://github.com/LeoMavri/torn-stats-central-script/raw/main/dist/lib.tsc.user.js
// @downloadURL     https://github.com/LeoMavri/torn-stats-central-script/raw/main/dist/lib.tsc.user.js
// ==/UserScript==
/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
const DEBUG = false;
const TSC_API = 'https://tsc.diicot.cc/stats/update';
const DEBUG_API = 'http://localhost:25565/stats/update';
const AUTHORIZATION = '10000000-6000-0000-0009-000000000001';
const API_KEY_ENTRY = 'tsc_api_key';
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["InvalidRequest"] = 1] = "InvalidRequest";
    ErrorCode[ErrorCode["Maintenance"] = 2] = "Maintenance";
    ErrorCode[ErrorCode["InvalidApiKey"] = 3] = "InvalidApiKey";
    ErrorCode[ErrorCode["InternalError"] = 4] = "InternalError";
    ErrorCode[ErrorCode["UserDisabled"] = 5] = "UserDisabled";
    ErrorCode[ErrorCode["CachedOnly"] = 6] = "CachedOnly";
    ErrorCode[ErrorCode["ServiceDown"] = 999] = "ServiceDown";
})(ErrorCode || (ErrorCode = {}));
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
    try {
        await GM.xmlHttpRequest({
            method: 'POST',
            url: debug ? DEBUG_API : TSC_API,
            headers: {
                Authorization: AUTHORIZATION,
                'x-requested-with': 'XMLHttpRequest',
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({
                apiKey: key,
                userId: id,
            }),
            onload: function (response) {
                res = JSON.parse(response.responseText);
            },
            onerror: function () {
                res = {
                    success: false,
                    code: ErrorCode.ServiceDown,
                };
            },
        });
    }
    catch (err) {
        res = {
            success: false,
            code: ErrorCode.ServiceDown,
        };
    }
    finally {
        res ?? (res = {
            success: false,
            code: ErrorCode.ServiceDown,
        });
    }
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
    let key = await GM.getValue(API_KEY_ENTRY, '');
    if (key === '') {
        key = prompt(`Please fill in your API key with the one used in Torn Stats Central.`);
        await GM.setValue(API_KEY_ENTRY, key);
        return;
    }
    const keyRegex = new RegExp(/^[a-zA-Z0-9]{16}$/);
    if (keyRegex.test(key) === false) {
        key = prompt(`The API key you have entered is invalid, please try again.`);
        await GM.setValue(API_KEY_ENTRY, key);
    }
    const userIdRegex = new RegExp(/XID=(\d+)/);
    const userId = window.location.href.match(userIdRegex)[1];
    const spyInfo = await getSpy(key, userId, DEBUG);
    await waitForElement('#profileroot > div > div > div > div:nth-child(1) > div.profile-right-wrapper.right > div.profile-buttons.profile-action > div > div.cont.bottom-round > div > div > div.empty-block', 10000);
    const profile = Array.from(document.getElementsByClassName(`profile-right-wrapper right`))[0].getElementsByClassName(`empty-block`)[0];
    let text;
    if (spyInfo.success === false) {
        let requestNewKey = false;
        switch (spyInfo.code) {
            case ErrorCode.Maintenance:
                text = `
                <div>
                    <h3 class = "hed">TSC is undergoing maintenance.</h3>
                </div>
                `;
                break;
            case ErrorCode.InvalidApiKey:
                text = `
                <div>
                    <h3 class = "hed">Invalid API key.</h3>
                </div>
                `;
                requestNewKey = true;
                break;
            case ErrorCode.InternalError:
                text = `
                <div>
                    <h3 class = "hed">Internal error.</h3>
                </div>
                `;
                break;
            case ErrorCode.InvalidRequest:
                text = `
                <div>
                    <h3 class = "hed">Invalid request.</h3>
                </div>
                `;
                break;
            case ErrorCode.ServiceDown:
                text = `
                <div>
                    <h3 class = "hed"><a href="https://discord.gg/eegQhTUqPS" style="color: #3777FF;">TSC is down. Check Discord</a></h3>
                </div>
                `;
                break;
            case ErrorCode.UserDisabled:
                text = `
                <div>
                    <h3 class = "hed"><a href="https://discord.gg/eegQhTUqPS" style="color: #3777FF;">Account disabled. Check Discord</a></h3>
                </div>
                `;
                break;
            case ErrorCode.CachedOnly:
                text = `
                <div>
                    <h3 class = "hed">User not found in cache.</h3>
                </div>
                `;
                break;
            default:
                text = `
                    <div>
                        <h3 class = "hed">Unknown error.</h3>
                    </div>
                    `;
                break;
        }
        console.warn(`TORN STATS CENTRAL DEBUG INFORMATION BELOW`);
        console.warn(`The API has returned the following message:`);
        console.log(spyInfo);
        console.warn(`TORN STATS CENTRAL DEBUG INFORMATION ABOVE`);
        profile.innerHTML += text;
        if (requestNewKey) {
            key = prompt(`The API key you have entered does not match the one used in Torn Stats Central, please try again. If you believe this is an error, please contact Mavri.`);
            await GM.setValue(API_KEY_ENTRY, key);
        }
        return;
    }
    if (spyInfo.spy.statInterval.battleScore > 0) {
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
                            <td>${new Date(spyInfo.spy.estimate.lastUpdated)
            .toLocaleString()
            .split(',')[0]}</td>
                        </tr>
                    </tbody>
                </table>
                </div>
            `;
    }
    profile.innerHTML += text;
})();
GM_addStyle(`
table.customTable {
    position:static;
    top: -8px;
    width: 386px;
    background-color: #FFFFFF;
    border-collapse: collapse;
    border-width: 2px;
    border-color: #7ea8f8;
    border-style: solid;
    overflow: scroll;
    z-index: 999;
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
.hed:link {
    color: #3777FF;
}
.tablecolor {
    position: relative;
    top :-53px;
    left:100%;
}
.clr-btn {
    color: #ddd;
    height: 75%;
    width:17%;
    box-sizing: border-box;
    border-radius: 4px;
    line-height: 14px;
    padding: 4px 8px;
    text-shadow: 0 1px 0 #ffffff66;
    text-decoration: none;
    text-transform: uppercase;
    background: #333;
    min-width: 30px;
    position: relative;
    top :-53px;
    left:100%;
    border: 1px solid transparent;
    border-color: #fff;
    display:block 
}
.clr-btn:hover {
    background: #111;
    color: #fff;
}
`);

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUNyQjs7Ozs7YUFLZixDQUFDO0tBQ1Q7SUFFRCxPQUFPLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQztBQUM5QixDQUFDLENBQUMsRUFBRSxDQUFDO0FBRUwsV0FBVyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQWlFWCxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zdGF0LWVzdGltYXRlLWFwaS8uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBERUJVRyA9IGZhbHNlO1xyXG5cclxuY29uc3QgVFNDX0FQSSA9ICdodHRwczovL3RzYy5kaWljb3QuY2Mvc3RhdHMvdXBkYXRlJztcclxuY29uc3QgREVCVUdfQVBJID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6MjU1NjUvc3RhdHMvdXBkYXRlJztcclxuY29uc3QgQVVUSE9SSVpBVElPTiA9ICcxMDAwMDAwMC02MDAwLTAwMDAtMDAwOS0wMDAwMDAwMDAwMDEnO1xyXG5cclxuY29uc3QgQVBJX0tFWV9FTlRSWSA9ICd0c2NfYXBpX2tleSc7XHJcblxyXG5lbnVtIEVycm9yQ29kZSB7XHJcbiAgICBJbnZhbGlkUmVxdWVzdCA9IDEsXHJcbiAgICBNYWludGVuYW5jZSA9IDIsXHJcbiAgICBJbnZhbGlkQXBpS2V5ID0gMyxcclxuICAgIEludGVybmFsRXJyb3IgPSA0LFxyXG4gICAgVXNlckRpc2FibGVkID0gNSxcclxuICAgIENhY2hlZE9ubHkgPSA2LFxyXG4gICAgU2VydmljZURvd24gPSA5OTksXHJcbn1cclxuXHJcbnR5cGUgU3B5RXJyb3JhYmxlID1cclxuICAgIHwge1xyXG4gICAgICAgICAgc3VjY2VzczogdHJ1ZTtcclxuICAgICAgICAgIHNweToge1xyXG4gICAgICAgICAgICAgIHVzZXJJZDogbnVtYmVyO1xyXG4gICAgICAgICAgICAgIHVzZXJOYW1lOiBzdHJpbmc7XHJcbiAgICAgICAgICAgICAgZXN0aW1hdGU6IHtcclxuICAgICAgICAgICAgICAgICAgc3RhdHM6IG51bWJlcjtcclxuICAgICAgICAgICAgICAgICAgbGFzdFVwZGF0ZWQ6IERhdGU7XHJcbiAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICBzdGF0SW50ZXJ2YWw/OiB7XHJcbiAgICAgICAgICAgICAgICAgIG1pbjogbnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgICBtYXg6IG51bWJlcjtcclxuICAgICAgICAgICAgICAgICAgYmF0dGxlU2NvcmU6IG51bWJlcjtcclxuICAgICAgICAgICAgICAgICAgbGFzdFVwZGF0ZWQ6IERhdGU7XHJcbiAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgIHwge1xyXG4gICAgICAgICAgc3VjY2VzczogZmFsc2U7XHJcbiAgICAgICAgICBjb2RlOiBFcnJvckNvZGU7XHJcbiAgICAgIH07XHJcblxyXG5mdW5jdGlvbiBzaG9ydGVuTnVtYmVyKG51bWJlcjogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgIGxldCBwcmVmaXggPSAnJztcclxuICAgIGlmIChudW1iZXIgPCAwKSBwcmVmaXggPSAnLSc7XHJcblxyXG4gICAgbGV0IG51bSA9IHBhcnNlSW50KG51bWJlci50b1N0cmluZygpLnJlcGxhY2UoL1teMC05Ll0vZywgJycpKTtcclxuICAgIGlmIChudW0gPCAxMDAwKSB7XHJcbiAgICAgICAgcmV0dXJuIG51bS50b1N0cmluZygpO1xyXG4gICAgfVxyXG4gICAgbGV0IHNpID0gW1xyXG4gICAgICAgIHsgdjogMWUzLCBzOiAnSycgfSxcclxuICAgICAgICB7IHY6IDFlNiwgczogJ00nIH0sXHJcbiAgICAgICAgeyB2OiAxZTksIHM6ICdCJyB9LFxyXG4gICAgICAgIHsgdjogMWUxMiwgczogJ1QnIH0sXHJcbiAgICAgICAgeyB2OiAxZTE1LCBzOiAnUCcgfSxcclxuICAgICAgICB7IHY6IDFlMTgsIHM6ICdFJyB9LFxyXG4gICAgXTtcclxuICAgIGxldCBpbmRleDtcclxuICAgIGZvciAoaW5kZXggPSBzaS5sZW5ndGggLSAxOyBpbmRleCA+IDA7IGluZGV4LS0pIHtcclxuICAgICAgICBpZiAobnVtID49IHNpW2luZGV4XS52KSB7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiAoXHJcbiAgICAgICAgcHJlZml4ICtcclxuICAgICAgICAobnVtIC8gc2lbaW5kZXhdLnYpLnRvRml4ZWQoMikucmVwbGFjZSgvXFwuMCskfChcXC5bMC05XSpbMS05XSkwKyQvLCAnJDEnKSArXHJcbiAgICAgICAgc2lbaW5kZXhdLnNcclxuICAgICk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFNweShrZXk6IHN0cmluZywgaWQ6IHN0cmluZywgZGVidWc6IGJvb2xlYW4pOiBQcm9taXNlPFNweUVycm9yYWJsZT4ge1xyXG4gICAgbGV0IHJlcyA9IG51bGw7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IEdNLnhtbEh0dHBSZXF1ZXN0KHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgIHVybDogZGVidWcgPyBERUJVR19BUEkgOiBUU0NfQVBJLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICBBdXRob3JpemF0aW9uOiBBVVRIT1JJWkFUSU9OLFxyXG4gICAgICAgICAgICAgICAgJ3gtcmVxdWVzdGVkLXdpdGgnOiAnWE1MSHR0cFJlcXVlc3QnLFxyXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgICAgICAgYXBpS2V5OiBrZXksXHJcbiAgICAgICAgICAgICAgICB1c2VySWQ6IGlkLFxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgb25sb2FkOiBmdW5jdGlvbiAocmVzcG9uc2U6IFRhbXBlcm1vbmtleS5SZXNwb25zZTxhbnk+KSB7XHJcbiAgICAgICAgICAgICAgICByZXMgPSBKU09OLnBhcnNlKHJlc3BvbnNlLnJlc3BvbnNlVGV4dCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uZXJyb3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJlcyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBjb2RlOiBFcnJvckNvZGUuU2VydmljZURvd24sXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0pO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgcmVzID0ge1xyXG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICAgICAgY29kZTogRXJyb3JDb2RlLlNlcnZpY2VEb3duLFxyXG4gICAgICAgIH07XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgIHJlcyA/Pz0ge1xyXG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICAgICAgY29kZTogRXJyb3JDb2RlLlNlcnZpY2VEb3duLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiB3YWl0Rm9yRWxlbWVudChxdWVyeVNlbGVjdG9yOiBzdHJpbmcsIHRpbWVvdXQ/OiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHJldHVybiBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgbGV0IHRpbWVyID0gbnVsbDtcclxuICAgICAgICBpZiAodGltZW91dCkge1xyXG4gICAgICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KCk7XHJcbiAgICAgICAgICAgIH0sIHRpbWVvdXQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChxdWVyeVNlbGVjdG9yKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHF1ZXJ5U2VsZWN0b3IpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRpbWVyICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHtcclxuICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxyXG4gICAgICAgICAgICBzdWJ0cmVlOiB0cnVlLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbihhc3luYyBmdW5jdGlvbiAoKSB7XHJcbiAgICBsZXQga2V5OiBzdHJpbmcgPSBhd2FpdCBHTS5nZXRWYWx1ZShBUElfS0VZX0VOVFJZLCAnJyk7XHJcbiAgICBpZiAoa2V5ID09PSAnJykge1xyXG4gICAgICAgIGtleSA9IHByb21wdChgUGxlYXNlIGZpbGwgaW4geW91ciBBUEkga2V5IHdpdGggdGhlIG9uZSB1c2VkIGluIFRvcm4gU3RhdHMgQ2VudHJhbC5gKTtcclxuICAgICAgICBhd2FpdCBHTS5zZXRWYWx1ZShBUElfS0VZX0VOVFJZLCBrZXkpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBrZXlSZWdleCA9IG5ldyBSZWdFeHAoL15bYS16QS1aMC05XXsxNn0kLyk7XHJcbiAgICBpZiAoa2V5UmVnZXgudGVzdChrZXkpID09PSBmYWxzZSkge1xyXG4gICAgICAgIGtleSA9IHByb21wdChgVGhlIEFQSSBrZXkgeW91IGhhdmUgZW50ZXJlZCBpcyBpbnZhbGlkLCBwbGVhc2UgdHJ5IGFnYWluLmApO1xyXG4gICAgICAgIGF3YWl0IEdNLnNldFZhbHVlKEFQSV9LRVlfRU5UUlksIGtleSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdXNlcklkUmVnZXggPSBuZXcgUmVnRXhwKC9YSUQ9KFxcZCspLyk7XHJcbiAgICBjb25zdCB1c2VySWQgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5tYXRjaCh1c2VySWRSZWdleClbMV07XHJcbiAgICBjb25zdCBzcHlJbmZvID0gYXdhaXQgZ2V0U3B5KGtleSwgdXNlcklkLCBERUJVRyk7XHJcblxyXG4gICAgYXdhaXQgd2FpdEZvckVsZW1lbnQoXHJcbiAgICAgICAgJyNwcm9maWxlcm9vdCA+IGRpdiA+IGRpdiA+IGRpdiA+IGRpdjpudGgtY2hpbGQoMSkgPiBkaXYucHJvZmlsZS1yaWdodC13cmFwcGVyLnJpZ2h0ID4gZGl2LnByb2ZpbGUtYnV0dG9ucy5wcm9maWxlLWFjdGlvbiA+IGRpdiA+IGRpdi5jb250LmJvdHRvbS1yb3VuZCA+IGRpdiA+IGRpdiA+IGRpdi5lbXB0eS1ibG9jaycsXHJcbiAgICAgICAgMTBfMDAwXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IHByb2ZpbGUgPSBBcnJheS5mcm9tKFxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoYHByb2ZpbGUtcmlnaHQtd3JhcHBlciByaWdodGApXHJcbiAgICApWzBdLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoYGVtcHR5LWJsb2NrYClbMF07XHJcblxyXG4gICAgbGV0IHRleHQ6IHN0cmluZztcclxuICAgIGlmIChzcHlJbmZvLnN1Y2Nlc3MgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgbGV0IHJlcXVlc3ROZXdLZXkgPSBmYWxzZTtcclxuICAgICAgICBzd2l0Y2ggKHNweUluZm8uY29kZSkge1xyXG4gICAgICAgICAgICBjYXNlIEVycm9yQ29kZS5NYWludGVuYW5jZTpcclxuICAgICAgICAgICAgICAgIHRleHQgPSBgXHJcbiAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMyBjbGFzcyA9IFwiaGVkXCI+VFNDIGlzIHVuZGVyZ29pbmcgbWFpbnRlbmFuY2UuPC9oMz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY2FzZSBFcnJvckNvZGUuSW52YWxpZEFwaUtleTpcclxuICAgICAgICAgICAgICAgIHRleHQgPSBgXHJcbiAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMyBjbGFzcyA9IFwiaGVkXCI+SW52YWxpZCBBUEkga2V5LjwvaDM+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIGA7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0TmV3S2V5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY2FzZSBFcnJvckNvZGUuSW50ZXJuYWxFcnJvcjpcclxuICAgICAgICAgICAgICAgIHRleHQgPSBgXHJcbiAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMyBjbGFzcyA9IFwiaGVkXCI+SW50ZXJuYWwgZXJyb3IuPC9oMz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY2FzZSBFcnJvckNvZGUuSW52YWxpZFJlcXVlc3Q6XHJcbiAgICAgICAgICAgICAgICB0ZXh0ID0gYFxyXG4gICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICA8aDMgY2xhc3MgPSBcImhlZFwiPkludmFsaWQgcmVxdWVzdC48L2gzPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlIEVycm9yQ29kZS5TZXJ2aWNlRG93bjpcclxuICAgICAgICAgICAgICAgIHRleHQgPSBgXHJcbiAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMyBjbGFzcyA9IFwiaGVkXCI+PGEgaHJlZj1cImh0dHBzOi8vZGlzY29yZC5nZy9lZWdRaFRVcVBTXCIgc3R5bGU9XCJjb2xvcjogIzM3NzdGRjtcIj5UU0MgaXMgZG93bi4gQ2hlY2sgRGlzY29yZDwvYT48L2gzPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlIEVycm9yQ29kZS5Vc2VyRGlzYWJsZWQ6XHJcbiAgICAgICAgICAgICAgICB0ZXh0ID0gYFxyXG4gICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICA8aDMgY2xhc3MgPSBcImhlZFwiPjxhIGhyZWY9XCJodHRwczovL2Rpc2NvcmQuZ2cvZWVnUWhUVXFQU1wiIHN0eWxlPVwiY29sb3I6ICMzNzc3RkY7XCI+QWNjb3VudCBkaXNhYmxlZC4gQ2hlY2sgRGlzY29yZDwvYT48L2gzPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlIEVycm9yQ29kZS5DYWNoZWRPbmx5OlxyXG4gICAgICAgICAgICAgICAgdGV4dCA9IGBcclxuICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgzIGNsYXNzID0gXCJoZWRcIj5Vc2VyIG5vdCBmb3VuZCBpbiBjYWNoZS48L2gzPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGV4dCA9IGBcclxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8aDMgY2xhc3MgPSBcImhlZFwiPlVua25vd24gZXJyb3IuPC9oMz5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zb2xlLndhcm4oYFRPUk4gU1RBVFMgQ0VOVFJBTCBERUJVRyBJTkZPUk1BVElPTiBCRUxPV2ApO1xyXG4gICAgICAgIGNvbnNvbGUud2FybihgVGhlIEFQSSBoYXMgcmV0dXJuZWQgdGhlIGZvbGxvd2luZyBtZXNzYWdlOmApO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHNweUluZm8pO1xyXG4gICAgICAgIGNvbnNvbGUud2FybihgVE9STiBTVEFUUyBDRU5UUkFMIERFQlVHIElORk9STUFUSU9OIEFCT1ZFYCk7XHJcbiAgICAgICAgcHJvZmlsZS5pbm5lckhUTUwgKz0gdGV4dDtcclxuXHJcbiAgICAgICAgaWYgKHJlcXVlc3ROZXdLZXkpIHtcclxuICAgICAgICAgICAga2V5ID0gcHJvbXB0KFxyXG4gICAgICAgICAgICAgICAgYFRoZSBBUEkga2V5IHlvdSBoYXZlIGVudGVyZWQgZG9lcyBub3QgbWF0Y2ggdGhlIG9uZSB1c2VkIGluIFRvcm4gU3RhdHMgQ2VudHJhbCwgcGxlYXNlIHRyeSBhZ2Fpbi4gSWYgeW91IGJlbGlldmUgdGhpcyBpcyBhbiBlcnJvciwgcGxlYXNlIGNvbnRhY3QgTWF2cmkuYFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBhd2FpdCBHTS5zZXRWYWx1ZShBUElfS0VZX0VOVFJZLCBrZXkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChzcHlJbmZvLnNweS5zdGF0SW50ZXJ2YWwuYmF0dGxlU2NvcmUgPiAwKSB7XHJcbiAgICAgICAgdGV4dCA9IGBcclxuICAgICAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3M9XCJjdXN0b21UYWJsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0aGVhZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoPkJhdHRsZSBzY29yZTwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGg+TWluIHN0YXQgcmFuZ2U8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoPk1heCBzdGF0IHJhbmdlPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5EYXRlIHNwaWVkPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90aGRlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+JHtzaG9ydGVuTnVtYmVyKHNweUluZm8uc3B5LnN0YXRJbnRlcnZhbC5iYXR0bGVTY29yZSl9PC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD4ke3Nob3J0ZW5OdW1iZXIoc3B5SW5mby5zcHkuc3RhdEludGVydmFsLm1pbil9PC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD4ke3Nob3J0ZW5OdW1iZXIoc3B5SW5mby5zcHkuc3RhdEludGVydmFsLm1heCl9PC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD4ke1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKHNweUluZm8uc3B5LnN0YXRJbnRlcnZhbC5sYXN0VXBkYXRlZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRvTG9jYWxlU3RyaW5nKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNwbGl0KCcsJylbMF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH08L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICBgO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0ZXh0ID0gYFxyXG4gICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwiY3VzdG9tVGFibGVcIj5cclxuICAgICAgICAgICAgICAgICAgICA8dGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5TdGF0IGVzdGltYXRlPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5EYXRlPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90aGRlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+JHtzaG9ydGVuTnVtYmVyKHNweUluZm8uc3B5LmVzdGltYXRlLnN0YXRzKX08L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkPiR7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUoc3B5SW5mby5zcHkuZXN0aW1hdGUubGFzdFVwZGF0ZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50b0xvY2FsZVN0cmluZygpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zcGxpdCgnLCcpWzBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9PC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICBgO1xyXG4gICAgfVxyXG5cclxuICAgIHByb2ZpbGUuaW5uZXJIVE1MICs9IHRleHQ7XHJcbn0pKCk7XHJcblxyXG5HTV9hZGRTdHlsZShgXHJcbnRhYmxlLmN1c3RvbVRhYmxlIHtcclxuICAgIHBvc2l0aW9uOnN0YXRpYztcclxuICAgIHRvcDogLThweDtcclxuICAgIHdpZHRoOiAzODZweDtcclxuICAgIGJhY2tncm91bmQtY29sb3I6ICNGRkZGRkY7XHJcbiAgICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlO1xyXG4gICAgYm9yZGVyLXdpZHRoOiAycHg7XHJcbiAgICBib3JkZXItY29sb3I6ICM3ZWE4Zjg7XHJcbiAgICBib3JkZXItc3R5bGU6IHNvbGlkO1xyXG4gICAgb3ZlcmZsb3c6IHNjcm9sbDtcclxuICAgIHotaW5kZXg6IDk5OTtcclxufVxyXG50YWJsZS5jdXN0b21UYWJsZSB0ZCwgdGFibGUuY3VzdG9tVGFibGUgdGgge1xyXG4gICAgYm9yZGVyLXdpZHRoOiAycHg7XHJcbiAgICBib3JkZXItY29sb3I6ICMyODIyNDI7XHJcbiAgICBib3JkZXItc3R5bGU6IHNvbGlkO1xyXG4gICAgcGFkZGluZzogNXB4O1xyXG4gICAgY29sb3I6ICNGRkZGRkY7XHJcbn1cclxudGFibGUuY3VzdG9tVGFibGUgdGJvZHkge1xyXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzMzMzMzMztcclxufVxyXG50YWJsZS5jdXN0b21UYWJsZSB0aGVhZCB7XHJcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjY2YyNjk2O1xyXG59XHJcbi5oZWQge1xyXG4gICAgcGFkZGluZzogMjBweDtcclxuICAgIGRpc3BsYXk6IGZsZXg7XHJcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcclxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAgICBjb2xvcjogI0ZGRkZGRjtcclxufVxyXG4uaGVkOmxpbmsge1xyXG4gICAgY29sb3I6ICMzNzc3RkY7XHJcbn1cclxuLnRhYmxlY29sb3Ige1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgdG9wIDotNTNweDtcclxuICAgIGxlZnQ6MTAwJTtcclxufVxyXG4uY2xyLWJ0biB7XHJcbiAgICBjb2xvcjogI2RkZDtcclxuICAgIGhlaWdodDogNzUlO1xyXG4gICAgd2lkdGg6MTclO1xyXG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcclxuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcclxuICAgIGxpbmUtaGVpZ2h0OiAxNHB4O1xyXG4gICAgcGFkZGluZzogNHB4IDhweDtcclxuICAgIHRleHQtc2hhZG93OiAwIDFweCAwICNmZmZmZmY2NjtcclxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcclxuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XHJcbiAgICBiYWNrZ3JvdW5kOiAjMzMzO1xyXG4gICAgbWluLXdpZHRoOiAzMHB4O1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgdG9wIDotNTNweDtcclxuICAgIGxlZnQ6MTAwJTtcclxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHRyYW5zcGFyZW50O1xyXG4gICAgYm9yZGVyLWNvbG9yOiAjZmZmO1xyXG4gICAgZGlzcGxheTpibG9jayBcclxufVxyXG4uY2xyLWJ0bjpob3ZlciB7XHJcbiAgICBiYWNrZ3JvdW5kOiAjMTExO1xyXG4gICAgY29sb3I6ICNmZmY7XHJcbn1cclxuYCk7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==