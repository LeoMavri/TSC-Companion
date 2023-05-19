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

enum ErrorCode {
    InvalidRequest = 1,
    Maintenance = 2,
    InvalidApiKey = 3,
    InternalError = 4,
    ServiceDown = 5,
}

interface Spy {
    success: boolean;
    message: string;
    code?: ErrorCode;
    serviceDown?: boolean;
    spy: {
        userId: number;
        userName: string;
        estimate: {
            stats: number;
            lastUpdated: Date;
        };
        statInterval: {
            min: number;
            max: number;
            battleScore: number;
            lastUpdated: Date;
        };
    };
}

function shortenNumber(number: number): string {
    let prefix = '';
    if (number < 0) prefix = '-';

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
    return (
        prefix +
        (num / si[index].v).toFixed(2).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') +
        si[index].s
    );
}

async function getSpy(key: string, id: string, debug: boolean): Promise<any> {
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
            onload: function (response: Tampermonkey.Response<any>) {
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
        res ??= `{
            "success": false,
            "code": 5
        }`;

        return res;
    } catch (err) {
        // This is also horrible
        return `{
            "success": false,
            "code": 5
        }`;
    }
}

async function waitForElement(querySelector: string, timeout?: number): Promise<void> {
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
    const debug = true;
    let key: string = await GM.getValue('tsc_api_key', '');
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
    const spyInfo: Spy = JSON.parse(await getSpy(key, userId, debug));

    await waitForElement(
        '#profileroot > div > div > div > div:nth-child(1) > div.profile-right-wrapper.right > div.profile-buttons.profile-action > div > div.cont.bottom-round > div > div > div.empty-block',
        10_000
    );

    const arr = Array.from(
        document.getElementsByClassName(`profile-right-wrapper right`)
    )[0].getElementsByClassName(`empty-block`)[0];

    let text: string;
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
            key = prompt(
                `The API key you have entered does not match the one used in Torn Stats Central, please try again. If you believe this is an error, please contact Mavri.`
            );
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
                            <td>${
                                new Date(spyInfo.spy.statInterval.lastUpdated)
                                    .toLocaleString()
                                    .split(',')[0]
                            }</td>
                        </tr>
                    </tbody>
                </table>
                </div>
                `;
    } else {
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
                            <td>${
                                new Date(spyInfo.spy.estimate.lastUpdated)
                                    .toLocaleString()
                                    .split(',')[0]
                            }</td>
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
