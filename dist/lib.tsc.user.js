// ==UserScript==
// @name            TSC Spies
// @namespace       Torn Stats Central
// @version         1.0.2
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
async function getSpy(key, id) {
    let res;
    const bdy = JSON.stringify({
        apiKey: key,
        userId: id,
    });
    await GM.xmlHttpRequest({
        method: 'POST',
        url: `https://tsc.diicot.cc/stats/update`,
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
    const spyInfo = JSON.parse(await getSpy(key, userId));
    if (spyInfo.success === false) {
        key = prompt(`Something went wrong. Are you using the correct API key? Please try again. If the problem persists, please contact the developer with the apropriate logs found in the console (F12).`);
        console.warn(`TORN STATS CENTRAL DEBUG INFORMATION BELOW`);
        console.warn(`The API has returned the following message:`);
        console.table(spyInfo);
        console.warn(`TORN STATS CENTRAL DEBUG INFORMATION ABOVE`);
        return;
    }
    await waitForElement('#profileroot > div > div > div > div:nth-child(1) > div.profile-right-wrapper.right > div.profile-buttons.profile-action > div > div.cont.bottom-round > div > div > div.empty-block', 10000);
    console.log(spyInfo);
    let arr = Array.from(document.getElementsByClassName(`profile-right-wrapper right`))[0].getElementsByClassName(`empty-block`)[0];
    if (!spyInfo) {
        arr.innerHTML += `
            <div>
                <h3 class = "hed">User not spied</h3>
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxFQUFFO1FBQ2pELEdBQUcsQ0FBQyxTQUFTLElBQUk7Ozs7Ozs7Ozs7Ozs4QkFZSyxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDOzhCQUNuRCxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDOzhCQUMzQyxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDOzhCQUU3QyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUM7YUFDekMsY0FBYyxFQUFFO2FBQ2hCLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQ3JCOzs7OzthQUtYLENBQUM7S0FDVDtTQUFNO1FBQ0gsR0FBRyxDQUFDLFNBQVMsSUFBSTs7Ozs7Ozs7Ozs4QkFVSyxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDOzhCQUUzQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUM7YUFDckMsY0FBYyxFQUFFO2FBQ2hCLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQ3JCOzs7OztTQUtmLENBQUM7S0FDTDtBQUNMLENBQUMsQ0FBQyxFQUFFLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zdGF0LWVzdGltYXRlLWFwaS8uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJHTV9hZGRTdHlsZShgXG50YWJsZS5jdXN0b21UYWJsZSB7XG4gIHBvc2l0aW9uOnJlbGF0aXZlO1xuICB0b3A6IC0xMHB4O1xuICB3aWR0aDogMzg2cHg7XG4gIGJhY2tncm91bmQtY29sb3I6ICNGRkZGRkY7XG4gIGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7XG4gIGJvcmRlci13aWR0aDogMnB4O1xuICBib3JkZXItY29sb3I6ICM3ZWE4Zjg7XG4gIGJvcmRlci1zdHlsZTogc29saWQ7XG4gIG92ZXJmbG93OiBzY3JvbGw7XG59XG50YWJsZS5jdXN0b21UYWJsZSB0ZCwgdGFibGUuY3VzdG9tVGFibGUgdGgge1xuICBib3JkZXItd2lkdGg6IDJweDtcbiAgYm9yZGVyLWNvbG9yOiAjMjgyMjQyO1xuICBib3JkZXItc3R5bGU6IHNvbGlkO1xuICBwYWRkaW5nOiA1cHg7XG4gIGNvbG9yOiAjRkZGRkZGO1xufVxudGFibGUuY3VzdG9tVGFibGUgdGJvZHkge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjMzMzMzMzO1xufVxudGFibGUuY3VzdG9tVGFibGUgdGhlYWQge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjY2YyNjk2O1xufVxuLmhlZCB7XG4gIHBhZGRpbmc6IDIwcHg7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBjb2xvcjogI0ZGRkZGRjtcbn1cbmApO1xuXG5pbnRlcmZhY2UgU3B5IHtcbiAgICBzdWNjZXNzOiBib29sZWFuO1xuICAgIG1lc3NhZ2U6IHN0cmluZztcbiAgICBzcHk6IHtcbiAgICAgICAgdXNlcklkOiBudW1iZXI7XG4gICAgICAgIHVzZXJOYW1lOiBzdHJpbmc7XG4gICAgICAgIGVzdGltYXRlOiB7XG4gICAgICAgICAgICBzdGF0czogbnVtYmVyO1xuICAgICAgICAgICAgbGFzdFVwZGF0ZWQ6IERhdGU7XG4gICAgICAgIH07XG4gICAgICAgIHN0YXRJbnRlcnZhbDoge1xuICAgICAgICAgICAgbWluOiBudW1iZXI7XG4gICAgICAgICAgICBtYXg6IG51bWJlcjtcbiAgICAgICAgICAgIGJhdHRsZVNjb3JlOiBudW1iZXI7XG4gICAgICAgICAgICBsYXN0VXBkYXRlZDogRGF0ZTtcbiAgICAgICAgfTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBzaG9ydGVuTnVtYmVyKG51bWJlcjogbnVtYmVyKTogc3RyaW5nIHtcbiAgICBsZXQgcHJlZml4ID0gJyc7XG4gICAgaWYgKG51bWJlciA8IDApIHByZWZpeCA9ICctJztcblxuICAgIGxldCBudW0gPSBwYXJzZUludChudW1iZXIudG9TdHJpbmcoKS5yZXBsYWNlKC9bXjAtOS5dL2csICcnKSk7XG4gICAgaWYgKG51bSA8IDEwMDApIHtcbiAgICAgICAgcmV0dXJuIG51bS50b1N0cmluZygpO1xuICAgIH1cbiAgICBsZXQgc2kgPSBbXG4gICAgICAgIHsgdjogMWUzLCBzOiAnSycgfSxcbiAgICAgICAgeyB2OiAxZTYsIHM6ICdNJyB9LFxuICAgICAgICB7IHY6IDFlOSwgczogJ0InIH0sXG4gICAgICAgIHsgdjogMWUxMiwgczogJ1QnIH0sXG4gICAgICAgIHsgdjogMWUxNSwgczogJ1AnIH0sXG4gICAgICAgIHsgdjogMWUxOCwgczogJ0UnIH0sXG4gICAgXTtcbiAgICBsZXQgaW5kZXg7XG4gICAgZm9yIChpbmRleCA9IHNpLmxlbmd0aCAtIDE7IGluZGV4ID4gMDsgaW5kZXgtLSkge1xuICAgICAgICBpZiAobnVtID49IHNpW2luZGV4XS52KSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgICBwcmVmaXggK1xuICAgICAgICAobnVtIC8gc2lbaW5kZXhdLnYpLnRvRml4ZWQoMikucmVwbGFjZSgvXFwuMCskfChcXC5bMC05XSpbMS05XSkwKyQvLCAnJDEnKSArXG4gICAgICAgIHNpW2luZGV4XS5zXG4gICAgKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0U3B5KGtleTogc3RyaW5nLCBpZDogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICBsZXQgcmVzO1xuXG4gICAgY29uc3QgYmR5ID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBhcGlLZXk6IGtleSxcbiAgICAgICAgdXNlcklkOiBpZCxcbiAgICB9KTtcblxuICAgIGF3YWl0IEdNLnhtbEh0dHBSZXF1ZXN0KHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIHVybDogYGh0dHBzOi8vdHNjLmRpaWNvdC5jYy9zdGF0cy91cGRhdGVgLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICBBdXRob3JpemF0aW9uOiAnMTAwMDAwMDAtNjAwMC0wMDAwLTAwMDktMDAwMDAwMDAwMDAxJyxcbiAgICAgICAgICAgICd4LXJlcXVlc3RlZC13aXRoJzogJ1hNTEh0dHBSZXF1ZXN0JyxcbiAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgIH0sXG4gICAgICAgIGRhdGE6IGJkeSxcbiAgICAgICAgb25sb2FkOiBmdW5jdGlvbiAocmVzcG9uc2U6IFRhbXBlcm1vbmtleS5SZXNwb25zZTxhbnk+KSB7XG4gICAgICAgICAgICByZXMgPSByZXNwb25zZS5yZXNwb25zZVRleHQ7XG4gICAgICAgIH0sXG4gICAgfSk7XG4gICAgcmV0dXJuIHJlcztcbn1cblxuYXN5bmMgZnVuY3Rpb24gd2FpdEZvckVsZW1lbnQocXVlcnlTZWxlY3Rvcjogc3RyaW5nLCB0aW1lb3V0PzogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgbGV0IHRpbWVyID0gbnVsbDtcbiAgICAgICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgICAgIHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgfSwgdGltZW91dCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwocXVlcnlTZWxlY3RvcikubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwocXVlcnlTZWxlY3RvcikubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIGlmICh0aW1lciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuKGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICBsZXQga2V5OiBzdHJpbmcgPSBhd2FpdCBHTS5nZXRWYWx1ZSgndHNjX2FwaV9rZXknLCAnJyk7XG4gICAgaWYgKGtleSA9PT0gJycpIHtcbiAgICAgICAga2V5ID0gcHJvbXB0KGBQbGVhc2UgZmlsbCBpbiB5b3VyIEFQSSBrZXkgd2l0aCB0aGUgb25lIHVzZWQgaW4gVG9ybiBTdGF0cyBDZW50cmFsYCk7XG4gICAgICAgIGF3YWl0IEdNLnNldFZhbHVlKCd0c2NfYXBpX2tleScsIGtleSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBrZXlSZWdleCA9IG5ldyBSZWdFeHAoL15bYS16QS1aMC05XXsxNn0kLyk7XG4gICAgaWYgKGtleVJlZ2V4LnRlc3Qoa2V5KSA9PT0gZmFsc2UpIHtcbiAgICAgICAga2V5ID0gcHJvbXB0KGBUaGUgQVBJIGtleSB5b3UgaGF2ZSBlbnRlcmVkIGlzIGludmFsaWQsIHBsZWFzZSB0cnkgYWdhaW5gKTtcbiAgICAgICAgYXdhaXQgR00uc2V0VmFsdWUoJ3RzY19hcGlfa2V5Jywga2V5KTtcbiAgICB9XG5cbiAgICBjb25zdCB1c2VySWRSZWdleCA9IG5ldyBSZWdFeHAoL1hJRD0oXFxkKykvKTtcbiAgICBjb25zdCB1c2VySWQgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5tYXRjaCh1c2VySWRSZWdleClbMV07XG4gICAgY29uc3Qgc3B5SW5mbzogU3B5ID0gSlNPTi5wYXJzZShhd2FpdCBnZXRTcHkoa2V5LCB1c2VySWQpKTtcblxuICAgIGlmIChzcHlJbmZvLnN1Y2Nlc3MgPT09IGZhbHNlKSB7XG4gICAgICAgIGtleSA9IHByb21wdChcbiAgICAgICAgICAgIGBTb21ldGhpbmcgd2VudCB3cm9uZy4gQXJlIHlvdSB1c2luZyB0aGUgY29ycmVjdCBBUEkga2V5PyBQbGVhc2UgdHJ5IGFnYWluLiBJZiB0aGUgcHJvYmxlbSBwZXJzaXN0cywgcGxlYXNlIGNvbnRhY3QgdGhlIGRldmVsb3BlciB3aXRoIHRoZSBhcHJvcHJpYXRlIGxvZ3MgZm91bmQgaW4gdGhlIGNvbnNvbGUgKEYxMikuYFxuICAgICAgICApO1xuICAgICAgICBjb25zb2xlLndhcm4oYFRPUk4gU1RBVFMgQ0VOVFJBTCBERUJVRyBJTkZPUk1BVElPTiBCRUxPV2ApO1xuICAgICAgICBjb25zb2xlLndhcm4oYFRoZSBBUEkgaGFzIHJldHVybmVkIHRoZSBmb2xsb3dpbmcgbWVzc2FnZTpgKTtcbiAgICAgICAgY29uc29sZS50YWJsZShzcHlJbmZvKTtcbiAgICAgICAgY29uc29sZS53YXJuKGBUT1JOIFNUQVRTIENFTlRSQUwgREVCVUcgSU5GT1JNQVRJT04gQUJPVkVgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGF3YWl0IHdhaXRGb3JFbGVtZW50KFxuICAgICAgICAnI3Byb2ZpbGVyb290ID4gZGl2ID4gZGl2ID4gZGl2ID4gZGl2Om50aC1jaGlsZCgxKSA+IGRpdi5wcm9maWxlLXJpZ2h0LXdyYXBwZXIucmlnaHQgPiBkaXYucHJvZmlsZS1idXR0b25zLnByb2ZpbGUtYWN0aW9uID4gZGl2ID4gZGl2LmNvbnQuYm90dG9tLXJvdW5kID4gZGl2ID4gZGl2ID4gZGl2LmVtcHR5LWJsb2NrJyxcbiAgICAgICAgMTBfMDAwXG4gICAgKTtcblxuICAgIGNvbnNvbGUubG9nKHNweUluZm8pO1xuXG4gICAgbGV0IGFyciA9IEFycmF5LmZyb20oXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoYHByb2ZpbGUtcmlnaHQtd3JhcHBlciByaWdodGApXG4gICAgKVswXS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGBlbXB0eS1ibG9ja2ApWzBdO1xuXG4gICAgaWYgKCFzcHlJbmZvKSB7XG4gICAgICAgIGFyci5pbm5lckhUTUwgKz0gYFxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8aDMgY2xhc3MgPSBcImhlZFwiPlVzZXIgbm90IHNwaWVkPC9oMz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgYDtcbiAgICB9IGVsc2UgaWYgKHNweUluZm8uc3B5LnN0YXRJbnRlcnZhbC5iYXR0bGVTY29yZSA+IDApIHtcbiAgICAgICAgYXJyLmlubmVySFRNTCArPSBgXG4gICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwiY3VzdG9tVGFibGVcIj5cbiAgICAgICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5CYXR0bGUgc2NvcmU8L3RoPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoPk1pbiBzdGF0IHJhbmdlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5NYXggc3RhdCByYW5nZTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGg+RGF0ZSBzcGllZDwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgIDwvdGhkZWFkPlxuICAgICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkPiR7c2hvcnRlbk51bWJlcihzcHlJbmZvLnNweS5zdGF0SW50ZXJ2YWwuYmF0dGxlU2NvcmUpfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQ+JHtzaG9ydGVuTnVtYmVyKHNweUluZm8uc3B5LnN0YXRJbnRlcnZhbC5taW4pfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQ+JHtzaG9ydGVuTnVtYmVyKHNweUluZm8uc3B5LnN0YXRJbnRlcnZhbC5tYXgpfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQ+JHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZShzcHlJbmZvLnNweS5zdGF0SW50ZXJ2YWwubGFzdFVwZGF0ZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50b0xvY2FsZVN0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zcGxpdCgnLCcpWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICB9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgYDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBhcnIuaW5uZXJIVE1MICs9IGBcbiAgICAgICAgICAgIDx0YWJsZSBjbGFzcz1cImN1c3RvbVRhYmxlXCI+XG4gICAgICAgICAgICAgICAgPHRoZWFkPlxuICAgICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGg+U3RhdCBlc3RpbWF0ZTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGg+RGF0ZTwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgIDwvdGhkZWFkPlxuICAgICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkPiR7c2hvcnRlbk51bWJlcihzcHlJbmZvLnNweS5lc3RpbWF0ZS5zdGF0cyl9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD4ke1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKHNweUluZm8uc3B5LmVzdGltYXRlLmxhc3RVcGRhdGVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudG9Mb2NhbGVTdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3BsaXQoJywnKVswXVxuICAgICAgICAgICAgICAgICAgICAgICAgfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgYDtcbiAgICB9XG59KSgpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9