// ==UserScript==
// @name            TSC Spies
// @namespace       Torn Stats Central
// @version         1.1.3
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
    const url = debug
        ? `http://localhost:25565/stats/update`
        : `https://tsc.diicot.cc/stats/update`;
    const body = JSON.stringify({
        apiKey: key,
        userId: id,
    });
    try {
        await GM.xmlHttpRequest({
            method: 'POST',
            url: url,
            headers: {
                Authorization: '10000000-6000-0000-0009-000000000001',
                'x-requested-with': 'XMLHttpRequest',
                'Content-Type': 'application/json',
            },
            data: body,
            onload: function (response) {
                res = response.responseText;
            },
            onerror: function () {
                res = {
                    success: false,
                    serviceDown: true,
                };
            },
        });
        // This is horrible, but it works.
        res ?? (res = `{
            "success": false,
            "code": 999
        }`);
        return res;
    }
    catch (err) {
        // This is also horrible
        return `{
            "success": false,
            "code": 999
        }`;
    }
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
        key = prompt(`Please fill in your API key with the one used in Torn Stats Central.`);
        await GM.setValue('tsc_api_key', key);
        return;
    }
    const keyRegex = new RegExp(/^[a-zA-Z0-9]{16}$/);
    if (keyRegex.test(key) === false) {
        key = prompt(`The API key you have entered is invalid, please try again.`);
        await GM.setValue('tsc_api_key', key);
    }
    const userIdRegex = new RegExp(/XID=(\d+)/);
    const userId = window.location.href.match(userIdRegex)[1];
    const spyInfo = JSON.parse(await getSpy(key, userId, debug));
    await waitForElement('#profileroot > div > div > div > div:nth-child(1) > div.profile-right-wrapper.right > div.profile-buttons.profile-action > div > div.cont.bottom-round > div > div > div.empty-block', 10000);
    const arr = Array.from(document.getElementsByClassName(`profile-right-wrapper right`))[0].getElementsByClassName(`empty-block`)[0];
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
            // TODO: Handle whether the key is invalid or not
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
                    <h3 class = "hed">Torn Stats Central is down.</h3>
                </div>
                `;
                break;
            case ErrorCode.UserDisabled:
                text = `
                <div>
                    <h3 class = "hed">Your TSC account has been disabled. Contact Mavri</h3>
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
        arr.innerHTML += text;
        if (requestNewKey) {
            key = prompt(`The API key you have entered does not match the one used in Torn Stats Central, please try again. If you believe this is an error, please contact Mavri.`);
            await GM.setValue('tsc_api_key', key);
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
    arr.innerHTML += text;
})();
// Ignore this garbage. Or don't. I don't care.
// if (spyInfo.success === false && spyInfo?.maintenance !== true && spyInfo?.serviceDown !== true) {
//     key = prompt(
//         `Something went wrong. Are you using the correct API key? Please try again. If the problem persists, please contact the developer with the apropriate logs found in the console (F12).`
//     );
//     await GM.setValue('tsc_api_key', key);
//     console.warn(`TORN STATS CENTRAL DEBUG INFORMATION BELOW`);
//     console.warn(`The API has returned the following message:`);
//     console.table(spyInfo);
//     console.warn(`TORN STATS CENTRAL DEBUG INFORMATION ABOVE`);
// }
// if (spyInfo == null) {
//     arr.innerHTML += `
//         <div>
//             <h3 class = "hed">User not spied</h3>
//         </div>
//         `;
// } else if (spyInfo?.code === ErrorCode.Maintenance) {
//     arr.innerHTML += `
//     <div>
//         <h3 class = "hed">TSC is undergoing maintenance.</h3>
//     </div>
//     `;
// } else if (spyInfo.serviceDown === true) {
//     arr.innerHTML += `
//     <div>
//         <h3 class = "hed">TSC is down.</h3>
//     </div>
//     `;
// } else if (spyInfo.spy.statInterval.battleScore > 0) {
//     arr.innerHTML += `
//             <table class="customTable">
//             <thead>
//                 <tr>
//                     <th>Battle score</th>
//                     <th>Min stat range</th>
//                     <th>Max stat range</th>
//                     <th>Date spied</th>
//                 </tr>
//                 </thdead>
//             <tbody>
//                 <tr>
//                     <td>${shortenNumber(spyInfo.spy.statInterval.battleScore)}</td>
//                     <td>${shortenNumber(spyInfo.spy.statInterval.min)}</td>
//                     <td>${shortenNumber(spyInfo.spy.statInterval.max)}</td>
//                     <td>${
//                         new Date(spyInfo.spy.statInterval.lastUpdated)
//                             .toLocaleString()
//                             .split(',')[0]
//                     }</td>
//                 </tr>
//             </tbody>
//         </table>
//         </div>
//         `;
// } else {
//     arr.innerHTML += `
//         <table class="customTable">
//             <thead>
//                 <tr>
//                     <th>Stat estimate</th>
//                     <th>Date</th>
//                 </tr>
//                 </thdead>
//             <tbody>
//                 <tr>
//                     <td>${shortenNumber(spyInfo.spy.estimate.stats)}</td>
//                     <td>${
//                         new Date(spyInfo.spy.estimate.lastUpdated)
//                             .toLocaleString()
//                             .split(',')[0]
//                     }</td>
//                 </tr>
//             </tbody>
//         </table>
//         </div>
//     `;
// }

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGliLnRzYy51c2VyLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxXQUFXLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBZ0NYLENBQUMsQ0FBQztBQUVILElBQUssU0FRSjtBQVJELFdBQUssU0FBUztJQUNWLDZEQUFrQjtJQUNsQix1REFBZTtJQUNmLDJEQUFpQjtJQUNqQiwyREFBaUI7SUFDakIseURBQWdCO0lBQ2hCLHFEQUFjO0lBQ2QseURBQWlCO0FBQ3JCLENBQUMsRUFSSSxTQUFTLEtBQVQsU0FBUyxRQVFiO0FBdUJELFNBQVMsYUFBYSxDQUFDLE1BQWM7SUFDakMsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ2hCLElBQUksTUFBTSxHQUFHLENBQUM7UUFBRSxNQUFNLEdBQUcsR0FBRyxDQUFDO0lBRTdCLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzlELElBQUksR0FBRyxHQUFHLElBQUksRUFBRTtRQUNaLE9BQU8sR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQ3pCO0lBQ0QsSUFBSSxFQUFFLEdBQUc7UUFDTCxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRTtRQUNsQixFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRTtRQUNsQixFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRTtRQUNsQixFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRTtRQUNuQixFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRTtRQUNuQixFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRTtLQUN0QixDQUFDO0lBQ0YsSUFBSSxLQUFLLENBQUM7SUFDVixLQUFLLEtBQUssR0FBRyxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQzVDLElBQUksR0FBRyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDcEIsTUFBTTtTQUNUO0tBQ0o7SUFDRCxPQUFPLENBQ0gsTUFBTTtRQUNOLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLDBCQUEwQixFQUFFLElBQUksQ0FBQztRQUN4RSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUNkLENBQUM7QUFDTixDQUFDO0FBRUQsS0FBSyxVQUFVLE1BQU0sQ0FBQyxHQUFXLEVBQUUsRUFBVSxFQUFFLEtBQWM7SUFDekQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDO0lBQ2YsTUFBTSxHQUFHLEdBQUcsS0FBSztRQUNiLENBQUMsQ0FBQyxxQ0FBcUM7UUFDdkMsQ0FBQyxDQUFDLG9DQUFvQyxDQUFDO0lBRTNDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDeEIsTUFBTSxFQUFFLEdBQUc7UUFDWCxNQUFNLEVBQUUsRUFBRTtLQUNiLENBQUMsQ0FBQztJQUVILElBQUk7UUFDQSxNQUFNLEVBQUUsQ0FBQyxjQUFjLENBQUM7WUFDcEIsTUFBTSxFQUFFLE1BQU07WUFDZCxHQUFHLEVBQUUsR0FBRztZQUNSLE9BQU8sRUFBRTtnQkFDTCxhQUFhLEVBQUUsc0NBQXNDO2dCQUNyRCxrQkFBa0IsRUFBRSxnQkFBZ0I7Z0JBQ3BDLGNBQWMsRUFBRSxrQkFBa0I7YUFDckM7WUFDRCxJQUFJLEVBQUUsSUFBSTtZQUNWLE1BQU0sRUFBRSxVQUFVLFFBQW9DO2dCQUNsRCxHQUFHLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQztZQUNoQyxDQUFDO1lBQ0QsT0FBTyxFQUFFO2dCQUNMLEdBQUcsR0FBRztvQkFDRixPQUFPLEVBQUUsS0FBSztvQkFDZCxXQUFXLEVBQUUsSUFBSTtpQkFDcEIsQ0FBQztZQUNOLENBQUM7U0FDSixDQUFDLENBQUM7UUFFSCxrQ0FBa0M7UUFDbEMsR0FBRyxLQUFILEdBQUcsR0FBSzs7O1VBR04sRUFBQztRQUVILE9BQU8sR0FBRyxDQUFDO0tBQ2Q7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLHdCQUF3QjtRQUN4QixPQUFPOzs7VUFHTCxDQUFDO0tBQ047QUFDTCxDQUFDO0FBRUQsS0FBSyxVQUFVLGNBQWMsQ0FBQyxhQUFxQixFQUFFLE9BQWdCO0lBQ2pFLE9BQU8sTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUN6QyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxPQUFPLEVBQUU7WUFDVCxLQUFLLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDcEIsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUN0QixNQUFNLEVBQUUsQ0FBQztZQUNiLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUNmO1FBQ0QsSUFBSSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFO1lBQ2pELE9BQU8sT0FBTyxFQUFFLENBQUM7U0FDcEI7UUFDRCxNQUFNLFFBQVEsR0FBRyxJQUFJLGdCQUFnQixDQUFDLEdBQUcsRUFBRTtZQUN2QyxJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEVBQUU7Z0JBQ2pELFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDdEIsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO29CQUNoQixZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ3ZCO2dCQUNELE9BQU8sT0FBTyxFQUFFLENBQUM7YUFDcEI7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILFFBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTtZQUM1QixTQUFTLEVBQUUsSUFBSTtZQUNmLE9BQU8sRUFBRSxJQUFJO1NBQ2hCLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUVELENBQUMsS0FBSztJQUNGLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNwQixJQUFJLEdBQUcsR0FBVyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZELElBQUksR0FBRyxLQUFLLEVBQUUsRUFBRTtRQUNaLEdBQUcsR0FBRyxNQUFNLENBQUMsc0VBQXNFLENBQUMsQ0FBQztRQUNyRixNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3RDLE9BQU87S0FDVjtJQUVELE1BQU0sUUFBUSxHQUFHLElBQUksTUFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDakQsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEtBQUssRUFBRTtRQUM5QixHQUFHLEdBQUcsTUFBTSxDQUFDLDREQUE0RCxDQUFDLENBQUM7UUFDM0UsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsQ0FBQztLQUN6QztJQUVELE1BQU0sV0FBVyxHQUFHLElBQUksTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzVDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRCxNQUFNLE9BQU8sR0FBUSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUVsRSxNQUFNLGNBQWMsQ0FDaEIsc0xBQXNMLEVBQ3RMLEtBQU0sQ0FDVCxDQUFDO0lBRUYsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FDbEIsUUFBUSxDQUFDLHNCQUFzQixDQUFDLDZCQUE2QixDQUFDLENBQ2pFLENBQUMsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFOUMsSUFBSSxJQUFZLENBQUM7SUFDakIsSUFBSSxPQUFPLENBQUMsT0FBTyxLQUFLLEtBQUssRUFBRTtRQUMzQixJQUFJLGFBQWEsR0FBRyxLQUFLLENBQUM7UUFDMUIsUUFBUSxPQUFPLENBQUMsSUFBSSxFQUFFO1lBQ2xCLEtBQUssU0FBUyxDQUFDLFdBQVc7Z0JBQ3RCLElBQUksR0FBRzs7OztpQkFJTixDQUFDO2dCQUNGLE1BQU07WUFFVixLQUFLLFNBQVMsQ0FBQyxhQUFhO2dCQUN4QixJQUFJLEdBQUc7Ozs7aUJBSU4sQ0FBQztnQkFDRixhQUFhLEdBQUcsSUFBSSxDQUFDO2dCQUNyQixNQUFNO1lBRVYsaURBQWlEO1lBQ2pELEtBQUssU0FBUyxDQUFDLGFBQWE7Z0JBQ3hCLElBQUksR0FBRzs7OztpQkFJTixDQUFDO2dCQUNGLE1BQU07WUFFVixLQUFLLFNBQVMsQ0FBQyxjQUFjO2dCQUN6QixJQUFJLEdBQUc7Ozs7aUJBSU4sQ0FBQztnQkFDRixNQUFNO1lBRVYsS0FBSyxTQUFTLENBQUMsV0FBVztnQkFDdEIsSUFBSSxHQUFHOzs7O2lCQUlOLENBQUM7Z0JBQ0YsTUFBTTtZQUVWLEtBQUssU0FBUyxDQUFDLFlBQVk7Z0JBQ3ZCLElBQUksR0FBRzs7OztpQkFJTixDQUFDO2dCQUNGLE1BQU07WUFDVixLQUFLLFNBQVMsQ0FBQyxVQUFVO2dCQUNyQixJQUFJLEdBQUc7Ozs7aUJBSU4sQ0FBQztnQkFDRixNQUFNO1lBQ1Y7Z0JBQ0ksSUFBSSxHQUFHOzs7O3FCQUlGLENBQUM7Z0JBQ04sTUFBTTtTQUNiO1FBRUQsT0FBTyxDQUFDLElBQUksQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO1FBQzNELE9BQU8sQ0FBQyxJQUFJLENBQUMsNkNBQTZDLENBQUMsQ0FBQztRQUM1RCxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JCLE9BQU8sQ0FBQyxJQUFJLENBQUMsNENBQTRDLENBQUMsQ0FBQztRQUMzRCxHQUFHLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQztRQUV0QixJQUFJLGFBQWEsRUFBRTtZQUNmLEdBQUcsR0FBRyxNQUFNLENBQ1IsMEpBQTBKLENBQzdKLENBQUM7WUFDRixNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3pDO1FBRUQsT0FBTztLQUNWO0lBRUQsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxFQUFFO1FBQzFDLElBQUksR0FBRzs7Ozs7Ozs7Ozs7O2tDQVltQixhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDO2tDQUNuRCxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDO2tDQUMzQyxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDO2tDQUU3QyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUM7YUFDekMsY0FBYyxFQUFFO2FBQ2hCLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQ3JCOzs7OztpQkFLWCxDQUFDO0tBQ2I7U0FBTTtRQUNILElBQUksR0FBRzs7Ozs7Ozs7OztrQ0FVbUIsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztrQ0FFM0MsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDO2FBQ3JDLGNBQWMsRUFBRTthQUNoQixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUNyQjs7Ozs7YUFLZixDQUFDO0tBQ1Q7SUFFRCxHQUFHLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQztBQUMxQixDQUFDLENBQUMsRUFBRSxDQUFDO0FBRUwsK0NBQStDO0FBQy9DLHFHQUFxRztBQUNyRyxvQkFBb0I7QUFDcEIsa01BQWtNO0FBQ2xNLFNBQVM7QUFDVCw2Q0FBNkM7QUFDN0Msa0VBQWtFO0FBQ2xFLG1FQUFtRTtBQUNuRSw4QkFBOEI7QUFDOUIsa0VBQWtFO0FBQ2xFLElBQUk7QUFFSix5QkFBeUI7QUFDekIseUJBQXlCO0FBQ3pCLGdCQUFnQjtBQUNoQixvREFBb0Q7QUFDcEQsaUJBQWlCO0FBQ2pCLGFBQWE7QUFDYix3REFBd0Q7QUFDeEQseUJBQXlCO0FBQ3pCLFlBQVk7QUFDWixnRUFBZ0U7QUFDaEUsYUFBYTtBQUNiLFNBQVM7QUFDVCw2Q0FBNkM7QUFDN0MseUJBQXlCO0FBQ3pCLFlBQVk7QUFDWiw4Q0FBOEM7QUFDOUMsYUFBYTtBQUNiLFNBQVM7QUFDVCx5REFBeUQ7QUFDekQseUJBQXlCO0FBQ3pCLDBDQUEwQztBQUMxQyxzQkFBc0I7QUFDdEIsdUJBQXVCO0FBQ3ZCLDRDQUE0QztBQUM1Qyw4Q0FBOEM7QUFDOUMsOENBQThDO0FBQzlDLDBDQUEwQztBQUMxQyx3QkFBd0I7QUFDeEIsNEJBQTRCO0FBQzVCLHNCQUFzQjtBQUN0Qix1QkFBdUI7QUFDdkIsc0ZBQXNGO0FBQ3RGLDhFQUE4RTtBQUM5RSw4RUFBOEU7QUFDOUUsNkJBQTZCO0FBQzdCLHlFQUF5RTtBQUN6RSxnREFBZ0Q7QUFDaEQsNkNBQTZDO0FBQzdDLDZCQUE2QjtBQUM3Qix3QkFBd0I7QUFDeEIsdUJBQXVCO0FBQ3ZCLG1CQUFtQjtBQUNuQixpQkFBaUI7QUFDakIsYUFBYTtBQUNiLFdBQVc7QUFDWCx5QkFBeUI7QUFDekIsc0NBQXNDO0FBQ3RDLHNCQUFzQjtBQUN0Qix1QkFBdUI7QUFDdkIsNkNBQTZDO0FBQzdDLG9DQUFvQztBQUNwQyx3QkFBd0I7QUFDeEIsNEJBQTRCO0FBQzVCLHNCQUFzQjtBQUN0Qix1QkFBdUI7QUFDdkIsNEVBQTRFO0FBQzVFLDZCQUE2QjtBQUM3QixxRUFBcUU7QUFDckUsZ0RBQWdEO0FBQ2hELDZDQUE2QztBQUM3Qyw2QkFBNkI7QUFDN0Isd0JBQXdCO0FBQ3hCLHVCQUF1QjtBQUN2QixtQkFBbUI7QUFDbkIsaUJBQWlCO0FBQ2pCLFNBQVM7QUFDVCxJQUFJIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc3RhdC1lc3RpbWF0ZS1hcGkvLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiR01fYWRkU3R5bGUoYFxudGFibGUuY3VzdG9tVGFibGUge1xuICBwb3NpdGlvbjpyZWxhdGl2ZTtcbiAgdG9wOiAtMTBweDtcbiAgd2lkdGg6IDM4NnB4O1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjRkZGRkZGO1xuICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlO1xuICBib3JkZXItd2lkdGg6IDJweDtcbiAgYm9yZGVyLWNvbG9yOiAjN2VhOGY4O1xuICBib3JkZXItc3R5bGU6IHNvbGlkO1xuICBvdmVyZmxvdzogc2Nyb2xsO1xufVxudGFibGUuY3VzdG9tVGFibGUgdGQsIHRhYmxlLmN1c3RvbVRhYmxlIHRoIHtcbiAgYm9yZGVyLXdpZHRoOiAycHg7XG4gIGJvcmRlci1jb2xvcjogIzI4MjI0MjtcbiAgYm9yZGVyLXN0eWxlOiBzb2xpZDtcbiAgcGFkZGluZzogNXB4O1xuICBjb2xvcjogI0ZGRkZGRjtcbn1cbnRhYmxlLmN1c3RvbVRhYmxlIHRib2R5IHtcbiAgYmFja2dyb3VuZC1jb2xvcjogIzMzMzMzMztcbn1cbnRhYmxlLmN1c3RvbVRhYmxlIHRoZWFkIHtcbiAgYmFja2dyb3VuZC1jb2xvcjogI2NmMjY5Njtcbn1cbi5oZWQge1xuICBwYWRkaW5nOiAyMHB4O1xuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgY29sb3I6ICNGRkZGRkY7XG59XG5gKTtcblxuZW51bSBFcnJvckNvZGUge1xuICAgIEludmFsaWRSZXF1ZXN0ID0gMSxcbiAgICBNYWludGVuYW5jZSA9IDIsXG4gICAgSW52YWxpZEFwaUtleSA9IDMsXG4gICAgSW50ZXJuYWxFcnJvciA9IDQsXG4gICAgVXNlckRpc2FibGVkID0gNSxcbiAgICBDYWNoZWRPbmx5ID0gNixcbiAgICBTZXJ2aWNlRG93biA9IDk5OSxcbn1cblxuaW50ZXJmYWNlIFNweSB7XG4gICAgc3VjY2VzczogYm9vbGVhbjtcbiAgICBtZXNzYWdlOiBzdHJpbmc7XG4gICAgY29kZT86IEVycm9yQ29kZTtcbiAgICBzZXJ2aWNlRG93bj86IGJvb2xlYW47XG4gICAgc3B5OiB7XG4gICAgICAgIHVzZXJJZDogbnVtYmVyO1xuICAgICAgICB1c2VyTmFtZTogc3RyaW5nO1xuICAgICAgICBlc3RpbWF0ZToge1xuICAgICAgICAgICAgc3RhdHM6IG51bWJlcjtcbiAgICAgICAgICAgIGxhc3RVcGRhdGVkOiBEYXRlO1xuICAgICAgICB9O1xuICAgICAgICBzdGF0SW50ZXJ2YWw6IHtcbiAgICAgICAgICAgIG1pbjogbnVtYmVyO1xuICAgICAgICAgICAgbWF4OiBudW1iZXI7XG4gICAgICAgICAgICBiYXR0bGVTY29yZTogbnVtYmVyO1xuICAgICAgICAgICAgbGFzdFVwZGF0ZWQ6IERhdGU7XG4gICAgICAgIH07XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gc2hvcnRlbk51bWJlcihudW1iZXI6IG51bWJlcik6IHN0cmluZyB7XG4gICAgbGV0IHByZWZpeCA9ICcnO1xuICAgIGlmIChudW1iZXIgPCAwKSBwcmVmaXggPSAnLSc7XG5cbiAgICBsZXQgbnVtID0gcGFyc2VJbnQobnVtYmVyLnRvU3RyaW5nKCkucmVwbGFjZSgvW14wLTkuXS9nLCAnJykpO1xuICAgIGlmIChudW0gPCAxMDAwKSB7XG4gICAgICAgIHJldHVybiBudW0udG9TdHJpbmcoKTtcbiAgICB9XG4gICAgbGV0IHNpID0gW1xuICAgICAgICB7IHY6IDFlMywgczogJ0snIH0sXG4gICAgICAgIHsgdjogMWU2LCBzOiAnTScgfSxcbiAgICAgICAgeyB2OiAxZTksIHM6ICdCJyB9LFxuICAgICAgICB7IHY6IDFlMTIsIHM6ICdUJyB9LFxuICAgICAgICB7IHY6IDFlMTUsIHM6ICdQJyB9LFxuICAgICAgICB7IHY6IDFlMTgsIHM6ICdFJyB9LFxuICAgIF07XG4gICAgbGV0IGluZGV4O1xuICAgIGZvciAoaW5kZXggPSBzaS5sZW5ndGggLSAxOyBpbmRleCA+IDA7IGluZGV4LS0pIHtcbiAgICAgICAgaWYgKG51bSA+PSBzaVtpbmRleF0udikge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgICAgcHJlZml4ICtcbiAgICAgICAgKG51bSAvIHNpW2luZGV4XS52KS50b0ZpeGVkKDIpLnJlcGxhY2UoL1xcLjArJHwoXFwuWzAtOV0qWzEtOV0pMCskLywgJyQxJykgK1xuICAgICAgICBzaVtpbmRleF0uc1xuICAgICk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFNweShrZXk6IHN0cmluZywgaWQ6IHN0cmluZywgZGVidWc6IGJvb2xlYW4pOiBQcm9taXNlPGFueT4ge1xuICAgIGxldCByZXMgPSBudWxsO1xuICAgIGNvbnN0IHVybCA9IGRlYnVnXG4gICAgICAgID8gYGh0dHA6Ly9sb2NhbGhvc3Q6MjU1NjUvc3RhdHMvdXBkYXRlYFxuICAgICAgICA6IGBodHRwczovL3RzYy5kaWljb3QuY2Mvc3RhdHMvdXBkYXRlYDtcblxuICAgIGNvbnN0IGJvZHkgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGFwaUtleToga2V5LFxuICAgICAgICB1c2VySWQ6IGlkLFxuICAgIH0pO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgR00ueG1sSHR0cFJlcXVlc3Qoe1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBBdXRob3JpemF0aW9uOiAnMTAwMDAwMDAtNjAwMC0wMDAwLTAwMDktMDAwMDAwMDAwMDAxJyxcbiAgICAgICAgICAgICAgICAneC1yZXF1ZXN0ZWQtd2l0aCc6ICdYTUxIdHRwUmVxdWVzdCcsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkYXRhOiBib2R5LFxuICAgICAgICAgICAgb25sb2FkOiBmdW5jdGlvbiAocmVzcG9uc2U6IFRhbXBlcm1vbmtleS5SZXNwb25zZTxhbnk+KSB7XG4gICAgICAgICAgICAgICAgcmVzID0gcmVzcG9uc2UucmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uZXJyb3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlRG93bjogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gVGhpcyBpcyBob3JyaWJsZSwgYnV0IGl0IHdvcmtzLlxuICAgICAgICByZXMgPz89IGB7XG4gICAgICAgICAgICBcInN1Y2Nlc3NcIjogZmFsc2UsXG4gICAgICAgICAgICBcImNvZGVcIjogOTk5XG4gICAgICAgIH1gO1xuXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgYWxzbyBob3JyaWJsZVxuICAgICAgICByZXR1cm4gYHtcbiAgICAgICAgICAgIFwic3VjY2Vzc1wiOiBmYWxzZSxcbiAgICAgICAgICAgIFwiY29kZVwiOiA5OTlcbiAgICAgICAgfWA7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiB3YWl0Rm9yRWxlbWVudChxdWVyeVNlbGVjdG9yOiBzdHJpbmcsIHRpbWVvdXQ/OiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBsZXQgdGltZXIgPSBudWxsO1xuICAgICAgICBpZiAodGltZW91dCkge1xuICAgICAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChxdWVyeVNlbGVjdG9yKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChxdWVyeVNlbGVjdG9yKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgaWYgKHRpbWVyICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHtcbiAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG4oYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGRlYnVnID0gZmFsc2U7XG4gICAgbGV0IGtleTogc3RyaW5nID0gYXdhaXQgR00uZ2V0VmFsdWUoJ3RzY19hcGlfa2V5JywgJycpO1xuICAgIGlmIChrZXkgPT09ICcnKSB7XG4gICAgICAgIGtleSA9IHByb21wdChgUGxlYXNlIGZpbGwgaW4geW91ciBBUEkga2V5IHdpdGggdGhlIG9uZSB1c2VkIGluIFRvcm4gU3RhdHMgQ2VudHJhbC5gKTtcbiAgICAgICAgYXdhaXQgR00uc2V0VmFsdWUoJ3RzY19hcGlfa2V5Jywga2V5KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGtleVJlZ2V4ID0gbmV3IFJlZ0V4cCgvXlthLXpBLVowLTldezE2fSQvKTtcbiAgICBpZiAoa2V5UmVnZXgudGVzdChrZXkpID09PSBmYWxzZSkge1xuICAgICAgICBrZXkgPSBwcm9tcHQoYFRoZSBBUEkga2V5IHlvdSBoYXZlIGVudGVyZWQgaXMgaW52YWxpZCwgcGxlYXNlIHRyeSBhZ2Fpbi5gKTtcbiAgICAgICAgYXdhaXQgR00uc2V0VmFsdWUoJ3RzY19hcGlfa2V5Jywga2V5KTtcbiAgICB9XG5cbiAgICBjb25zdCB1c2VySWRSZWdleCA9IG5ldyBSZWdFeHAoL1hJRD0oXFxkKykvKTtcbiAgICBjb25zdCB1c2VySWQgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5tYXRjaCh1c2VySWRSZWdleClbMV07XG4gICAgY29uc3Qgc3B5SW5mbzogU3B5ID0gSlNPTi5wYXJzZShhd2FpdCBnZXRTcHkoa2V5LCB1c2VySWQsIGRlYnVnKSk7XG5cbiAgICBhd2FpdCB3YWl0Rm9yRWxlbWVudChcbiAgICAgICAgJyNwcm9maWxlcm9vdCA+IGRpdiA+IGRpdiA+IGRpdiA+IGRpdjpudGgtY2hpbGQoMSkgPiBkaXYucHJvZmlsZS1yaWdodC13cmFwcGVyLnJpZ2h0ID4gZGl2LnByb2ZpbGUtYnV0dG9ucy5wcm9maWxlLWFjdGlvbiA+IGRpdiA+IGRpdi5jb250LmJvdHRvbS1yb3VuZCA+IGRpdiA+IGRpdiA+IGRpdi5lbXB0eS1ibG9jaycsXG4gICAgICAgIDEwXzAwMFxuICAgICk7XG5cbiAgICBjb25zdCBhcnIgPSBBcnJheS5mcm9tKFxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGBwcm9maWxlLXJpZ2h0LXdyYXBwZXIgcmlnaHRgKVxuICAgIClbMF0uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShgZW1wdHktYmxvY2tgKVswXTtcblxuICAgIGxldCB0ZXh0OiBzdHJpbmc7XG4gICAgaWYgKHNweUluZm8uc3VjY2VzcyA9PT0gZmFsc2UpIHtcbiAgICAgICAgbGV0IHJlcXVlc3ROZXdLZXkgPSBmYWxzZTtcbiAgICAgICAgc3dpdGNoIChzcHlJbmZvLmNvZGUpIHtcbiAgICAgICAgICAgIGNhc2UgRXJyb3JDb2RlLk1haW50ZW5hbmNlOlxuICAgICAgICAgICAgICAgIHRleHQgPSBgXG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGgzIGNsYXNzID0gXCJoZWRcIj5UU0MgaXMgdW5kZXJnb2luZyBtYWludGVuYW5jZS48L2gzPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIGA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgRXJyb3JDb2RlLkludmFsaWRBcGlLZXk6XG4gICAgICAgICAgICAgICAgdGV4dCA9IGBcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8aDMgY2xhc3MgPSBcImhlZFwiPkludmFsaWQgQVBJIGtleS48L2gzPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIGA7XG4gICAgICAgICAgICAgICAgcmVxdWVzdE5ld0tleSA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIC8vIFRPRE86IEhhbmRsZSB3aGV0aGVyIHRoZSBrZXkgaXMgaW52YWxpZCBvciBub3RcbiAgICAgICAgICAgIGNhc2UgRXJyb3JDb2RlLkludGVybmFsRXJyb3I6XG4gICAgICAgICAgICAgICAgdGV4dCA9IGBcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8aDMgY2xhc3MgPSBcImhlZFwiPkludGVybmFsIGVycm9yLjwvaDM+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgYDtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBFcnJvckNvZGUuSW52YWxpZFJlcXVlc3Q6XG4gICAgICAgICAgICAgICAgdGV4dCA9IGBcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8aDMgY2xhc3MgPSBcImhlZFwiPkludmFsaWQgcmVxdWVzdC48L2gzPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIGA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgRXJyb3JDb2RlLlNlcnZpY2VEb3duOlxuICAgICAgICAgICAgICAgIHRleHQgPSBgXG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGgzIGNsYXNzID0gXCJoZWRcIj5Ub3JuIFN0YXRzIENlbnRyYWwgaXMgZG93bi48L2gzPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIGA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgRXJyb3JDb2RlLlVzZXJEaXNhYmxlZDpcbiAgICAgICAgICAgICAgICB0ZXh0ID0gYFxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxoMyBjbGFzcyA9IFwiaGVkXCI+WW91ciBUU0MgYWNjb3VudCBoYXMgYmVlbiBkaXNhYmxlZC4gQ29udGFjdCBNYXZyaTwvaDM+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgYDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgRXJyb3JDb2RlLkNhY2hlZE9ubHk6XG4gICAgICAgICAgICAgICAgdGV4dCA9IGBcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8aDMgY2xhc3MgPSBcImhlZFwiPlVzZXIgbm90IGZvdW5kIGluIGNhY2hlLjwvaDM+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgYDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGV4dCA9IGBcbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxoMyBjbGFzcyA9IFwiaGVkXCI+VW5rbm93biBlcnJvci48L2gzPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgYDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUud2FybihgVE9STiBTVEFUUyBDRU5UUkFMIERFQlVHIElORk9STUFUSU9OIEJFTE9XYCk7XG4gICAgICAgIGNvbnNvbGUud2FybihgVGhlIEFQSSBoYXMgcmV0dXJuZWQgdGhlIGZvbGxvd2luZyBtZXNzYWdlOmApO1xuICAgICAgICBjb25zb2xlLmxvZyhzcHlJbmZvKTtcbiAgICAgICAgY29uc29sZS53YXJuKGBUT1JOIFNUQVRTIENFTlRSQUwgREVCVUcgSU5GT1JNQVRJT04gQUJPVkVgKTtcbiAgICAgICAgYXJyLmlubmVySFRNTCArPSB0ZXh0O1xuXG4gICAgICAgIGlmIChyZXF1ZXN0TmV3S2V5KSB7XG4gICAgICAgICAgICBrZXkgPSBwcm9tcHQoXG4gICAgICAgICAgICAgICAgYFRoZSBBUEkga2V5IHlvdSBoYXZlIGVudGVyZWQgZG9lcyBub3QgbWF0Y2ggdGhlIG9uZSB1c2VkIGluIFRvcm4gU3RhdHMgQ2VudHJhbCwgcGxlYXNlIHRyeSBhZ2Fpbi4gSWYgeW91IGJlbGlldmUgdGhpcyBpcyBhbiBlcnJvciwgcGxlYXNlIGNvbnRhY3QgTWF2cmkuYFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGF3YWl0IEdNLnNldFZhbHVlKCd0c2NfYXBpX2tleScsIGtleSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHNweUluZm8uc3B5LnN0YXRJbnRlcnZhbC5iYXR0bGVTY29yZSA+IDApIHtcbiAgICAgICAgdGV4dCA9IGBcbiAgICAgICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwiY3VzdG9tVGFibGVcIj5cbiAgICAgICAgICAgICAgICAgICAgPHRoZWFkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5CYXR0bGUgc2NvcmU8L3RoPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5NaW4gc3RhdCByYW5nZTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoPk1heCBzdGF0IHJhbmdlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGg+RGF0ZSBzcGllZDwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC90aGRlYWQ+XG4gICAgICAgICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+JHtzaG9ydGVuTnVtYmVyKHNweUluZm8uc3B5LnN0YXRJbnRlcnZhbC5iYXR0bGVTY29yZSl9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+JHtzaG9ydGVuTnVtYmVyKHNweUluZm8uc3B5LnN0YXRJbnRlcnZhbC5taW4pfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkPiR7c2hvcnRlbk51bWJlcihzcHlJbmZvLnNweS5zdGF0SW50ZXJ2YWwubWF4KX08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD4ke1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZShzcHlJbmZvLnNweS5zdGF0SW50ZXJ2YWwubGFzdFVwZGF0ZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudG9Mb2NhbGVTdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNwbGl0KCcsJylbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICBgO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRleHQgPSBgXG4gICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwiY3VzdG9tVGFibGVcIj5cbiAgICAgICAgICAgICAgICAgICAgPHRoZWFkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5TdGF0IGVzdGltYXRlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGg+RGF0ZTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC90aGRlYWQ+XG4gICAgICAgICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+JHtzaG9ydGVuTnVtYmVyKHNweUluZm8uc3B5LmVzdGltYXRlLnN0YXRzKX08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD4ke1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZShzcHlJbmZvLnNweS5lc3RpbWF0ZS5sYXN0VXBkYXRlZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50b0xvY2FsZVN0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3BsaXQoJywnKVswXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgYDtcbiAgICB9XG5cbiAgICBhcnIuaW5uZXJIVE1MICs9IHRleHQ7XG59KSgpO1xuXG4vLyBJZ25vcmUgdGhpcyBnYXJiYWdlLiBPciBkb24ndC4gSSBkb24ndCBjYXJlLlxuLy8gaWYgKHNweUluZm8uc3VjY2VzcyA9PT0gZmFsc2UgJiYgc3B5SW5mbz8ubWFpbnRlbmFuY2UgIT09IHRydWUgJiYgc3B5SW5mbz8uc2VydmljZURvd24gIT09IHRydWUpIHtcbi8vICAgICBrZXkgPSBwcm9tcHQoXG4vLyAgICAgICAgIGBTb21ldGhpbmcgd2VudCB3cm9uZy4gQXJlIHlvdSB1c2luZyB0aGUgY29ycmVjdCBBUEkga2V5PyBQbGVhc2UgdHJ5IGFnYWluLiBJZiB0aGUgcHJvYmxlbSBwZXJzaXN0cywgcGxlYXNlIGNvbnRhY3QgdGhlIGRldmVsb3BlciB3aXRoIHRoZSBhcHJvcHJpYXRlIGxvZ3MgZm91bmQgaW4gdGhlIGNvbnNvbGUgKEYxMikuYFxuLy8gICAgICk7XG4vLyAgICAgYXdhaXQgR00uc2V0VmFsdWUoJ3RzY19hcGlfa2V5Jywga2V5KTtcbi8vICAgICBjb25zb2xlLndhcm4oYFRPUk4gU1RBVFMgQ0VOVFJBTCBERUJVRyBJTkZPUk1BVElPTiBCRUxPV2ApO1xuLy8gICAgIGNvbnNvbGUud2FybihgVGhlIEFQSSBoYXMgcmV0dXJuZWQgdGhlIGZvbGxvd2luZyBtZXNzYWdlOmApO1xuLy8gICAgIGNvbnNvbGUudGFibGUoc3B5SW5mbyk7XG4vLyAgICAgY29uc29sZS53YXJuKGBUT1JOIFNUQVRTIENFTlRSQUwgREVCVUcgSU5GT1JNQVRJT04gQUJPVkVgKTtcbi8vIH1cblxuLy8gaWYgKHNweUluZm8gPT0gbnVsbCkge1xuLy8gICAgIGFyci5pbm5lckhUTUwgKz0gYFxuLy8gICAgICAgICA8ZGl2PlxuLy8gICAgICAgICAgICAgPGgzIGNsYXNzID0gXCJoZWRcIj5Vc2VyIG5vdCBzcGllZDwvaDM+XG4vLyAgICAgICAgIDwvZGl2PlxuLy8gICAgICAgICBgO1xuLy8gfSBlbHNlIGlmIChzcHlJbmZvPy5jb2RlID09PSBFcnJvckNvZGUuTWFpbnRlbmFuY2UpIHtcbi8vICAgICBhcnIuaW5uZXJIVE1MICs9IGBcbi8vICAgICA8ZGl2PlxuLy8gICAgICAgICA8aDMgY2xhc3MgPSBcImhlZFwiPlRTQyBpcyB1bmRlcmdvaW5nIG1haW50ZW5hbmNlLjwvaDM+XG4vLyAgICAgPC9kaXY+XG4vLyAgICAgYDtcbi8vIH0gZWxzZSBpZiAoc3B5SW5mby5zZXJ2aWNlRG93biA9PT0gdHJ1ZSkge1xuLy8gICAgIGFyci5pbm5lckhUTUwgKz0gYFxuLy8gICAgIDxkaXY+XG4vLyAgICAgICAgIDxoMyBjbGFzcyA9IFwiaGVkXCI+VFNDIGlzIGRvd24uPC9oMz5cbi8vICAgICA8L2Rpdj5cbi8vICAgICBgO1xuLy8gfSBlbHNlIGlmIChzcHlJbmZvLnNweS5zdGF0SW50ZXJ2YWwuYmF0dGxlU2NvcmUgPiAwKSB7XG4vLyAgICAgYXJyLmlubmVySFRNTCArPSBgXG4vLyAgICAgICAgICAgICA8dGFibGUgY2xhc3M9XCJjdXN0b21UYWJsZVwiPlxuLy8gICAgICAgICAgICAgPHRoZWFkPlxuLy8gICAgICAgICAgICAgICAgIDx0cj5cbi8vICAgICAgICAgICAgICAgICAgICAgPHRoPkJhdHRsZSBzY29yZTwvdGg+XG4vLyAgICAgICAgICAgICAgICAgICAgIDx0aD5NaW4gc3RhdCByYW5nZTwvdGg+XG4vLyAgICAgICAgICAgICAgICAgICAgIDx0aD5NYXggc3RhdCByYW5nZTwvdGg+XG4vLyAgICAgICAgICAgICAgICAgICAgIDx0aD5EYXRlIHNwaWVkPC90aD5cbi8vICAgICAgICAgICAgICAgICA8L3RyPlxuLy8gICAgICAgICAgICAgICAgIDwvdGhkZWFkPlxuLy8gICAgICAgICAgICAgPHRib2R5PlxuLy8gICAgICAgICAgICAgICAgIDx0cj5cbi8vICAgICAgICAgICAgICAgICAgICAgPHRkPiR7c2hvcnRlbk51bWJlcihzcHlJbmZvLnNweS5zdGF0SW50ZXJ2YWwuYmF0dGxlU2NvcmUpfTwvdGQ+XG4vLyAgICAgICAgICAgICAgICAgICAgIDx0ZD4ke3Nob3J0ZW5OdW1iZXIoc3B5SW5mby5zcHkuc3RhdEludGVydmFsLm1pbil9PC90ZD5cbi8vICAgICAgICAgICAgICAgICAgICAgPHRkPiR7c2hvcnRlbk51bWJlcihzcHlJbmZvLnNweS5zdGF0SW50ZXJ2YWwubWF4KX08L3RkPlxuLy8gICAgICAgICAgICAgICAgICAgICA8dGQ+JHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKHNweUluZm8uc3B5LnN0YXRJbnRlcnZhbC5sYXN0VXBkYXRlZClcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudG9Mb2NhbGVTdHJpbmcoKVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zcGxpdCgnLCcpWzBdXG4vLyAgICAgICAgICAgICAgICAgICAgIH08L3RkPlxuLy8gICAgICAgICAgICAgICAgIDwvdHI+XG4vLyAgICAgICAgICAgICA8L3Rib2R5PlxuLy8gICAgICAgICA8L3RhYmxlPlxuLy8gICAgICAgICA8L2Rpdj5cbi8vICAgICAgICAgYDtcbi8vIH0gZWxzZSB7XG4vLyAgICAgYXJyLmlubmVySFRNTCArPSBgXG4vLyAgICAgICAgIDx0YWJsZSBjbGFzcz1cImN1c3RvbVRhYmxlXCI+XG4vLyAgICAgICAgICAgICA8dGhlYWQ+XG4vLyAgICAgICAgICAgICAgICAgPHRyPlxuLy8gICAgICAgICAgICAgICAgICAgICA8dGg+U3RhdCBlc3RpbWF0ZTwvdGg+XG4vLyAgICAgICAgICAgICAgICAgICAgIDx0aD5EYXRlPC90aD5cbi8vICAgICAgICAgICAgICAgICA8L3RyPlxuLy8gICAgICAgICAgICAgICAgIDwvdGhkZWFkPlxuLy8gICAgICAgICAgICAgPHRib2R5PlxuLy8gICAgICAgICAgICAgICAgIDx0cj5cbi8vICAgICAgICAgICAgICAgICAgICAgPHRkPiR7c2hvcnRlbk51bWJlcihzcHlJbmZvLnNweS5lc3RpbWF0ZS5zdGF0cyl9PC90ZD5cbi8vICAgICAgICAgICAgICAgICAgICAgPHRkPiR7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZShzcHlJbmZvLnNweS5lc3RpbWF0ZS5sYXN0VXBkYXRlZClcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudG9Mb2NhbGVTdHJpbmcoKVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zcGxpdCgnLCcpWzBdXG4vLyAgICAgICAgICAgICAgICAgICAgIH08L3RkPlxuLy8gICAgICAgICAgICAgICAgIDwvdHI+XG4vLyAgICAgICAgICAgICA8L3Rib2R5PlxuLy8gICAgICAgICA8L3RhYmxlPlxuLy8gICAgICAgICA8L2Rpdj5cbi8vICAgICBgO1xuLy8gfVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9