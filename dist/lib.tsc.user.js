// ==UserScript==
// @name            TSC Spies
// @namespace       Torn Stats Central
// @version         1.1.6
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
// You don't really want to mess with anything here :p
// Do you have any suggestions? Feel free to contact either of us on Torn (mavri [2402357] / mitza[2549762]) or on Discord (@mavri.dev).
// If you're wondering why this looks so weird, it's becaused this is written in TypeScript, transpiled to JavaScript and then packed with Webpack.
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
async function getSpy(key, id) {
    let res = null;
    try {
        await GM.xmlHttpRequest({
            method: 'POST',
            url: DEBUG ? DEBUG_API : TSC_API,
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
    const spyInfo = await getSpy(key, userId);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QyxjQUFjLEVBQUU7YUFDaEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FDckI7Ozs7O2FBS2YsQ0FBQztLQUNUO0lBRUQsT0FBTyxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUM7QUFDOUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUVMLFdBQVcsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FpRVgsQ0FBQyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc3RhdC1lc3RpbWF0ZS1hcGkvLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gWW91IGRvbid0IHJlYWxseSB3YW50IHRvIG1lc3Mgd2l0aCBhbnl0aGluZyBoZXJlIDpwXHJcbi8vIERvIHlvdSBoYXZlIGFueSBzdWdnZXN0aW9ucz8gRmVlbCBmcmVlIHRvIGNvbnRhY3QgZWl0aGVyIG9mIHVzIG9uIFRvcm4gKG1hdnJpIFsyNDAyMzU3XSAvIG1pdHphWzI1NDk3NjJdKSBvciBvbiBEaXNjb3JkIChAbWF2cmkuZGV2KS5cclxuLy8gSWYgeW91J3JlIHdvbmRlcmluZyB3aHkgdGhpcyBsb29rcyBzbyB3ZWlyZCwgaXQncyBiZWNhdXNlZCB0aGlzIGlzIHdyaXR0ZW4gaW4gVHlwZVNjcmlwdCwgdHJhbnNwaWxlZCB0byBKYXZhU2NyaXB0IGFuZCB0aGVuIHBhY2tlZCB3aXRoIFdlYnBhY2suXHJcbmNvbnN0IERFQlVHID0gZmFsc2U7XHJcblxyXG5jb25zdCBUU0NfQVBJID0gJ2h0dHBzOi8vdHNjLmRpaWNvdC5jYy9zdGF0cy91cGRhdGUnO1xyXG5jb25zdCBERUJVR19BUEkgPSAnaHR0cDovL2xvY2FsaG9zdDoyNTU2NS9zdGF0cy91cGRhdGUnO1xyXG5jb25zdCBBVVRIT1JJWkFUSU9OID0gJzEwMDAwMDAwLTYwMDAtMDAwMC0wMDA5LTAwMDAwMDAwMDAwMSc7XHJcblxyXG5jb25zdCBBUElfS0VZX0VOVFJZID0gJ3RzY19hcGlfa2V5JztcclxuXHJcbmVudW0gRXJyb3JDb2RlIHtcclxuICAgIEludmFsaWRSZXF1ZXN0ID0gMSxcclxuICAgIE1haW50ZW5hbmNlID0gMixcclxuICAgIEludmFsaWRBcGlLZXkgPSAzLFxyXG4gICAgSW50ZXJuYWxFcnJvciA9IDQsXHJcbiAgICBVc2VyRGlzYWJsZWQgPSA1LFxyXG4gICAgQ2FjaGVkT25seSA9IDYsXHJcbiAgICBTZXJ2aWNlRG93biA9IDk5OSxcclxufVxyXG5cclxudHlwZSBTcHlFcnJvcmFibGUgPVxyXG4gICAgfCB7XHJcbiAgICAgICAgICBzdWNjZXNzOiB0cnVlO1xyXG4gICAgICAgICAgc3B5OiB7XHJcbiAgICAgICAgICAgICAgdXNlcklkOiBudW1iZXI7XHJcbiAgICAgICAgICAgICAgdXNlck5hbWU6IHN0cmluZztcclxuICAgICAgICAgICAgICBlc3RpbWF0ZToge1xyXG4gICAgICAgICAgICAgICAgICBzdGF0czogbnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgICBsYXN0VXBkYXRlZDogRGF0ZTtcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgIHN0YXRJbnRlcnZhbD86IHtcclxuICAgICAgICAgICAgICAgICAgbWluOiBudW1iZXI7XHJcbiAgICAgICAgICAgICAgICAgIG1heDogbnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgICBiYXR0bGVTY29yZTogbnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgICBsYXN0VXBkYXRlZDogRGF0ZTtcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgfCB7XHJcbiAgICAgICAgICBzdWNjZXNzOiBmYWxzZTtcclxuICAgICAgICAgIGNvZGU6IEVycm9yQ29kZTtcclxuICAgICAgfTtcclxuXHJcbmZ1bmN0aW9uIHNob3J0ZW5OdW1iZXIobnVtYmVyOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgbGV0IHByZWZpeCA9ICcnO1xyXG4gICAgaWYgKG51bWJlciA8IDApIHByZWZpeCA9ICctJztcclxuXHJcbiAgICBsZXQgbnVtID0gcGFyc2VJbnQobnVtYmVyLnRvU3RyaW5nKCkucmVwbGFjZSgvW14wLTkuXS9nLCAnJykpO1xyXG4gICAgaWYgKG51bSA8IDEwMDApIHtcclxuICAgICAgICByZXR1cm4gbnVtLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcbiAgICBsZXQgc2kgPSBbXHJcbiAgICAgICAgeyB2OiAxZTMsIHM6ICdLJyB9LFxyXG4gICAgICAgIHsgdjogMWU2LCBzOiAnTScgfSxcclxuICAgICAgICB7IHY6IDFlOSwgczogJ0InIH0sXHJcbiAgICAgICAgeyB2OiAxZTEyLCBzOiAnVCcgfSxcclxuICAgICAgICB7IHY6IDFlMTUsIHM6ICdQJyB9LFxyXG4gICAgICAgIHsgdjogMWUxOCwgczogJ0UnIH0sXHJcbiAgICBdO1xyXG4gICAgbGV0IGluZGV4O1xyXG4gICAgZm9yIChpbmRleCA9IHNpLmxlbmd0aCAtIDE7IGluZGV4ID4gMDsgaW5kZXgtLSkge1xyXG4gICAgICAgIGlmIChudW0gPj0gc2lbaW5kZXhdLnYpIHtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIChcclxuICAgICAgICBwcmVmaXggK1xyXG4gICAgICAgIChudW0gLyBzaVtpbmRleF0udikudG9GaXhlZCgyKS5yZXBsYWNlKC9cXC4wKyR8KFxcLlswLTldKlsxLTldKTArJC8sICckMScpICtcclxuICAgICAgICBzaVtpbmRleF0uc1xyXG4gICAgKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZ2V0U3B5KGtleTogc3RyaW5nLCBpZDogc3RyaW5nKTogUHJvbWlzZTxTcHlFcnJvcmFibGU+IHtcclxuICAgIGxldCByZXMgPSBudWxsO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBHTS54bWxIdHRwUmVxdWVzdCh7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICB1cmw6IERFQlVHID8gREVCVUdfQVBJIDogVFNDX0FQSSxcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogQVVUSE9SSVpBVElPTixcclxuICAgICAgICAgICAgICAgICd4LXJlcXVlc3RlZC13aXRoJzogJ1hNTEh0dHBSZXF1ZXN0JyxcclxuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgICAgICAgIGFwaUtleToga2V5LFxyXG4gICAgICAgICAgICAgICAgdXNlcklkOiBpZCxcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIG9ubG9hZDogZnVuY3Rpb24gKHJlc3BvbnNlOiBUYW1wZXJtb25rZXkuUmVzcG9uc2U8YW55Pikge1xyXG4gICAgICAgICAgICAgICAgcmVzID0gSlNPTi5wYXJzZShyZXNwb25zZS5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbmVycm9yOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgY29kZTogRXJyb3JDb2RlLlNlcnZpY2VEb3duLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgIHJlcyA9IHtcclxuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgICAgIGNvZGU6IEVycm9yQ29kZS5TZXJ2aWNlRG93bixcclxuICAgICAgICB9O1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgICByZXMgPz89IHtcclxuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgICAgIGNvZGU6IEVycm9yQ29kZS5TZXJ2aWNlRG93bixcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlcztcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gd2FpdEZvckVsZW1lbnQocXVlcnlTZWxlY3Rvcjogc3RyaW5nLCB0aW1lb3V0PzogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICByZXR1cm4gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgIGxldCB0aW1lciA9IG51bGw7XHJcbiAgICAgICAgaWYgKHRpbWVvdXQpIHtcclxuICAgICAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcclxuICAgICAgICAgICAgICAgIHJlamVjdCgpO1xyXG4gICAgICAgICAgICB9LCB0aW1lb3V0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwocXVlcnlTZWxlY3RvcikubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChxdWVyeVNlbGVjdG9yKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aW1lciAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XHJcbiAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcclxuICAgICAgICAgICAgc3VidHJlZTogdHJ1ZSxcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4oYXN5bmMgZnVuY3Rpb24gKCkge1xyXG4gICAgbGV0IGtleTogc3RyaW5nID0gYXdhaXQgR00uZ2V0VmFsdWUoQVBJX0tFWV9FTlRSWSwgJycpO1xyXG4gICAgaWYgKGtleSA9PT0gJycpIHtcclxuICAgICAgICBrZXkgPSBwcm9tcHQoYFBsZWFzZSBmaWxsIGluIHlvdXIgQVBJIGtleSB3aXRoIHRoZSBvbmUgdXNlZCBpbiBUb3JuIFN0YXRzIENlbnRyYWwuYCk7XHJcbiAgICAgICAgYXdhaXQgR00uc2V0VmFsdWUoQVBJX0tFWV9FTlRSWSwga2V5KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qga2V5UmVnZXggPSBuZXcgUmVnRXhwKC9eW2EtekEtWjAtOV17MTZ9JC8pO1xyXG4gICAgaWYgKGtleVJlZ2V4LnRlc3Qoa2V5KSA9PT0gZmFsc2UpIHtcclxuICAgICAgICBrZXkgPSBwcm9tcHQoYFRoZSBBUEkga2V5IHlvdSBoYXZlIGVudGVyZWQgaXMgaW52YWxpZCwgcGxlYXNlIHRyeSBhZ2Fpbi5gKTtcclxuICAgICAgICBhd2FpdCBHTS5zZXRWYWx1ZShBUElfS0VZX0VOVFJZLCBrZXkpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHVzZXJJZFJlZ2V4ID0gbmV3IFJlZ0V4cCgvWElEPShcXGQrKS8pO1xyXG4gICAgY29uc3QgdXNlcklkID0gd2luZG93LmxvY2F0aW9uLmhyZWYubWF0Y2godXNlcklkUmVnZXgpWzFdO1xyXG4gICAgY29uc3Qgc3B5SW5mbyA9IGF3YWl0IGdldFNweShrZXksIHVzZXJJZCk7XHJcblxyXG4gICAgYXdhaXQgd2FpdEZvckVsZW1lbnQoXHJcbiAgICAgICAgJyNwcm9maWxlcm9vdCA+IGRpdiA+IGRpdiA+IGRpdiA+IGRpdjpudGgtY2hpbGQoMSkgPiBkaXYucHJvZmlsZS1yaWdodC13cmFwcGVyLnJpZ2h0ID4gZGl2LnByb2ZpbGUtYnV0dG9ucy5wcm9maWxlLWFjdGlvbiA+IGRpdiA+IGRpdi5jb250LmJvdHRvbS1yb3VuZCA+IGRpdiA+IGRpdiA+IGRpdi5lbXB0eS1ibG9jaycsXHJcbiAgICAgICAgMTBfMDAwXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IHByb2ZpbGUgPSBBcnJheS5mcm9tKFxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoYHByb2ZpbGUtcmlnaHQtd3JhcHBlciByaWdodGApXHJcbiAgICApWzBdLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoYGVtcHR5LWJsb2NrYClbMF07XHJcblxyXG4gICAgbGV0IHRleHQ6IHN0cmluZztcclxuICAgIGlmIChzcHlJbmZvLnN1Y2Nlc3MgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgbGV0IHJlcXVlc3ROZXdLZXkgPSBmYWxzZTtcclxuICAgICAgICBzd2l0Y2ggKHNweUluZm8uY29kZSkge1xyXG4gICAgICAgICAgICBjYXNlIEVycm9yQ29kZS5NYWludGVuYW5jZTpcclxuICAgICAgICAgICAgICAgIHRleHQgPSBgXHJcbiAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMyBjbGFzcyA9IFwiaGVkXCI+VFNDIGlzIHVuZGVyZ29pbmcgbWFpbnRlbmFuY2UuPC9oMz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY2FzZSBFcnJvckNvZGUuSW52YWxpZEFwaUtleTpcclxuICAgICAgICAgICAgICAgIHRleHQgPSBgXHJcbiAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMyBjbGFzcyA9IFwiaGVkXCI+SW52YWxpZCBBUEkga2V5LjwvaDM+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIGA7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0TmV3S2V5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY2FzZSBFcnJvckNvZGUuSW50ZXJuYWxFcnJvcjpcclxuICAgICAgICAgICAgICAgIHRleHQgPSBgXHJcbiAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMyBjbGFzcyA9IFwiaGVkXCI+SW50ZXJuYWwgZXJyb3IuPC9oMz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY2FzZSBFcnJvckNvZGUuSW52YWxpZFJlcXVlc3Q6XHJcbiAgICAgICAgICAgICAgICB0ZXh0ID0gYFxyXG4gICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICA8aDMgY2xhc3MgPSBcImhlZFwiPkludmFsaWQgcmVxdWVzdC48L2gzPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlIEVycm9yQ29kZS5TZXJ2aWNlRG93bjpcclxuICAgICAgICAgICAgICAgIHRleHQgPSBgXHJcbiAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxoMyBjbGFzcyA9IFwiaGVkXCI+PGEgaHJlZj1cImh0dHBzOi8vZGlzY29yZC5nZy9lZWdRaFRVcVBTXCIgc3R5bGU9XCJjb2xvcjogIzM3NzdGRjtcIj5UU0MgaXMgZG93bi4gQ2hlY2sgRGlzY29yZDwvYT48L2gzPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlIEVycm9yQ29kZS5Vc2VyRGlzYWJsZWQ6XHJcbiAgICAgICAgICAgICAgICB0ZXh0ID0gYFxyXG4gICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICA8aDMgY2xhc3MgPSBcImhlZFwiPjxhIGhyZWY9XCJodHRwczovL2Rpc2NvcmQuZ2cvZWVnUWhUVXFQU1wiIHN0eWxlPVwiY29sb3I6ICMzNzc3RkY7XCI+QWNjb3VudCBkaXNhYmxlZC4gQ2hlY2sgRGlzY29yZDwvYT48L2gzPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlIEVycm9yQ29kZS5DYWNoZWRPbmx5OlxyXG4gICAgICAgICAgICAgICAgdGV4dCA9IGBcclxuICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGgzIGNsYXNzID0gXCJoZWRcIj5Vc2VyIG5vdCBmb3VuZCBpbiBjYWNoZS48L2gzPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGV4dCA9IGBcclxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8aDMgY2xhc3MgPSBcImhlZFwiPlVua25vd24gZXJyb3IuPC9oMz5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zb2xlLndhcm4oYFRPUk4gU1RBVFMgQ0VOVFJBTCBERUJVRyBJTkZPUk1BVElPTiBCRUxPV2ApO1xyXG4gICAgICAgIGNvbnNvbGUud2FybihgVGhlIEFQSSBoYXMgcmV0dXJuZWQgdGhlIGZvbGxvd2luZyBtZXNzYWdlOmApO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHNweUluZm8pO1xyXG4gICAgICAgIGNvbnNvbGUud2FybihgVE9STiBTVEFUUyBDRU5UUkFMIERFQlVHIElORk9STUFUSU9OIEFCT1ZFYCk7XHJcbiAgICAgICAgcHJvZmlsZS5pbm5lckhUTUwgKz0gdGV4dDtcclxuXHJcbiAgICAgICAgaWYgKHJlcXVlc3ROZXdLZXkpIHtcclxuICAgICAgICAgICAga2V5ID0gcHJvbXB0KFxyXG4gICAgICAgICAgICAgICAgYFRoZSBBUEkga2V5IHlvdSBoYXZlIGVudGVyZWQgZG9lcyBub3QgbWF0Y2ggdGhlIG9uZSB1c2VkIGluIFRvcm4gU3RhdHMgQ2VudHJhbCwgcGxlYXNlIHRyeSBhZ2Fpbi4gSWYgeW91IGJlbGlldmUgdGhpcyBpcyBhbiBlcnJvciwgcGxlYXNlIGNvbnRhY3QgTWF2cmkuYFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBhd2FpdCBHTS5zZXRWYWx1ZShBUElfS0VZX0VOVFJZLCBrZXkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChzcHlJbmZvLnNweS5zdGF0SW50ZXJ2YWwuYmF0dGxlU2NvcmUgPiAwKSB7XHJcbiAgICAgICAgdGV4dCA9IGBcclxuICAgICAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3M9XCJjdXN0b21UYWJsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0aGVhZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoPkJhdHRsZSBzY29yZTwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGg+TWluIHN0YXQgcmFuZ2U8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoPk1heCBzdGF0IHJhbmdlPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5EYXRlIHNwaWVkPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90aGRlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+JHtzaG9ydGVuTnVtYmVyKHNweUluZm8uc3B5LnN0YXRJbnRlcnZhbC5iYXR0bGVTY29yZSl9PC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD4ke3Nob3J0ZW5OdW1iZXIoc3B5SW5mby5zcHkuc3RhdEludGVydmFsLm1pbil9PC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD4ke3Nob3J0ZW5OdW1iZXIoc3B5SW5mby5zcHkuc3RhdEludGVydmFsLm1heCl9PC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD4ke1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKHNweUluZm8uc3B5LnN0YXRJbnRlcnZhbC5sYXN0VXBkYXRlZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRvTG9jYWxlU3RyaW5nKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNwbGl0KCcsJylbMF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH08L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICBgO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0ZXh0ID0gYFxyXG4gICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwiY3VzdG9tVGFibGVcIj5cclxuICAgICAgICAgICAgICAgICAgICA8dGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5TdGF0IGVzdGltYXRlPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5EYXRlPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90aGRlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+JHtzaG9ydGVuTnVtYmVyKHNweUluZm8uc3B5LmVzdGltYXRlLnN0YXRzKX08L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkPiR7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUoc3B5SW5mby5zcHkuZXN0aW1hdGUubGFzdFVwZGF0ZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50b0xvY2FsZVN0cmluZygpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zcGxpdCgnLCcpWzBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9PC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICBgO1xyXG4gICAgfVxyXG5cclxuICAgIHByb2ZpbGUuaW5uZXJIVE1MICs9IHRleHQ7XHJcbn0pKCk7XHJcblxyXG5HTV9hZGRTdHlsZShgXHJcbnRhYmxlLmN1c3RvbVRhYmxlIHtcclxuICAgIHBvc2l0aW9uOnN0YXRpYztcclxuICAgIHRvcDogLThweDtcclxuICAgIHdpZHRoOiAzODZweDtcclxuICAgIGJhY2tncm91bmQtY29sb3I6ICNGRkZGRkY7XHJcbiAgICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlO1xyXG4gICAgYm9yZGVyLXdpZHRoOiAycHg7XHJcbiAgICBib3JkZXItY29sb3I6ICM3ZWE4Zjg7XHJcbiAgICBib3JkZXItc3R5bGU6IHNvbGlkO1xyXG4gICAgb3ZlcmZsb3c6IHNjcm9sbDtcclxuICAgIHotaW5kZXg6IDk5OTtcclxufVxyXG50YWJsZS5jdXN0b21UYWJsZSB0ZCwgdGFibGUuY3VzdG9tVGFibGUgdGgge1xyXG4gICAgYm9yZGVyLXdpZHRoOiAycHg7XHJcbiAgICBib3JkZXItY29sb3I6ICMyODIyNDI7XHJcbiAgICBib3JkZXItc3R5bGU6IHNvbGlkO1xyXG4gICAgcGFkZGluZzogNXB4O1xyXG4gICAgY29sb3I6ICNGRkZGRkY7XHJcbn1cclxudGFibGUuY3VzdG9tVGFibGUgdGJvZHkge1xyXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzMzMzMzMztcclxufVxyXG50YWJsZS5jdXN0b21UYWJsZSB0aGVhZCB7XHJcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjY2YyNjk2O1xyXG59XHJcbi5oZWQge1xyXG4gICAgcGFkZGluZzogMjBweDtcclxuICAgIGRpc3BsYXk6IGZsZXg7XHJcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcclxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAgICBjb2xvcjogI0ZGRkZGRjtcclxufVxyXG4uaGVkOmxpbmsge1xyXG4gICAgY29sb3I6ICMzNzc3RkY7XHJcbn1cclxuLnRhYmxlY29sb3Ige1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgdG9wIDotNTNweDtcclxuICAgIGxlZnQ6MTAwJTtcclxufVxyXG4uY2xyLWJ0biB7XHJcbiAgICBjb2xvcjogI2RkZDtcclxuICAgIGhlaWdodDogNzUlO1xyXG4gICAgd2lkdGg6MTclO1xyXG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcclxuICAgIGJvcmRlci1yYWRpdXM6IDRweDtcclxuICAgIGxpbmUtaGVpZ2h0OiAxNHB4O1xyXG4gICAgcGFkZGluZzogNHB4IDhweDtcclxuICAgIHRleHQtc2hhZG93OiAwIDFweCAwICNmZmZmZmY2NjtcclxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcclxuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XHJcbiAgICBiYWNrZ3JvdW5kOiAjMzMzO1xyXG4gICAgbWluLXdpZHRoOiAzMHB4O1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgdG9wIDotNTNweDtcclxuICAgIGxlZnQ6MTAwJTtcclxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHRyYW5zcGFyZW50O1xyXG4gICAgYm9yZGVyLWNvbG9yOiAjZmZmO1xyXG4gICAgZGlzcGxheTpibG9jayBcclxufVxyXG4uY2xyLWJ0bjpob3ZlciB7XHJcbiAgICBiYWNrZ3JvdW5kOiAjMTExO1xyXG4gICAgY29sb3I6ICNmZmY7XHJcbn1cclxuYCk7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==