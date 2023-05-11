// ==UserScript==
// @name            TSC Spies
// @namespace       Torn Stats Central
// @version         1.0.0
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
(async function () {
    let key = await GM.getValue('tsc_api_key', '');
    if (key === '') {
        key = prompt(`Please fill in your api key with the one used in Torn Stats Central :)`);
        GM.setValue('tsc_api_key', key);
        return;
    }
    const keyRegex = new RegExp(/^[a-zA-Z0-9]{16}$/);
    if (keyRegex.test(key) === false) {
        key = prompt(`Your last api key was invalid, please enter a valid one :)`);
        GM.setValue('tsc_api_key', key);
    }
    const userIdRegex = new RegExp(/XID=(\d+)/);
    const userId = window.location.href.match(userIdRegex)[1];
    const spyInfo = JSON.parse(await getSpy(key, userId));
    console.table(spyInfo);
    if (spyInfo.success === false) {
        alert(`Something went wrong, incorrect api key?\nIf the issue persists contact a Torn Stats Central admin :)`);
        return;
    }
    setTimeout(() => {
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
                    <td>${new Date(spyInfo.spy.estimate.lastUpdated).toLocaleString().split(',')[0]}</td>
                </tr>
            </tbody>
        </table>
        </div>
    `;
        }
    }, 1500);
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Ozs7Ozs7OzBCQVlILGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUM7MEJBQ25ELGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUM7MEJBQzNDLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUM7MEJBRTdDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQztpQkFDekMsY0FBYyxFQUFFO2lCQUNoQixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUNyQjs7Ozs7U0FLWCxDQUFDO1NBQ0Q7YUFBTTtZQUNILEdBQUcsQ0FBQyxTQUFTLElBQUk7Ozs7Ozs7Ozs7MEJBVUgsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQzswQkFFM0MsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FDNUU7Ozs7O0tBS2YsQ0FBQztTQUNHO0lBQ0wsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3N0YXQtZXN0aW1hdGUtYXBpLy4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIkdNX2FkZFN0eWxlKGBcbnRhYmxlLmN1c3RvbVRhYmxlIHtcbiAgcG9zaXRpb246cmVsYXRpdmU7XG4gIHRvcDogLTEwcHg7XG4gIHdpZHRoOiAzODZweDtcbiAgYmFja2dyb3VuZC1jb2xvcjogI0ZGRkZGRjtcbiAgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTtcbiAgYm9yZGVyLXdpZHRoOiAycHg7XG4gIGJvcmRlci1jb2xvcjogIzdlYThmODtcbiAgYm9yZGVyLXN0eWxlOiBzb2xpZDtcbiAgb3ZlcmZsb3c6IHNjcm9sbDtcbn1cbnRhYmxlLmN1c3RvbVRhYmxlIHRkLCB0YWJsZS5jdXN0b21UYWJsZSB0aCB7XG4gIGJvcmRlci13aWR0aDogMnB4O1xuICBib3JkZXItY29sb3I6ICMyODIyNDI7XG4gIGJvcmRlci1zdHlsZTogc29saWQ7XG4gIHBhZGRpbmc6IDVweDtcbiAgY29sb3I6ICNGRkZGRkY7XG59XG50YWJsZS5jdXN0b21UYWJsZSB0Ym9keSB7XG4gIGJhY2tncm91bmQtY29sb3I6ICMzMzMzMzM7XG59XG50YWJsZS5jdXN0b21UYWJsZSB0aGVhZCB7XG4gIGJhY2tncm91bmQtY29sb3I6ICNjZjI2OTY7XG59XG4uaGVkIHtcbiAgcGFkZGluZzogMjBweDtcbiAgZGlzcGxheTogZmxleDtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGNvbG9yOiAjRkZGRkZGO1xufVxuYCk7XG5cbmludGVyZmFjZSBTcHkge1xuICAgIHN1Y2Nlc3M6IGJvb2xlYW47XG4gICAgbWVzc2FnZTogc3RyaW5nO1xuICAgIHNweToge1xuICAgICAgICB1c2VySWQ6IG51bWJlcjtcbiAgICAgICAgdXNlck5hbWU6IHN0cmluZztcbiAgICAgICAgZXN0aW1hdGU6IHtcbiAgICAgICAgICAgIHN0YXRzOiBudW1iZXI7XG4gICAgICAgICAgICBsYXN0VXBkYXRlZDogRGF0ZTtcbiAgICAgICAgfTtcbiAgICAgICAgc3RhdEludGVydmFsOiB7XG4gICAgICAgICAgICBtaW46IG51bWJlcjtcbiAgICAgICAgICAgIG1heDogbnVtYmVyO1xuICAgICAgICAgICAgYmF0dGxlU2NvcmU6IG51bWJlcjtcbiAgICAgICAgICAgIGxhc3RVcGRhdGVkOiBEYXRlO1xuICAgICAgICB9O1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIHNob3J0ZW5OdW1iZXIobnVtYmVyOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIGxldCBwcmVmaXggPSAnJztcbiAgICBpZiAobnVtYmVyIDwgMCkgcHJlZml4ID0gJy0nO1xuXG4gICAgbGV0IG51bSA9IHBhcnNlSW50KG51bWJlci50b1N0cmluZygpLnJlcGxhY2UoL1teMC05Ll0vZywgJycpKTtcbiAgICBpZiAobnVtIDwgMTAwMCkge1xuICAgICAgICByZXR1cm4gbnVtLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGxldCBzaSA9IFtcbiAgICAgICAgeyB2OiAxZTMsIHM6ICdLJyB9LFxuICAgICAgICB7IHY6IDFlNiwgczogJ00nIH0sXG4gICAgICAgIHsgdjogMWU5LCBzOiAnQicgfSxcbiAgICAgICAgeyB2OiAxZTEyLCBzOiAnVCcgfSxcbiAgICAgICAgeyB2OiAxZTE1LCBzOiAnUCcgfSxcbiAgICAgICAgeyB2OiAxZTE4LCBzOiAnRScgfSxcbiAgICBdO1xuICAgIGxldCBpbmRleDtcbiAgICBmb3IgKGluZGV4ID0gc2kubGVuZ3RoIC0gMTsgaW5kZXggPiAwOyBpbmRleC0tKSB7XG4gICAgICAgIGlmIChudW0gPj0gc2lbaW5kZXhdLnYpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICAgIHByZWZpeCArXG4gICAgICAgIChudW0gLyBzaVtpbmRleF0udikudG9GaXhlZCgyKS5yZXBsYWNlKC9cXC4wKyR8KFxcLlswLTldKlsxLTldKTArJC8sICckMScpICtcbiAgICAgICAgc2lbaW5kZXhdLnNcbiAgICApO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRTcHkoa2V5OiBzdHJpbmcsIGlkOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xuICAgIGxldCByZXM7XG5cbiAgICBjb25zdCBiZHkgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGFwaUtleToga2V5LFxuICAgICAgICB1c2VySWQ6IGlkLFxuICAgIH0pO1xuXG4gICAgYXdhaXQgR00ueG1sSHR0cFJlcXVlc3Qoe1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgdXJsOiBgaHR0cHM6Ly90c2MuZGlpY290LmNjL3N0YXRzL3VwZGF0ZWAsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgIEF1dGhvcml6YXRpb246ICcxMDAwMDAwMC02MDAwLTAwMDAtMDAwOS0wMDAwMDAwMDAwMDEnLFxuICAgICAgICAgICAgJ3gtcmVxdWVzdGVkLXdpdGgnOiAnWE1MSHR0cFJlcXVlc3QnLFxuICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgfSxcbiAgICAgICAgZGF0YTogYmR5LFxuICAgICAgICBvbmxvYWQ6IGZ1bmN0aW9uIChyZXNwb25zZTogVGFtcGVybW9ua2V5LlJlc3BvbnNlPGFueT4pIHtcbiAgICAgICAgICAgIHJlcyA9IHJlc3BvbnNlLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgfSxcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzO1xufVxuXG4oYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgIGxldCBrZXk6IHN0cmluZyA9IGF3YWl0IEdNLmdldFZhbHVlKCd0c2NfYXBpX2tleScsICcnKTtcbiAgICBpZiAoa2V5ID09PSAnJykge1xuICAgICAgICBrZXkgPSBwcm9tcHQoYFBsZWFzZSBmaWxsIGluIHlvdXIgYXBpIGtleSB3aXRoIHRoZSBvbmUgdXNlZCBpbiBUb3JuIFN0YXRzIENlbnRyYWwgOilgKTtcbiAgICAgICAgR00uc2V0VmFsdWUoJ3RzY19hcGlfa2V5Jywga2V5KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGtleVJlZ2V4ID0gbmV3IFJlZ0V4cCgvXlthLXpBLVowLTldezE2fSQvKTtcbiAgICBpZiAoa2V5UmVnZXgudGVzdChrZXkpID09PSBmYWxzZSkge1xuICAgICAgICBrZXkgPSBwcm9tcHQoYFlvdXIgbGFzdCBhcGkga2V5IHdhcyBpbnZhbGlkLCBwbGVhc2UgZW50ZXIgYSB2YWxpZCBvbmUgOilgKTtcbiAgICAgICAgR00uc2V0VmFsdWUoJ3RzY19hcGlfa2V5Jywga2V5KTtcbiAgICB9XG5cbiAgICBjb25zdCB1c2VySWRSZWdleCA9IG5ldyBSZWdFeHAoL1hJRD0oXFxkKykvKTtcbiAgICBjb25zdCB1c2VySWQgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5tYXRjaCh1c2VySWRSZWdleClbMV07XG4gICAgY29uc3Qgc3B5SW5mbzogU3B5ID0gSlNPTi5wYXJzZShhd2FpdCBnZXRTcHkoa2V5LCB1c2VySWQpKTtcbiAgICBjb25zb2xlLnRhYmxlKHNweUluZm8pO1xuXG4gICAgaWYgKHNweUluZm8uc3VjY2VzcyA9PT0gZmFsc2UpIHtcbiAgICAgICAgYWxlcnQoXG4gICAgICAgICAgICBgU29tZXRoaW5nIHdlbnQgd3JvbmcsIGluY29ycmVjdCBhcGkga2V5P1xcbklmIHRoZSBpc3N1ZSBwZXJzaXN0cyBjb250YWN0IGEgVG9ybiBTdGF0cyBDZW50cmFsIGFkbWluIDopYFxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGxldCBhcnIgPSBBcnJheS5mcm9tKFxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShgcHJvZmlsZS1yaWdodC13cmFwcGVyIHJpZ2h0YClcbiAgICAgICAgKVswXS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGBlbXB0eS1ibG9ja2ApWzBdO1xuXG4gICAgICAgIGlmICghc3B5SW5mbykge1xuICAgICAgICAgICAgYXJyLmlubmVySFRNTCArPSBgXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxoMyBjbGFzcyA9IFwiaGVkXCI+VXNlciBub3Qgc3BpZWQ8L2gzPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICBgO1xuICAgICAgICB9IGVsc2UgaWYgKHNweUluZm8uc3B5LnN0YXRJbnRlcnZhbC5iYXR0bGVTY29yZSA+IDApIHtcbiAgICAgICAgICAgIGFyci5pbm5lckhUTUwgKz0gYFxuICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwiY3VzdG9tVGFibGVcIj5cbiAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5CYXR0bGUgc2NvcmU8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGg+TWluIHN0YXQgcmFuZ2U8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGg+TWF4IHN0YXQgcmFuZ2U8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGg+RGF0ZSBzcGllZDwvdGg+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8L3RoZGVhZD5cbiAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD4ke3Nob3J0ZW5OdW1iZXIoc3B5SW5mby5zcHkuc3RhdEludGVydmFsLmJhdHRsZVNjb3JlKX08L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+JHtzaG9ydGVuTnVtYmVyKHNweUluZm8uc3B5LnN0YXRJbnRlcnZhbC5taW4pfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD4ke3Nob3J0ZW5OdW1iZXIoc3B5SW5mby5zcHkuc3RhdEludGVydmFsLm1heCl9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPiR7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZShzcHlJbmZvLnNweS5zdGF0SW50ZXJ2YWwubGFzdFVwZGF0ZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRvTG9jYWxlU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3BsaXQoJywnKVswXVxuICAgICAgICAgICAgICAgICAgICB9PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgPC90YWJsZT5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIGA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcnIuaW5uZXJIVE1MICs9IGBcbiAgICAgICAgPHRhYmxlIGNsYXNzPVwiY3VzdG9tVGFibGVcIj5cbiAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5TdGF0IGVzdGltYXRlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPkRhdGU8L3RoPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgPC90aGRlYWQ+XG4gICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+JHtzaG9ydGVuTnVtYmVyKHNweUluZm8uc3B5LmVzdGltYXRlLnN0YXRzKX08L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+JHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKHNweUluZm8uc3B5LmVzdGltYXRlLmxhc3RVcGRhdGVkKS50b0xvY2FsZVN0cmluZygpLnNwbGl0KCcsJylbMF1cbiAgICAgICAgICAgICAgICAgICAgfTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgIDwvdGFibGU+XG4gICAgICAgIDwvZGl2PlxuICAgIGA7XG4gICAgICAgIH1cbiAgICB9LCAxNTAwKTtcbn0pKCk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=