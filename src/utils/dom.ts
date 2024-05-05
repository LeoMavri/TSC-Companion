export function waitForElement<T extends HTMLElement>(
  querySelector: string,
  timeout?: number
): Promise<T | null> {
  return new Promise((resolve, _reject) => {
    let timer: number;
    if (document.querySelectorAll(querySelector).length) {
      return resolve(document.querySelector<T>(querySelector));
    }
    const observer = new MutationObserver(() => {
      if (document.querySelectorAll(querySelector).length) {
        observer.disconnect();
        if (timer != null) {
          clearTimeout(timer);
        }
        return resolve(document.querySelector<T>(querySelector));
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    if (timeout) {
      timer = setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    }
  });
}

const MY_PROFILE_BUTTON = '.settings-menu > .link > a:first-child';

export async function getLocalUserId(): Promise<string> {
  const name = await waitForElement<HTMLAnchorElement>(MY_PROFILE_BUTTON, 15_000);

  if (name === null) {
    return '';
  }

  return name.href.match(/XID=(\d+)/)?.[1] ?? '';
}
