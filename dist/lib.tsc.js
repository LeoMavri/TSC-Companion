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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFHLENBQUM7MEJBQzNDLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUM7MEJBRTdDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQztpQkFDekMsY0FBYyxFQUFFO2lCQUNoQixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUNyQjs7Ozs7U0FLWCxDQUFDO1NBQ0Q7YUFBTTtZQUNILEdBQUcsQ0FBQyxTQUFTLElBQUk7Ozs7Ozs7Ozs7MEJBVUgsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQzswQkFFM0MsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FDNUU7Ozs7O0tBS2YsQ0FBQztTQUNHO0lBQ0wsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3N0YXQtZXN0aW1hdGUtYXBpLy4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vISBUaGlzIGlzIHdoYXQgeW91J3JlIGxvb2tpbmcgZm9yIVxubGV0IGtleSA9ICdBRERfWU9VUl9LRVknOyAvL1NBTUUgQVBJIEtFWSBBUyBPTkUgVVNFRCBJTiBUT1JOIFNUQVRTIENFTlRSQUxcbi8vISBUaGlzIGlzIHdoYXQgeW91J3JlIGxvb2tpbmcgZm9yIVxuXG5HTV9hZGRTdHlsZShgXG50YWJsZS5jdXN0b21UYWJsZSB7XG4gIHBvc2l0aW9uOnJlbGF0aXZlO1xuICB0b3A6IC0xMHB4O1xuICB3aWR0aDogMzg2cHg7XG4gIGJhY2tncm91bmQtY29sb3I6ICNGRkZGRkY7XG4gIGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7XG4gIGJvcmRlci13aWR0aDogMnB4O1xuICBib3JkZXItY29sb3I6ICM3ZWE4Zjg7XG4gIGJvcmRlci1zdHlsZTogc29saWQ7XG4gIG92ZXJmbG93OiBzY3JvbGw7XG59XG50YWJsZS5jdXN0b21UYWJsZSB0ZCwgdGFibGUuY3VzdG9tVGFibGUgdGgge1xuICBib3JkZXItd2lkdGg6IDJweDtcbiAgYm9yZGVyLWNvbG9yOiAjMjgyMjQyO1xuICBib3JkZXItc3R5bGU6IHNvbGlkO1xuICBwYWRkaW5nOiA1cHg7XG4gIGNvbG9yOiAjRkZGRkZGO1xufVxudGFibGUuY3VzdG9tVGFibGUgdGJvZHkge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjMzMzMzMzO1xufVxudGFibGUuY3VzdG9tVGFibGUgdGhlYWQge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjY2YyNjk2O1xufVxuLmhlZCB7XG4gIHBhZGRpbmc6IDIwcHg7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBjb2xvcjogI0ZGRkZGRjtcbn1cbmApO1xuXG5pbnRlcmZhY2UgU3B5IHtcbiAgICBzdWNjZXNzOiBib29sZWFuO1xuICAgIG1lc3NhZ2U6IHN0cmluZztcbiAgICBzcHk6IHtcbiAgICAgICAgdXNlcklkOiBudW1iZXI7XG4gICAgICAgIHVzZXJOYW1lOiBzdHJpbmc7XG4gICAgICAgIGVzdGltYXRlOiB7XG4gICAgICAgICAgICBzdGF0czogbnVtYmVyO1xuICAgICAgICAgICAgbGFzdFVwZGF0ZWQ6IERhdGU7XG4gICAgICAgIH07XG4gICAgICAgIHN0YXRJbnRlcnZhbDoge1xuICAgICAgICAgICAgbWluOiBudW1iZXI7XG4gICAgICAgICAgICBtYXg6IG51bWJlcjtcbiAgICAgICAgICAgIGJhdHRsZVNjb3JlOiBudW1iZXI7XG4gICAgICAgICAgICBsYXN0VXBkYXRlZDogRGF0ZTtcbiAgICAgICAgfTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBzaG9ydGVuTnVtYmVyKG51bWJlcjogbnVtYmVyKTogc3RyaW5nIHtcbiAgICBsZXQgcHJlZml4ID0gJyc7XG4gICAgaWYgKG51bWJlciA8IDApIHByZWZpeCA9ICctJztcblxuICAgIGxldCBudW0gPSBwYXJzZUludChudW1iZXIudG9TdHJpbmcoKS5yZXBsYWNlKC9bXjAtOS5dL2csICcnKSk7XG4gICAgaWYgKG51bSA8IDEwMDApIHtcbiAgICAgICAgcmV0dXJuIG51bS50b1N0cmluZygpO1xuICAgIH1cbiAgICBsZXQgc2kgPSBbXG4gICAgICAgIHsgdjogMWUzLCBzOiAnSycgfSxcbiAgICAgICAgeyB2OiAxZTYsIHM6ICdNJyB9LFxuICAgICAgICB7IHY6IDFlOSwgczogJ0InIH0sXG4gICAgICAgIHsgdjogMWUxMiwgczogJ1QnIH0sXG4gICAgICAgIHsgdjogMWUxNSwgczogJ1AnIH0sXG4gICAgICAgIHsgdjogMWUxOCwgczogJ0UnIH0sXG4gICAgXTtcbiAgICBsZXQgaW5kZXg7XG4gICAgZm9yIChpbmRleCA9IHNpLmxlbmd0aCAtIDE7IGluZGV4ID4gMDsgaW5kZXgtLSkge1xuICAgICAgICBpZiAobnVtID49IHNpW2luZGV4XS52KSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgICBwcmVmaXggK1xuICAgICAgICAobnVtIC8gc2lbaW5kZXhdLnYpLnRvRml4ZWQoMikucmVwbGFjZSgvXFwuMCskfChcXC5bMC05XSpbMS05XSkwKyQvLCAnJDEnKSArXG4gICAgICAgIHNpW2luZGV4XS5zXG4gICAgKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0U3B5KGtleTogc3RyaW5nLCBpZDogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICBsZXQgcmVzO1xuXG4gICAgY29uc3QgYmR5ID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBhcGlLZXk6IGtleSxcbiAgICAgICAgdXNlcklkOiBpZCxcbiAgICB9KTtcblxuICAgIGF3YWl0IEdNLnhtbEh0dHBSZXF1ZXN0KHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIHVybDogYGh0dHBzOi8vdHNjLmRpaWNvdC5jYy9zdGF0cy91cGRhdGVgLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICBBdXRob3JpemF0aW9uOiAnMTAwMDAwMDAtNjAwMC0wMDAwLTAwMDktMDAwMDAwMDAwMDAxJyxcbiAgICAgICAgICAgICd4LXJlcXVlc3RlZC13aXRoJzogJ1hNTEh0dHBSZXF1ZXN0JyxcbiAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgIH0sXG4gICAgICAgIGRhdGE6IGJkeSxcbiAgICAgICAgb25sb2FkOiBmdW5jdGlvbiAocmVzcG9uc2U6IFRhbXBlcm1vbmtleS5SZXNwb25zZTxhbnk+KSB7XG4gICAgICAgICAgICByZXMgPSByZXNwb25zZS5yZXNwb25zZVRleHQ7XG4gICAgICAgIH0sXG4gICAgfSk7XG4gICAgcmV0dXJuIHJlcztcbn1cblxuKGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoa2V5ID09PSAnJykge1xuICAgICAgICBrZXkgPSBwcm9tcHQoYFBsZWFzZSBmaWxsIGluIHlvdXIgYXBpIGtleSB3aXRoIHRoZSBvbmUgdXNlZCBpbiBUb3JuIFN0YXRzIENlbnRyYWwgOilgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGtleVJlZ2V4ID0gbmV3IFJlZ0V4cCgvXlthLXpBLVowLTldezE2fSQvKTtcbiAgICBpZiAoa2V5UmVnZXgudGVzdChrZXkpID09PSBmYWxzZSkge1xuICAgICAgICBrZXkgPSBwcm9tcHQoYFlvdXIgbGFzdCBhcGkga2V5IHdhcyBpbnZhbGlkLCBwbGVhc2UgZW50ZXIgYSB2YWxpZCBvbmUgOilgKTtcbiAgICB9XG5cbiAgICBjb25zdCB1c2VySWRSZWdleCA9IG5ldyBSZWdFeHAoL1hJRD0oXFxkKykvKTtcbiAgICBjb25zdCB1c2VySWQgPSB3aW5kb3cubG9jYXRpb24uaHJlZi5tYXRjaCh1c2VySWRSZWdleClbMV07XG4gICAgY29uc3Qgc3B5SW5mbzogU3B5ID0gSlNPTi5wYXJzZShhd2FpdCBnZXRTcHkoa2V5LCB1c2VySWQpKTtcbiAgICBjb25zb2xlLnRhYmxlKHNweUluZm8pO1xuXG4gICAgaWYgKHNweUluZm8uc3VjY2VzcyA9PT0gZmFsc2UpIHtcbiAgICAgICAgYWxlcnQoXG4gICAgICAgICAgICBgU29tZXRoaW5nIHdlbnQgd3JvbmcsIGluY29ycmVjdCBhcGkga2V5P1xcbklmIHRoZSBpc3N1ZSBwZXJzaXN0cyBjb250YWN0IGEgVG9ybiBTdGF0cyBDZW50cmFsIGFkbWluIDopYFxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGxldCBhcnIgPSBBcnJheS5mcm9tKFxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShgcHJvZmlsZS1yaWdodC13cmFwcGVyIHJpZ2h0YClcbiAgICAgICAgKVswXS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGBlbXB0eS1ibG9ja2ApWzBdO1xuXG4gICAgICAgIGlmICghc3B5SW5mbykge1xuICAgICAgICAgICAgYXJyLmlubmVySFRNTCArPSBgXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxoMyBjbGFzcyA9IFwiaGVkXCI+VXNlciBub3Qgc3BpZWQ8L2gzPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICBgO1xuICAgICAgICB9IGVsc2UgaWYgKHNweUluZm8uc3B5LnN0YXRJbnRlcnZhbC5iYXR0bGVTY29yZSA+IDApIHtcbiAgICAgICAgICAgIGFyci5pbm5lckhUTUwgKz0gYFxuICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwiY3VzdG9tVGFibGVcIj5cbiAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5CYXR0bGUgc2NvcmU8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGg+TWluIHN0YXQgcmFuZ2U8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGg+TWF4IHN0YXQgcmFuZ2U8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGg+RGF0ZSBzcGllZDwvdGg+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8L3RoZGVhZD5cbiAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD4ke3Nob3J0ZW5OdW1iZXIoc3B5SW5mby5zcHkuc3RhdEludGVydmFsLmJhdHRsZVNjb3JlKX08L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+JHtzaG9ydGVuTnVtYmVyKHNweUluZm8uc3B5LnN0YXRJbnRlcnZhbC5taW4pfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD4ke3Nob3J0ZW5OdW1iZXIoc3B5SW5mby5zcHkuc3RhdEludGVydmFsLm1heCl9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPiR7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZShzcHlJbmZvLnNweS5zdGF0SW50ZXJ2YWwubGFzdFVwZGF0ZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRvTG9jYWxlU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3BsaXQoJywnKVswXVxuICAgICAgICAgICAgICAgICAgICB9PC90ZD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgPC90YWJsZT5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIGA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcnIuaW5uZXJIVE1MICs9IGBcbiAgICAgICAgPHRhYmxlIGNsYXNzPVwiY3VzdG9tVGFibGVcIj5cbiAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0aD5TdGF0IGVzdGltYXRlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPkRhdGU8L3RoPlxuICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgPC90aGRlYWQ+XG4gICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+JHtzaG9ydGVuTnVtYmVyKHNweUluZm8uc3B5LmVzdGltYXRlLnN0YXRzKX08L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+JHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKHNweUluZm8uc3B5LmVzdGltYXRlLmxhc3RVcGRhdGVkKS50b0xvY2FsZVN0cmluZygpLnNwbGl0KCcsJylbMF1cbiAgICAgICAgICAgICAgICAgICAgfTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgIDwvdGFibGU+XG4gICAgICAgIDwvZGl2PlxuICAgIGA7XG4gICAgICAgIH1cbiAgICB9LCAxNTAwKTtcbn0pKCk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=