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
// @updateURL       none
// @downloadURL     none
// ==/UserScript==
/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
//! This is what you're looking for!
let key = 'ADD_YOUR_KEY'; //SAME API KEY AS ONE USED IN TORN STATS CENTRAL
//! This is what you're looking for!
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
    if (key === '') {
        key = prompt(`Please fill in your api key with the one used in Torn Stats Central :)`);
        return;
    }
    const keyRegex = new RegExp(/^[a-zA-Z0-9]{16}$/);
    if (keyRegex.test(key) === false) {
        key = prompt(`Your last api key was invalid, please enter a valid one :)`);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LENBQUMsR0FBRyxDQUFDOzBCQUMzQyxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDOzBCQUU3QyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUM7aUJBQ3pDLGNBQWMsRUFBRTtpQkFDaEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FDckI7Ozs7O1NBS1gsQ0FBQztTQUNEO2FBQU07WUFDSCxHQUFHLENBQUMsU0FBUyxJQUFJOzs7Ozs7Ozs7OzBCQVVILGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7MEJBRTNDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQzVFOzs7OztLQUtmLENBQUM7U0FDRztJQUNMLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNiLENBQUMsQ0FBQyxFQUFFLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zdGF0LWVzdGltYXRlLWFwaS8uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyEgVGhpcyBpcyB3aGF0IHlvdSdyZSBsb29raW5nIGZvciFcbmxldCBrZXkgPSAnQUREX1lPVVJfS0VZJzsgLy9TQU1FIEFQSSBLRVkgQVMgT05FIFVTRUQgSU4gVE9STiBTVEFUUyBDRU5UUkFMXG4vLyEgVGhpcyBpcyB3aGF0IHlvdSdyZSBsb29raW5nIGZvciFcblxuR01fYWRkU3R5bGUoYFxudGFibGUuY3VzdG9tVGFibGUge1xuICBwb3NpdGlvbjpyZWxhdGl2ZTtcbiAgdG9wOiAtMTBweDtcbiAgd2lkdGg6IDM4NnB4O1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjRkZGRkZGO1xuICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlO1xuICBib3JkZXItd2lkdGg6IDJweDtcbiAgYm9yZGVyLWNvbG9yOiAjN2VhOGY4O1xuICBib3JkZXItc3R5bGU6IHNvbGlkO1xuICBvdmVyZmxvdzogc2Nyb2xsO1xufVxudGFibGUuY3VzdG9tVGFibGUgdGQsIHRhYmxlLmN1c3RvbVRhYmxlIHRoIHtcbiAgYm9yZGVyLXdpZHRoOiAycHg7XG4gIGJvcmRlci1jb2xvcjogIzI4MjI0MjtcbiAgYm9yZGVyLXN0eWxlOiBzb2xpZDtcbiAgcGFkZGluZzogNXB4O1xuICBjb2xvcjogI0ZGRkZGRjtcbn1cbnRhYmxlLmN1c3RvbVRhYmxlIHRib2R5IHtcbiAgYmFja2dyb3VuZC1jb2xvcjogIzMzMzMzMztcbn1cbnRhYmxlLmN1c3RvbVRhYmxlIHRoZWFkIHtcbiAgYmFja2dyb3VuZC1jb2xvcjogI2NmMjY5Njtcbn1cbi5oZWQge1xuICBwYWRkaW5nOiAyMHB4O1xuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgY29sb3I6ICNGRkZGRkY7XG59XG5gKTtcblxuaW50ZXJmYWNlIFNweSB7XG4gICAgc3VjY2VzczogYm9vbGVhbjtcbiAgICBtZXNzYWdlOiBzdHJpbmc7XG4gICAgc3B5OiB7XG4gICAgICAgIHVzZXJJZDogbnVtYmVyO1xuICAgICAgICB1c2VyTmFtZTogc3RyaW5nO1xuICAgICAgICBlc3RpbWF0ZToge1xuICAgICAgICAgICAgc3RhdHM6IG51bWJlcjtcbiAgICAgICAgICAgIGxhc3RVcGRhdGVkOiBEYXRlO1xuICAgICAgICB9O1xuICAgICAgICBzdGF0SW50ZXJ2YWw6IHtcbiAgICAgICAgICAgIG1pbjogbnVtYmVyO1xuICAgICAgICAgICAgbWF4OiBudW1iZXI7XG4gICAgICAgICAgICBiYXR0bGVTY29yZTogbnVtYmVyO1xuICAgICAgICAgICAgbGFzdFVwZGF0ZWQ6IERhdGU7XG4gICAgICAgIH07XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gc2hvcnRlbk51bWJlcihudW1iZXI6IG51bWJlcik6IHN0cmluZyB7XG4gICAgbGV0IHByZWZpeCA9ICcnO1xuICAgIGlmIChudW1iZXIgPCAwKSBwcmVmaXggPSAnLSc7XG5cbiAgICBsZXQgbnVtID0gcGFyc2VJbnQobnVtYmVyLnRvU3RyaW5nKCkucmVwbGFjZSgvW14wLTkuXS9nLCAnJykpO1xuICAgIGlmIChudW0gPCAxMDAwKSB7XG4gICAgICAgIHJldHVybiBudW0udG9TdHJpbmcoKTtcbiAgICB9XG4gICAgbGV0IHNpID0gW1xuICAgICAgICB7IHY6IDFlMywgczogJ0snIH0sXG4gICAgICAgIHsgdjogMWU2LCBzOiAnTScgfSxcbiAgICAgICAgeyB2OiAxZTksIHM6ICdCJyB9LFxuICAgICAgICB7IHY6IDFlMTIsIHM6ICdUJyB9LFxuICAgICAgICB7IHY6IDFlMTUsIHM6ICdQJyB9LFxuICAgICAgICB7IHY6IDFlMTgsIHM6ICdFJyB9LFxuICAgIF07XG4gICAgbGV0IGluZGV4O1xuICAgIGZvciAoaW5kZXggPSBzaS5sZW5ndGggLSAxOyBpbmRleCA+IDA7IGluZGV4LS0pIHtcbiAgICAgICAgaWYgKG51bSA+PSBzaVtpbmRleF0udikge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgICAgcHJlZml4ICtcbiAgICAgICAgKG51bSAvIHNpW2luZGV4XS52KS50b0ZpeGVkKDIpLnJlcGxhY2UoL1xcLjArJHwoXFwuWzAtOV0qWzEtOV0pMCskLywgJyQxJykgK1xuICAgICAgICBzaVtpbmRleF0uc1xuICAgICk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFNweShrZXk6IHN0cmluZywgaWQ6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgbGV0IHJlcztcblxuICAgIGNvbnN0IGJkeSA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgYXBpS2V5OiBrZXksXG4gICAgICAgIHVzZXJJZDogaWQsXG4gICAgfSk7XG5cbiAgICBhd2FpdCBHTS54bWxIdHRwUmVxdWVzdCh7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICB1cmw6IGBodHRwczovL3RzYy5kaWljb3QuY2Mvc3RhdHMvdXBkYXRlYCxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogJzEwMDAwMDAwLTYwMDAtMDAwMC0wMDA5LTAwMDAwMDAwMDAwMScsXG4gICAgICAgICAgICAneC1yZXF1ZXN0ZWQtd2l0aCc6ICdYTUxIdHRwUmVxdWVzdCcsXG4gICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICB9LFxuICAgICAgICBkYXRhOiBiZHksXG4gICAgICAgIG9ubG9hZDogZnVuY3Rpb24gKHJlc3BvbnNlOiBUYW1wZXJtb25rZXkuUmVzcG9uc2U8YW55Pikge1xuICAgICAgICAgICAgcmVzID0gcmVzcG9uc2UucmVzcG9uc2VUZXh0O1xuICAgICAgICB9LFxuICAgIH0pO1xuICAgIHJldHVybiByZXM7XG59XG5cbihhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGtleSA9PT0gJycpIHtcbiAgICAgICAga2V5ID0gcHJvbXB0KGBQbGVhc2UgZmlsbCBpbiB5b3VyIGFwaSBrZXkgd2l0aCB0aGUgb25lIHVzZWQgaW4gVG9ybiBTdGF0cyBDZW50cmFsIDopYCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBrZXlSZWdleCA9IG5ldyBSZWdFeHAoL15bYS16QS1aMC05XXsxNn0kLyk7XG4gICAgaWYgKGtleVJlZ2V4LnRlc3Qoa2V5KSA9PT0gZmFsc2UpIHtcbiAgICAgICAga2V5ID0gcHJvbXB0KGBZb3VyIGxhc3QgYXBpIGtleSB3YXMgaW52YWxpZCwgcGxlYXNlIGVudGVyIGEgdmFsaWQgb25lIDopYCk7XG4gICAgfVxuXG4gICAgY29uc3QgdXNlcklkUmVnZXggPSBuZXcgUmVnRXhwKC9YSUQ9KFxcZCspLyk7XG4gICAgY29uc3QgdXNlcklkID0gd2luZG93LmxvY2F0aW9uLmhyZWYubWF0Y2godXNlcklkUmVnZXgpWzFdO1xuICAgIGNvbnN0IHNweUluZm86IFNweSA9IEpTT04ucGFyc2UoYXdhaXQgZ2V0U3B5KGtleSwgdXNlcklkKSk7XG4gICAgY29uc29sZS50YWJsZShzcHlJbmZvKTtcblxuICAgIGlmIChzcHlJbmZvLnN1Y2Nlc3MgPT09IGZhbHNlKSB7XG4gICAgICAgIGFsZXJ0KFxuICAgICAgICAgICAgYFNvbWV0aGluZyB3ZW50IHdyb25nLCBpbmNvcnJlY3QgYXBpIGtleT9cXG5JZiB0aGUgaXNzdWUgcGVyc2lzdHMgY29udGFjdCBhIFRvcm4gU3RhdHMgQ2VudHJhbCBhZG1pbiA6KWBcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBsZXQgYXJyID0gQXJyYXkuZnJvbShcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoYHByb2ZpbGUtcmlnaHQtd3JhcHBlciByaWdodGApXG4gICAgICAgIClbMF0uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShgZW1wdHktYmxvY2tgKVswXTtcblxuICAgICAgICBpZiAoIXNweUluZm8pIHtcbiAgICAgICAgICAgIGFyci5pbm5lckhUTUwgKz0gYFxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8aDMgY2xhc3MgPSBcImhlZFwiPlVzZXIgbm90IHNwaWVkPC9oMz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgYDtcbiAgICAgICAgfSBlbHNlIGlmIChzcHlJbmZvLnNweS5zdGF0SW50ZXJ2YWwuYmF0dGxlU2NvcmUgPiAwKSB7XG4gICAgICAgICAgICBhcnIuaW5uZXJIVE1MICs9IGBcbiAgICAgICAgICAgIDx0YWJsZSBjbGFzcz1cImN1c3RvbVRhYmxlXCI+XG4gICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGg+QmF0dGxlIHNjb3JlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPk1pbiBzdGF0IHJhbmdlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPk1heCBzdGF0IHJhbmdlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPkRhdGUgc3BpZWQ8L3RoPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgPC90aGRlYWQ+XG4gICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+JHtzaG9ydGVuTnVtYmVyKHNweUluZm8uc3B5LnN0YXRJbnRlcnZhbC5iYXR0bGVTY29yZSl9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPiR7c2hvcnRlbk51bWJlcihzcHlJbmZvLnNweS5zdGF0SW50ZXJ2YWwubWluKX08L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+JHtzaG9ydGVuTnVtYmVyKHNweUluZm8uc3B5LnN0YXRJbnRlcnZhbC5tYXgpfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD4ke1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUoc3B5SW5mby5zcHkuc3RhdEludGVydmFsLmxhc3RVcGRhdGVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50b0xvY2FsZVN0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNwbGl0KCcsJylbMF1cbiAgICAgICAgICAgICAgICAgICAgfTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgIDwvdGFibGU+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICBgO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXJyLmlubmVySFRNTCArPSBgXG4gICAgICAgIDx0YWJsZSBjbGFzcz1cImN1c3RvbVRhYmxlXCI+XG4gICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGg+U3RhdCBlc3RpbWF0ZTwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5EYXRlPC90aD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIDwvdGhkZWFkPlxuICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgPHRkPiR7c2hvcnRlbk51bWJlcihzcHlJbmZvLnNweS5lc3RpbWF0ZS5zdGF0cyl9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPiR7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZShzcHlJbmZvLnNweS5lc3RpbWF0ZS5sYXN0VXBkYXRlZCkudG9Mb2NhbGVTdHJpbmcoKS5zcGxpdCgnLCcpWzBdXG4gICAgICAgICAgICAgICAgICAgIH08L3RkPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICA8L3RhYmxlPlxuICAgICAgICA8L2Rpdj5cbiAgICBgO1xuICAgICAgICB9XG4gICAgfSwgMTUwMCk7XG59KSgpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9