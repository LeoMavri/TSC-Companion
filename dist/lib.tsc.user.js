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
    console.log('Waiting for profile-right-wrapper right to load...');
    await waitForElement('#profileroot > div > div > div > div:nth-child(1) > div.profile-right-wrapper.right > div.profile-buttons.profile-action > div > div.cont.bottom-round > div > div > div.empty-block', 10000);
    console.log('profile-right-wrapper right loaded!');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QyxHQUFHLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQzs4QkFDbkQsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQzs4QkFDM0MsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQzs4QkFFN0MsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDO2FBQ3pDLGNBQWMsRUFBRTthQUNoQixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUNyQjs7Ozs7YUFLWCxDQUFDO0tBQ1Q7U0FBTTtRQUNILEdBQUcsQ0FBQyxTQUFTLElBQUk7Ozs7Ozs7Ozs7OEJBVUssYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQzs4QkFFM0MsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDO2FBQ3JDLGNBQWMsRUFBRTthQUNoQixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUNyQjs7Ozs7U0FLZixDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUMsRUFBRSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc3RhdC1lc3RpbWF0ZS1hcGkvLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiR01fYWRkU3R5bGUoYFxudGFibGUuY3VzdG9tVGFibGUge1xuICBwb3NpdGlvbjpyZWxhdGl2ZTtcbiAgdG9wOiAtMTBweDtcbiAgd2lkdGg6IDM4NnB4O1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjRkZGRkZGO1xuICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlO1xuICBib3JkZXItd2lkdGg6IDJweDtcbiAgYm9yZGVyLWNvbG9yOiAjN2VhOGY4O1xuICBib3JkZXItc3R5bGU6IHNvbGlkO1xuICBvdmVyZmxvdzogc2Nyb2xsO1xufVxudGFibGUuY3VzdG9tVGFibGUgdGQsIHRhYmxlLmN1c3RvbVRhYmxlIHRoIHtcbiAgYm9yZGVyLXdpZHRoOiAycHg7XG4gIGJvcmRlci1jb2xvcjogIzI4MjI0MjtcbiAgYm9yZGVyLXN0eWxlOiBzb2xpZDtcbiAgcGFkZGluZzogNXB4O1xuICBjb2xvcjogI0ZGRkZGRjtcbn1cbnRhYmxlLmN1c3RvbVRhYmxlIHRib2R5IHtcbiAgYmFja2dyb3VuZC1jb2xvcjogIzMzMzMzMztcbn1cbnRhYmxlLmN1c3RvbVRhYmxlIHRoZWFkIHtcbiAgYmFja2dyb3VuZC1jb2xvcjogI2NmMjY5Njtcbn1cbi5oZWQge1xuICBwYWRkaW5nOiAyMHB4O1xuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgY29sb3I6ICNGRkZGRkY7XG59XG5gKTtcblxuaW50ZXJmYWNlIFNweSB7XG4gICAgc3VjY2VzczogYm9vbGVhbjtcbiAgICBtZXNzYWdlOiBzdHJpbmc7XG4gICAgc3B5OiB7XG4gICAgICAgIHVzZXJJZDogbnVtYmVyO1xuICAgICAgICB1c2VyTmFtZTogc3RyaW5nO1xuICAgICAgICBlc3RpbWF0ZToge1xuICAgICAgICAgICAgc3RhdHM6IG51bWJlcjtcbiAgICAgICAgICAgIGxhc3RVcGRhdGVkOiBEYXRlO1xuICAgICAgICB9O1xuICAgICAgICBzdGF0SW50ZXJ2YWw6IHtcbiAgICAgICAgICAgIG1pbjogbnVtYmVyO1xuICAgICAgICAgICAgbWF4OiBudW1iZXI7XG4gICAgICAgICAgICBiYXR0bGVTY29yZTogbnVtYmVyO1xuICAgICAgICAgICAgbGFzdFVwZGF0ZWQ6IERhdGU7XG4gICAgICAgIH07XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gc2hvcnRlbk51bWJlcihudW1iZXI6IG51bWJlcik6IHN0cmluZyB7XG4gICAgbGV0IHByZWZpeCA9ICcnO1xuICAgIGlmIChudW1iZXIgPCAwKSBwcmVmaXggPSAnLSc7XG5cbiAgICBsZXQgbnVtID0gcGFyc2VJbnQobnVtYmVyLnRvU3RyaW5nKCkucmVwbGFjZSgvW14wLTkuXS9nLCAnJykpO1xuICAgIGlmIChudW0gPCAxMDAwKSB7XG4gICAgICAgIHJldHVybiBudW0udG9TdHJpbmcoKTtcbiAgICB9XG4gICAgbGV0IHNpID0gW1xuICAgICAgICB7IHY6IDFlMywgczogJ0snIH0sXG4gICAgICAgIHsgdjogMWU2LCBzOiAnTScgfSxcbiAgICAgICAgeyB2OiAxZTksIHM6ICdCJyB9LFxuICAgICAgICB7IHY6IDFlMTIsIHM6ICdUJyB9LFxuICAgICAgICB7IHY6IDFlMTUsIHM6ICdQJyB9LFxuICAgICAgICB7IHY6IDFlMTgsIHM6ICdFJyB9LFxuICAgIF07XG4gICAgbGV0IGluZGV4O1xuICAgIGZvciAoaW5kZXggPSBzaS5sZW5ndGggLSAxOyBpbmRleCA+IDA7IGluZGV4LS0pIHtcbiAgICAgICAgaWYgKG51bSA+PSBzaVtpbmRleF0udikge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgICAgcHJlZml4ICtcbiAgICAgICAgKG51bSAvIHNpW2luZGV4XS52KS50b0ZpeGVkKDIpLnJlcGxhY2UoL1xcLjArJHwoXFwuWzAtOV0qWzEtOV0pMCskLywgJyQxJykgK1xuICAgICAgICBzaVtpbmRleF0uc1xuICAgICk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFNweShrZXk6IHN0cmluZywgaWQ6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgbGV0IHJlcztcblxuICAgIGNvbnN0IGJkeSA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgYXBpS2V5OiBrZXksXG4gICAgICAgIHVzZXJJZDogaWQsXG4gICAgfSk7XG5cbiAgICBhd2FpdCBHTS54bWxIdHRwUmVxdWVzdCh7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICB1cmw6IGBodHRwczovL3RzYy5kaWljb3QuY2Mvc3RhdHMvdXBkYXRlYCxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogJzEwMDAwMDAwLTYwMDAtMDAwMC0wMDA5LTAwMDAwMDAwMDAwMScsXG4gICAgICAgICAgICAneC1yZXF1ZXN0ZWQtd2l0aCc6ICdYTUxIdHRwUmVxdWVzdCcsXG4gICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICB9LFxuICAgICAgICBkYXRhOiBiZHksXG4gICAgICAgIG9ubG9hZDogZnVuY3Rpb24gKHJlc3BvbnNlOiBUYW1wZXJtb25rZXkuUmVzcG9uc2U8YW55Pikge1xuICAgICAgICAgICAgcmVzID0gcmVzcG9uc2UucmVzcG9uc2VUZXh0O1xuICAgICAgICB9LFxuICAgIH0pO1xuICAgIHJldHVybiByZXM7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHdhaXRGb3JFbGVtZW50KHF1ZXJ5U2VsZWN0b3I6IHN0cmluZywgdGltZW91dD86IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGxldCB0aW1lciA9IG51bGw7XG4gICAgICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHF1ZXJ5U2VsZWN0b3IpLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHF1ZXJ5U2VsZWN0b3IpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICBpZiAodGltZXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwge1xuICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbihhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IGtleTogc3RyaW5nID0gYXdhaXQgR00uZ2V0VmFsdWUoJ3RzY19hcGlfa2V5JywgJycpO1xuICAgIGlmIChrZXkgPT09ICcnKSB7XG4gICAgICAgIGtleSA9IHByb21wdChgUGxlYXNlIGZpbGwgaW4geW91ciBhcGkga2V5IHdpdGggdGhlIG9uZSB1c2VkIGluIFRvcm4gU3RhdHMgQ2VudHJhbCA6KWApO1xuICAgICAgICBHTS5zZXRWYWx1ZSgndHNjX2FwaV9rZXknLCBrZXkpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qga2V5UmVnZXggPSBuZXcgUmVnRXhwKC9eW2EtekEtWjAtOV17MTZ9JC8pO1xuICAgIGlmIChrZXlSZWdleC50ZXN0KGtleSkgPT09IGZhbHNlKSB7XG4gICAgICAgIGtleSA9IHByb21wdChgWW91ciBsYXN0IGFwaSBrZXkgd2FzIGludmFsaWQsIHBsZWFzZSBlbnRlciBhIHZhbGlkIG9uZSA6KWApO1xuICAgICAgICBHTS5zZXRWYWx1ZSgndHNjX2FwaV9rZXknLCBrZXkpO1xuICAgIH1cblxuICAgIGNvbnN0IHVzZXJJZFJlZ2V4ID0gbmV3IFJlZ0V4cCgvWElEPShcXGQrKS8pO1xuICAgIGNvbnN0IHVzZXJJZCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLm1hdGNoKHVzZXJJZFJlZ2V4KVsxXTtcbiAgICBjb25zdCBzcHlJbmZvOiBTcHkgPSBKU09OLnBhcnNlKGF3YWl0IGdldFNweShrZXksIHVzZXJJZCkpO1xuICAgIGNvbnNvbGUudGFibGUoc3B5SW5mbyk7XG5cbiAgICBpZiAoc3B5SW5mby5zdWNjZXNzID09PSBmYWxzZSkge1xuICAgICAgICBhbGVydChcbiAgICAgICAgICAgIGBTb21ldGhpbmcgd2VudCB3cm9uZywgaW5jb3JyZWN0IGFwaSBrZXk/XFxuSWYgdGhlIGlzc3VlIHBlcnNpc3RzIGNvbnRhY3QgYSBUb3JuIFN0YXRzIENlbnRyYWwgYWRtaW4gOilgXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZygnV2FpdGluZyBmb3IgcHJvZmlsZS1yaWdodC13cmFwcGVyIHJpZ2h0IHRvIGxvYWQuLi4nKTtcbiAgICBhd2FpdCB3YWl0Rm9yRWxlbWVudChcbiAgICAgICAgJyNwcm9maWxlcm9vdCA+IGRpdiA+IGRpdiA+IGRpdiA+IGRpdjpudGgtY2hpbGQoMSkgPiBkaXYucHJvZmlsZS1yaWdodC13cmFwcGVyLnJpZ2h0ID4gZGl2LnByb2ZpbGUtYnV0dG9ucy5wcm9maWxlLWFjdGlvbiA+IGRpdiA+IGRpdi5jb250LmJvdHRvbS1yb3VuZCA+IGRpdiA+IGRpdiA+IGRpdi5lbXB0eS1ibG9jaycsXG4gICAgICAgIDEwXzAwMFxuICAgICk7XG4gICAgY29uc29sZS5sb2coJ3Byb2ZpbGUtcmlnaHQtd3JhcHBlciByaWdodCBsb2FkZWQhJyk7XG5cbiAgICBsZXQgYXJyID0gQXJyYXkuZnJvbShcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShgcHJvZmlsZS1yaWdodC13cmFwcGVyIHJpZ2h0YClcbiAgICApWzBdLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoYGVtcHR5LWJsb2NrYClbMF07XG5cbiAgICBpZiAoIXNweUluZm8pIHtcbiAgICAgICAgYXJyLmlubmVySFRNTCArPSBgXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxoMyBjbGFzcyA9IFwiaGVkXCI+VXNlciBub3Qgc3BpZWQ8L2gzPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICBgO1xuICAgIH0gZWxzZSBpZiAoc3B5SW5mby5zcHkuc3RhdEludGVydmFsLmJhdHRsZVNjb3JlID4gMCkge1xuICAgICAgICBhcnIuaW5uZXJIVE1MICs9IGBcbiAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3M9XCJjdXN0b21UYWJsZVwiPlxuICAgICAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoPkJhdHRsZSBzY29yZTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGg+TWluIHN0YXQgcmFuZ2U8L3RoPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoPk1heCBzdGF0IHJhbmdlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5EYXRlIHNwaWVkPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgPC90aGRlYWQ+XG4gICAgICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQ+JHtzaG9ydGVuTnVtYmVyKHNweUluZm8uc3B5LnN0YXRJbnRlcnZhbC5iYXR0bGVTY29yZSl9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD4ke3Nob3J0ZW5OdW1iZXIoc3B5SW5mby5zcHkuc3RhdEludGVydmFsLm1pbil9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD4ke3Nob3J0ZW5OdW1iZXIoc3B5SW5mby5zcHkuc3RhdEludGVydmFsLm1heCl9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD4ke1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKHNweUluZm8uc3B5LnN0YXRJbnRlcnZhbC5sYXN0VXBkYXRlZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRvTG9jYWxlU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNwbGl0KCcsJylbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgIH08L3RkPlxuICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICBgO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGFyci5pbm5lckhUTUwgKz0gYFxuICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwiY3VzdG9tVGFibGVcIj5cbiAgICAgICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5TdGF0IGVzdGltYXRlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5EYXRlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgPC90aGRlYWQ+XG4gICAgICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQ+JHtzaG9ydGVuTnVtYmVyKHNweUluZm8uc3B5LmVzdGltYXRlLnN0YXRzKX08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkPiR7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUoc3B5SW5mby5zcHkuZXN0aW1hdGUubGFzdFVwZGF0ZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50b0xvY2FsZVN0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zcGxpdCgnLCcpWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICB9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICBgO1xuICAgIH1cbn0pKCk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=