const DEBUG = false;

const TSC_API = 'https://tsc.diicot.cc/stats/update';
const DEBUG_API = 'http://localhost:25565/stats/update';
const AUTHORIZATION = '10000000-6000-0000-0009-000000000001';

const API_KEY_ENTRY = 'tsc_api_key';

enum ErrorCode {
    InvalidRequest = 1,
    Maintenance = 2,
    InvalidApiKey = 3,
    InternalError = 4,
    UserDisabled = 5,
    CachedOnly = 6,
    ServiceDown = 999,
}

type SpyErrorable =
    | {
          success: true;
          spy: {
              userId: number;
              userName: string;
              estimate: {
                  stats: number;
                  lastUpdated: Date;
              };
              statInterval?: {
                  min: number;
                  max: number;
                  battleScore: number;
                  lastUpdated: Date;
              };
          };
      }
    | {
          success: false;
          code: ErrorCode;
      };

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

async function getSpy(key: string, id: string): Promise<SpyErrorable> {
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
            onload: function (response: Tampermonkey.Response<any>) {
                res = JSON.parse(response.responseText);
            },
            onerror: function () {
                res = {
                    success: false,
                    code: ErrorCode.ServiceDown,
                };
            },
        });
    } catch (err) {
        res = {
            success: false,
            code: ErrorCode.ServiceDown,
        };
    } finally {
        res ??= {
            success: false,
            code: ErrorCode.ServiceDown,
        };
    }
    return res;
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
    let key: string = await GM.getValue(API_KEY_ENTRY, '');
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

    await waitForElement(
        '#profileroot > div > div > div > div:nth-child(1) > div.profile-right-wrapper.right > div.profile-buttons.profile-action > div > div.cont.bottom-round > div > div > div.empty-block',
        10_000
    );

    const profile = Array.from(
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
            key = prompt(
                `The API key you have entered does not match the one used in Torn Stats Central, please try again. If you believe this is an error, please contact Mavri.`
            );
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
