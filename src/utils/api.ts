// export function checkApiKey(key: string): Promise<unknown> {
//   throw new Error("Not implemented");
// }

// TODO: Absolutely redo these, they're just so I can get the profile page going
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
    }
  | {
      error: boolean;
      message: string;
    };

export function getSpyOld(userId: string, key: string): Promise<SpyErrorable> {
  return new Promise((resolve, reject) => {
    const request = GM.xmlHttpRequest ?? (GM as any).xmlhttpRequest;
    request({
      method: "POST",
      url: `https://tsc.diicot.cc/stats/update`,
      headers: {
        authorization: "10000000-6000-0000-0009-000000000001",
        "x-requested-with": "XMLHttpRequest",
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        apiKey: key,
        userId: userId,
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
