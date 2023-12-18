export function shortenNumber(number: number): string {
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

export async function waitForElement(querySelector: string, timeout?: number): Promise<void> {
    return await new Promise((resolve, reject) => {
        let timer: NodeJS.Timeout;
        if (document.querySelectorAll(querySelector).length) {
            return resolve();
        }
        const observer = new MutationObserver(() => {
            if (document.querySelectorAll(querySelector).length) {
                observer.disconnect();
                if (timer != null) {
                    clearTimeout(timer);
                }
                return resolve();
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
        if (timeout) {
            timer = setTimeout(() => {
                observer.disconnect();
                reject();
            }, timeout);
        }
    });
}

export function createErrorHeader(text: string, url?: string): string {
    if (!url) {
        return `
        <div>
            <h3 class = "hed">${text}</h3>
        </div>
        `;
    }
    return `
    <div>
        <h3 class = "hed"><a href="${url}" style="color: #3777FF;">${text}</a></h3>
    </div>
    `;
}
