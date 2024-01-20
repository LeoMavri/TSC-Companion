// You don't really want to mess with anything here :p
// Do you have any suggestions? Feel free to contact either of us on Torn (mavri [2402357] / mitza[2549762]) or on Discord (@mavri.dev).
// If you're wondering why this looks so weird, it's becaused this is written in TypeScript, transpiled to JavaScript and then packed from 5 files into one with Vite.
import './style.css';
import { ErrorCode, SpyErrorable } from './utils/interfaces.js';
import { createErrorHeader, shortenNumber, waitForElement } from './utils/utils.js';

const DEBUG = false;

const TSC_API = 'https://tsc.diicot.cc/stats/update';
const DEBUG_API = 'http://localhost:25565/stats/update';
const AUTHORIZATION = '10000000-6000-0000-0009-000000000001';

const API_KEY_ENTRY = 'tsc_api_key';
const PROFILE_ELEMENT = `#profileroot > div > div > div > div:nth-child(1) > div.profile-right-wrapper.right > div.profile-buttons.profile-action > div > div.cont.bottom-round > div > div > div.empty-block`;

const KNWON_ISSUES = ['99177'];

async function getSpy(key: string, id: string): Promise<SpyErrorable> {
    return await new Promise<SpyErrorable>((resolve, reject) => {
        const request = GM.xmlHttpRequest ?? (GM as any).xmlhttpRequest;
        request({
            method: 'POST',
            url: DEBUG ? DEBUG_API : TSC_API,
            headers: {
                authorization: AUTHORIZATION,
                'x-requested-with': 'XMLHttpRequest',
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({
                apiKey: key,
                userId: id,
            }),
            onload(response: Tampermonkey.Response<any>) {
                const test = JSON.parse(response.responseText);
                console.log(test);
                resolve(test);
            },
            onerror() {
                reject({
                    success: false,
                    code: ErrorCode.ServiceDown,
                });
            },
            timeout: 5_000,
        });
    });
}

(async function () {
    let key: string | null = await GM.getValue(API_KEY_ENTRY, null);
    if (key === '' || key == null) {
        key = prompt(`Please fill in your API key with the one used in Torn Stats Central.`);
        await GM.setValue(API_KEY_ENTRY, key);
        return;
    }

    const keyRegex = new RegExp(/^[a-zA-Z0-9]{16}$/);
    if (keyRegex.test(key) === false || typeof key !== 'string') {
        key = prompt(
            `The API key you have entered is invalid, please try again and refresh the page.`
        );
        await GM.setValue(API_KEY_ENTRY, key);
        return;
    }

    const userIdRegex = new RegExp(/XID=(\d+)/);
    const userId = window.location.href.match(userIdRegex)![1];

    if (KNWON_ISSUES.includes(userId)) {
        console.warn(`This user is known to cause issues with TSC's algorithms. Sorry :()`);
        return;
    }

    const [_, spyInfo] = await Promise.all([
        waitForElement(PROFILE_ELEMENT, 10_000),
        getSpy(key, userId),
    ]);

    const profile = Array.from(
        document.getElementsByClassName(`profile-right-wrapper right`)
    )[0].getElementsByClassName(`empty-block`)[0];

    console.log(spyInfo);

    if ('error' in spyInfo) {
        if (KNWON_ISSUES.includes(userId)) {
            profile.innerHTML += createErrorHeader(`This is a known issue. Sorry :(`);
            console.warn(spyInfo);
            return;
        }
        profile.innerHTML += createErrorHeader(`Unexpected Response`);
        console.warn(`The API encountered an error before it could finish your request`);
        console.warn(spyInfo);
        return;
    }

    let text: string;
    if (spyInfo.success === false) {
        let requestNewKey = false;
        switch (spyInfo.code) {
            case ErrorCode.Maintenance:
                text = createErrorHeader(`TSC is undergoing maintenance.`);
                break;

            case ErrorCode.InvalidApiKey:
                text = createErrorHeader(`Invalid API key.`);
                requestNewKey = true;
                break;

            case ErrorCode.InternalError:
                text = createErrorHeader(`Torn API Down`);
                break;

            case ErrorCode.InvalidRequest:
                text = createErrorHeader(`Invalid request.`);
                break;

            case ErrorCode.ServiceDown:
                text = createErrorHeader(
                    `TSC is down. Check Discord`,
                    `https://discord.gg/eegQhTUqPS`
                );
                break;

            case ErrorCode.UserDisabled:
                text = createErrorHeader(
                    `Account disabled. Check Discord`,
                    `https://discord.gg/eegQhTUqPS`
                );
                break;

            case ErrorCode.CachedOnly:
                text = createErrorHeader(`User not found in cache.`);
                break;

            default:
                text = createErrorHeader(`Unknown error.`);
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

    if (spyInfo?.spy?.statInterval?.battleScore) {
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
