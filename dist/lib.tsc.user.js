// ==UserScript==
// @name            TSC Spies
// @namespace       Torn Stats Central
// @version         1.0.5
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
    });
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
    if (spyInfo.success === false && spyInfo?.maintenance !== true) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGliLnRzYy51c2VyLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxXQUFXLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBZ0NYLENBQUMsQ0FBQztBQXNCSCxTQUFTLGFBQWEsQ0FBQyxNQUFjO0lBQ2pDLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNoQixJQUFJLE1BQU0sR0FBRyxDQUFDO1FBQUUsTUFBTSxHQUFHLEdBQUcsQ0FBQztJQUU3QixJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM5RCxJQUFJLEdBQUcsR0FBRyxJQUFJLEVBQUU7UUFDWixPQUFPLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUN6QjtJQUNELElBQUksRUFBRSxHQUFHO1FBQ0wsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUU7UUFDbEIsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUU7UUFDbEIsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUU7UUFDbEIsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUU7UUFDbkIsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUU7UUFDbkIsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUU7S0FDdEIsQ0FBQztJQUNGLElBQUksS0FBSyxDQUFDO0lBQ1YsS0FBSyxLQUFLLEdBQUcsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRTtRQUM1QyxJQUFJLEdBQUcsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3BCLE1BQU07U0FDVDtLQUNKO0lBQ0QsT0FBTyxDQUNILE1BQU07UUFDTixDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsRUFBRSxJQUFJLENBQUM7UUFDeEUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FDZCxDQUFDO0FBQ04sQ0FBQztBQUVELEtBQUssVUFBVSxNQUFNLENBQUMsR0FBVyxFQUFFLEVBQVUsRUFBRSxLQUFjO0lBQ3pELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQztJQUNmLE1BQU0sR0FBRyxHQUFHLEtBQUs7UUFDYixDQUFDLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUN6QyxvQ0FBb0M7SUFFeEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUN2QixNQUFNLEVBQUUsR0FBRztRQUNYLE1BQU0sRUFBRSxFQUFFO0tBQ2IsQ0FBQyxDQUFDO0lBRUgsTUFBTSxFQUFFLENBQUMsY0FBYyxDQUFDO1FBQ3BCLE1BQU0sRUFBRSxNQUFNO1FBQ2QsR0FBRyxFQUFFLEdBQUc7UUFDUixPQUFPLEVBQUU7WUFDTCxhQUFhLEVBQUUsc0NBQXNDO1lBQ3JELGtCQUFrQixFQUFFLGdCQUFnQjtZQUNwQyxjQUFjLEVBQUUsa0JBQWtCO1NBQ3JDO1FBQ0QsSUFBSSxFQUFFLEdBQUc7UUFDVCxNQUFNLEVBQUUsVUFBVSxRQUFvQztZQUNsRCxHQUFHLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQztRQUNoQyxDQUFDO0tBQ0osQ0FBQyxDQUFDO0lBQ0gsT0FBTyxHQUFHLENBQUM7QUFDZixDQUFDO0FBRUQsS0FBSyxVQUFVLGNBQWMsQ0FBQyxhQUFxQixFQUFFLE9BQWdCO0lBQ2pFLE9BQU8sTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUN6QyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxPQUFPLEVBQUU7WUFDVCxLQUFLLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDcEIsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUN0QixNQUFNLEVBQUUsQ0FBQztZQUNiLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUNmO1FBQ0QsSUFBSSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFO1lBQ2pELE9BQU8sT0FBTyxFQUFFLENBQUM7U0FDcEI7UUFDRCxNQUFNLFFBQVEsR0FBRyxJQUFJLGdCQUFnQixDQUFDLEdBQUcsRUFBRTtZQUN2QyxJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEVBQUU7Z0JBQ2pELFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDdEIsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO29CQUNoQixZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ3ZCO2dCQUNELE9BQU8sT0FBTyxFQUFFLENBQUM7YUFDcEI7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILFFBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRTtZQUM1QixTQUFTLEVBQUUsSUFBSTtZQUNmLE9BQU8sRUFBRSxJQUFJO1NBQ2hCLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUVELENBQUMsS0FBSztJQUNGLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNwQixJQUFJLEdBQUcsR0FBVyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZELElBQUksR0FBRyxLQUFLLEVBQUUsRUFBRTtRQUNaLEdBQUcsR0FBRyxNQUFNLENBQUMscUVBQXFFLENBQUMsQ0FBQztRQUNwRixNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3RDLE9BQU87S0FDVjtJQUVELE1BQU0sUUFBUSxHQUFHLElBQUksTUFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDakQsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEtBQUssRUFBRTtRQUM5QixHQUFHLEdBQUcsTUFBTSxDQUFDLDJEQUEyRCxDQUFDLENBQUM7UUFDMUUsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsQ0FBQztLQUN6QztJQUVELE1BQU0sV0FBVyxHQUFHLElBQUksTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzVDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRCxNQUFNLE9BQU8sR0FBUSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUVsRSxJQUFJLE9BQU8sQ0FBQyxPQUFPLEtBQUssS0FBSyxJQUFJLE9BQU8sRUFBRSxXQUFXLEtBQUssSUFBSSxFQUFFO1FBQzVELEdBQUcsR0FBRyxNQUFNLENBQ1IsdUxBQXVMLENBQzFMLENBQUM7UUFDRixNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3RDLE9BQU8sQ0FBQyxJQUFJLENBQUMsNENBQTRDLENBQUMsQ0FBQztRQUMzRCxPQUFPLENBQUMsSUFBSSxDQUFDLDZDQUE2QyxDQUFDLENBQUM7UUFDNUQsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2QixPQUFPLENBQUMsSUFBSSxDQUFDLDRDQUE0QyxDQUFDLENBQUM7S0FDOUQ7SUFFRCxNQUFNLGNBQWMsQ0FDaEIsc0xBQXNMLEVBQ3RMLEtBQU0sQ0FDVCxDQUFDO0lBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUVyQixJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUNoQixRQUFRLENBQUMsc0JBQXNCLENBQUMsNkJBQTZCLENBQUMsQ0FDakUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUU5QyxJQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7UUFDakIsR0FBRyxDQUFDLFNBQVMsSUFBSTs7OzthQUlaLENBQUM7S0FDVDtTQUFNLElBQUksT0FBTyxDQUFDLFdBQVcsS0FBSyxJQUFJLEVBQUU7UUFDckMsR0FBRyxDQUFDLFNBQVMsSUFBSTs7OztTQUloQixDQUFDO0tBQ0w7U0FBTSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLFdBQVcsR0FBRyxDQUFDLEVBQUU7UUFDakQsR0FBRyxDQUFDLFNBQVMsSUFBSTs7Ozs7Ozs7Ozs7OzhCQVlLLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUM7OEJBQ25ELGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUM7OEJBQzNDLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUM7OEJBRTdDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQzthQUN6QyxjQUFjLEVBQUU7YUFDaEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FDckI7Ozs7O2FBS1gsQ0FBQztLQUNUO1NBQU07UUFDSCxHQUFHLENBQUMsU0FBUyxJQUFJOzs7Ozs7Ozs7OzhCQVVLLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7OEJBRTNDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQzthQUNyQyxjQUFjLEVBQUU7YUFDaEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FDckI7Ozs7O1NBS2YsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFDLEVBQUUsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3N0YXQtZXN0aW1hdGUtYXBpLy4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIkdNX2FkZFN0eWxlKGBcbnRhYmxlLmN1c3RvbVRhYmxlIHtcbiAgcG9zaXRpb246cmVsYXRpdmU7XG4gIHRvcDogLTEwcHg7XG4gIHdpZHRoOiAzODZweDtcbiAgYmFja2dyb3VuZC1jb2xvcjogI0ZGRkZGRjtcbiAgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTtcbiAgYm9yZGVyLXdpZHRoOiAycHg7XG4gIGJvcmRlci1jb2xvcjogIzdlYThmODtcbiAgYm9yZGVyLXN0eWxlOiBzb2xpZDtcbiAgb3ZlcmZsb3c6IHNjcm9sbDtcbn1cbnRhYmxlLmN1c3RvbVRhYmxlIHRkLCB0YWJsZS5jdXN0b21UYWJsZSB0aCB7XG4gIGJvcmRlci13aWR0aDogMnB4O1xuICBib3JkZXItY29sb3I6ICMyODIyNDI7XG4gIGJvcmRlci1zdHlsZTogc29saWQ7XG4gIHBhZGRpbmc6IDVweDtcbiAgY29sb3I6ICNGRkZGRkY7XG59XG50YWJsZS5jdXN0b21UYWJsZSB0Ym9keSB7XG4gIGJhY2tncm91bmQtY29sb3I6ICMzMzMzMzM7XG59XG50YWJsZS5jdXN0b21UYWJsZSB0aGVhZCB7XG4gIGJhY2tncm91bmQtY29sb3I6ICNjZjI2OTY7XG59XG4uaGVkIHtcbiAgcGFkZGluZzogMjBweDtcbiAgZGlzcGxheTogZmxleDtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGNvbG9yOiAjRkZGRkZGO1xufVxuYCk7XG5cbmludGVyZmFjZSBTcHkge1xuICAgIHN1Y2Nlc3M6IGJvb2xlYW47XG4gICAgbWVzc2FnZTogc3RyaW5nO1xuICAgIG1haW50ZW5hbmNlPzogYm9vbGVhbjtcbiAgICBzcHk6IHtcbiAgICAgICAgdXNlcklkOiBudW1iZXI7XG4gICAgICAgIHVzZXJOYW1lOiBzdHJpbmc7XG4gICAgICAgIGVzdGltYXRlOiB7XG4gICAgICAgICAgICBzdGF0czogbnVtYmVyO1xuICAgICAgICAgICAgbGFzdFVwZGF0ZWQ6IERhdGU7XG4gICAgICAgIH07XG4gICAgICAgIHN0YXRJbnRlcnZhbDoge1xuICAgICAgICAgICAgbWluOiBudW1iZXI7XG4gICAgICAgICAgICBtYXg6IG51bWJlcjtcbiAgICAgICAgICAgIGJhdHRsZVNjb3JlOiBudW1iZXI7XG4gICAgICAgICAgICBsYXN0VXBkYXRlZDogRGF0ZTtcbiAgICAgICAgfTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBzaG9ydGVuTnVtYmVyKG51bWJlcjogbnVtYmVyKTogc3RyaW5nIHtcbiAgICBsZXQgcHJlZml4ID0gJyc7XG4gICAgaWYgKG51bWJlciA8IDApIHByZWZpeCA9ICctJztcblxuICAgIGxldCBudW0gPSBwYXJzZUludChudW1iZXIudG9TdHJpbmcoKS5yZXBsYWNlKC9bXjAtOS5dL2csICcnKSk7XG4gICAgaWYgKG51bSA8IDEwMDApIHtcbiAgICAgICAgcmV0dXJuIG51bS50b1N0cmluZygpO1xuICAgIH1cbiAgICBsZXQgc2kgPSBbXG4gICAgICAgIHsgdjogMWUzLCBzOiAnSycgfSxcbiAgICAgICAgeyB2OiAxZTYsIHM6ICdNJyB9LFxuICAgICAgICB7IHY6IDFlOSwgczogJ0InIH0sXG4gICAgICAgIHsgdjogMWUxMiwgczogJ1QnIH0sXG4gICAgICAgIHsgdjogMWUxNSwgczogJ1AnIH0sXG4gICAgICAgIHsgdjogMWUxOCwgczogJ0UnIH0sXG4gICAgXTtcbiAgICBsZXQgaW5kZXg7XG4gICAgZm9yIChpbmRleCA9IHNpLmxlbmd0aCAtIDE7IGluZGV4ID4gMDsgaW5kZXgtLSkge1xuICAgICAgICBpZiAobnVtID49IHNpW2luZGV4XS52KSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgICBwcmVmaXggK1xuICAgICAgICAobnVtIC8gc2lbaW5kZXhdLnYpLnRvRml4ZWQoMikucmVwbGFjZSgvXFwuMCskfChcXC5bMC05XSpbMS05XSkwKyQvLCAnJDEnKSArXG4gICAgICAgIHNpW2luZGV4XS5zXG4gICAgKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0U3B5KGtleTogc3RyaW5nLCBpZDogc3RyaW5nLCBkZWJ1ZzogYm9vbGVhbik6IFByb21pc2U8YW55PiB7XG4gICAgbGV0IHJlcyA9IG51bGw7XG4gICAgY29uc3QgdXJsID0gZGVidWdcbiAgICAgICAgPyBgaHR0cDovL2xvY2FsaG9zdDoyNTU2NS9zdGF0cy91cGRhdGVgIDpcbiAgICAgICAgYGh0dHBzOi8vdHNjLmRpaWNvdC5jYy9zdGF0cy91cGRhdGVgXG5cbiAgICBjb25zdCBiZHkgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGFwaUtleToga2V5LFxuICAgICAgICB1c2VySWQ6IGlkLFxuICAgIH0pO1xuXG4gICAgYXdhaXQgR00ueG1sSHR0cFJlcXVlc3Qoe1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgIEF1dGhvcml6YXRpb246ICcxMDAwMDAwMC02MDAwLTAwMDAtMDAwOS0wMDAwMDAwMDAwMDEnLFxuICAgICAgICAgICAgJ3gtcmVxdWVzdGVkLXdpdGgnOiAnWE1MSHR0cFJlcXVlc3QnLFxuICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgfSxcbiAgICAgICAgZGF0YTogYmR5LFxuICAgICAgICBvbmxvYWQ6IGZ1bmN0aW9uIChyZXNwb25zZTogVGFtcGVybW9ua2V5LlJlc3BvbnNlPGFueT4pIHtcbiAgICAgICAgICAgIHJlcyA9IHJlc3BvbnNlLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgfSxcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzO1xufVxuXG5hc3luYyBmdW5jdGlvbiB3YWl0Rm9yRWxlbWVudChxdWVyeVNlbGVjdG9yOiBzdHJpbmcsIHRpbWVvdXQ/OiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBsZXQgdGltZXIgPSBudWxsO1xuICAgICAgICBpZiAodGltZW91dCkge1xuICAgICAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChxdWVyeVNlbGVjdG9yKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChxdWVyeVNlbGVjdG9yKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgaWYgKHRpbWVyICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHtcbiAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG4oYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGRlYnVnID0gZmFsc2U7XG4gICAgbGV0IGtleTogc3RyaW5nID0gYXdhaXQgR00uZ2V0VmFsdWUoJ3RzY19hcGlfa2V5JywgJycpO1xuICAgIGlmIChrZXkgPT09ICcnKSB7XG4gICAgICAgIGtleSA9IHByb21wdChgUGxlYXNlIGZpbGwgaW4geW91ciBBUEkga2V5IHdpdGggdGhlIG9uZSB1c2VkIGluIFRvcm4gU3RhdHMgQ2VudHJhbGApO1xuICAgICAgICBhd2FpdCBHTS5zZXRWYWx1ZSgndHNjX2FwaV9rZXknLCBrZXkpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qga2V5UmVnZXggPSBuZXcgUmVnRXhwKC9eW2EtekEtWjAtOV17MTZ9JC8pO1xuICAgIGlmIChrZXlSZWdleC50ZXN0KGtleSkgPT09IGZhbHNlKSB7XG4gICAgICAgIGtleSA9IHByb21wdChgVGhlIEFQSSBrZXkgeW91IGhhdmUgZW50ZXJlZCBpcyBpbnZhbGlkLCBwbGVhc2UgdHJ5IGFnYWluYCk7XG4gICAgICAgIGF3YWl0IEdNLnNldFZhbHVlKCd0c2NfYXBpX2tleScsIGtleSk7XG4gICAgfVxuXG4gICAgY29uc3QgdXNlcklkUmVnZXggPSBuZXcgUmVnRXhwKC9YSUQ9KFxcZCspLyk7XG4gICAgY29uc3QgdXNlcklkID0gd2luZG93LmxvY2F0aW9uLmhyZWYubWF0Y2godXNlcklkUmVnZXgpWzFdO1xuICAgIGNvbnN0IHNweUluZm86IFNweSA9IEpTT04ucGFyc2UoYXdhaXQgZ2V0U3B5KGtleSwgdXNlcklkLCBkZWJ1ZykpO1xuXG4gICAgaWYgKHNweUluZm8uc3VjY2VzcyA9PT0gZmFsc2UgJiYgc3B5SW5mbz8ubWFpbnRlbmFuY2UgIT09IHRydWUpIHtcbiAgICAgICAga2V5ID0gcHJvbXB0KFxuICAgICAgICAgICAgYFNvbWV0aGluZyB3ZW50IHdyb25nLiBBcmUgeW91IHVzaW5nIHRoZSBjb3JyZWN0IEFQSSBrZXk/IFBsZWFzZSB0cnkgYWdhaW4uIElmIHRoZSBwcm9ibGVtIHBlcnNpc3RzLCBwbGVhc2UgY29udGFjdCB0aGUgZGV2ZWxvcGVyIHdpdGggdGhlIGFwcm9wcmlhdGUgbG9ncyBmb3VuZCBpbiB0aGUgY29uc29sZSAoRjEyKS5gXG4gICAgICAgICk7XG4gICAgICAgIGF3YWl0IEdNLnNldFZhbHVlKCd0c2NfYXBpX2tleScsIGtleSk7XG4gICAgICAgIGNvbnNvbGUud2FybihgVE9STiBTVEFUUyBDRU5UUkFMIERFQlVHIElORk9STUFUSU9OIEJFTE9XYCk7XG4gICAgICAgIGNvbnNvbGUud2FybihgVGhlIEFQSSBoYXMgcmV0dXJuZWQgdGhlIGZvbGxvd2luZyBtZXNzYWdlOmApO1xuICAgICAgICBjb25zb2xlLnRhYmxlKHNweUluZm8pO1xuICAgICAgICBjb25zb2xlLndhcm4oYFRPUk4gU1RBVFMgQ0VOVFJBTCBERUJVRyBJTkZPUk1BVElPTiBBQk9WRWApO1xuICAgIH1cblxuICAgIGF3YWl0IHdhaXRGb3JFbGVtZW50KFxuICAgICAgICAnI3Byb2ZpbGVyb290ID4gZGl2ID4gZGl2ID4gZGl2ID4gZGl2Om50aC1jaGlsZCgxKSA+IGRpdi5wcm9maWxlLXJpZ2h0LXdyYXBwZXIucmlnaHQgPiBkaXYucHJvZmlsZS1idXR0b25zLnByb2ZpbGUtYWN0aW9uID4gZGl2ID4gZGl2LmNvbnQuYm90dG9tLXJvdW5kID4gZGl2ID4gZGl2ID4gZGl2LmVtcHR5LWJsb2NrJyxcbiAgICAgICAgMTBfMDAwXG4gICAgKTtcblxuICAgIGNvbnNvbGUubG9nKHNweUluZm8pO1xuXG4gICAgbGV0IGFyciA9IEFycmF5LmZyb20oXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoYHByb2ZpbGUtcmlnaHQtd3JhcHBlciByaWdodGApXG4gICAgKVswXS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGBlbXB0eS1ibG9ja2ApWzBdO1xuXG4gICAgaWYgKHNweUluZm8gPT0gbnVsbCkge1xuICAgICAgICBhcnIuaW5uZXJIVE1MICs9IGBcbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPGgzIGNsYXNzID0gXCJoZWRcIj5Vc2VyIG5vdCBzcGllZDwvaDM+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIGA7XG4gICAgfSBlbHNlIGlmIChzcHlJbmZvLm1haW50ZW5hbmNlID09PSB0cnVlKSB7XG4gICAgICAgIGFyci5pbm5lckhUTUwgKz0gYFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgzIGNsYXNzID0gXCJoZWRcIj5UU0MgaXMgdW5kZXJnb2luZyBtYWludGVuYW5jZTwvaDM+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICBgO1xuICAgIH0gZWxzZSBpZiAoc3B5SW5mby5zcHkuc3RhdEludGVydmFsLmJhdHRsZVNjb3JlID4gMCkge1xuICAgICAgICBhcnIuaW5uZXJIVE1MICs9IGBcbiAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3M9XCJjdXN0b21UYWJsZVwiPlxuICAgICAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoPkJhdHRsZSBzY29yZTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGg+TWluIHN0YXQgcmFuZ2U8L3RoPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoPk1heCBzdGF0IHJhbmdlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5EYXRlIHNwaWVkPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgPC90aGRlYWQ+XG4gICAgICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQ+JHtzaG9ydGVuTnVtYmVyKHNweUluZm8uc3B5LnN0YXRJbnRlcnZhbC5iYXR0bGVTY29yZSl9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD4ke3Nob3J0ZW5OdW1iZXIoc3B5SW5mby5zcHkuc3RhdEludGVydmFsLm1pbil9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD4ke3Nob3J0ZW5OdW1iZXIoc3B5SW5mby5zcHkuc3RhdEludGVydmFsLm1heCl9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD4ke1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKHNweUluZm8uc3B5LnN0YXRJbnRlcnZhbC5sYXN0VXBkYXRlZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRvTG9jYWxlU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNwbGl0KCcsJylbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgIH08L3RkPlxuICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICBgO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGFyci5pbm5lckhUTUwgKz0gYFxuICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwiY3VzdG9tVGFibGVcIj5cbiAgICAgICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5TdGF0IGVzdGltYXRlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5EYXRlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgPC90aGRlYWQ+XG4gICAgICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQ+JHtzaG9ydGVuTnVtYmVyKHNweUluZm8uc3B5LmVzdGltYXRlLnN0YXRzKX08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkPiR7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUoc3B5SW5mby5zcHkuZXN0aW1hdGUubGFzdFVwZGF0ZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50b0xvY2FsZVN0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zcGxpdCgnLCcpWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICB9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICBgO1xuICAgIH1cbn0pKCk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=