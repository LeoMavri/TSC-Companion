import Settings from "./local-storage.js";
import Logger from "./logger.js";

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
          min: string;
          max: string;
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

type Errorable<T> = T | { error: boolean; message: string };

export type UserBasic = {
  level: number;
  gender: "Enby" | "Female" | "Male";
  player_id: number;
  name: string;
  status: {
    color: "blue" | "green" | "red";
    description: string;
    details: string;
    state:
      | "Hospital"
      | "Okay"
      | "Jail"
      | "Traveling"
      | "Abroad"
      | "Federal"
      | "Fallen";
    // Epoch TS (in seconds)
    until: number;
  };
};

const CACHE_TIME = 12 * 60 * 60 * 1000; // 12 hours

export function getTSCSpyOld(userId: string): Promise<SpyErrorable> {
  const spy = Settings.getJSON<SpyErrorable & { insertedAt: Date }>(
    `spy-${userId}`
  );

  if (spy) {
    if (
      spy.insertedAt &&
      new Date().getTime() - new Date(spy.insertedAt).getTime() < CACHE_TIME
    ) {
      Logger.debug("Spy cache still valid");
      return Promise.resolve(spy);
    } else {
      Logger.debug("Spy cache expired, fetching new data");
      Settings.setJSON(`spy-${userId}`, null);
    }
  }

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
        apiKey: Settings.get("api-key") ?? "",
        userId: userId,
      }),
      onload(response: Tampermonkey.Response<any>) {
        const test = JSON.parse(response.responseText);
        console.log(test);

        if (!("error" in test) && test.success) {
          Settings.setJSON(`spy-${userId}`, {
            ...test,
            insertedAt: new Date().getTime(),
          });
        }

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

export async function getLocalUserData(): Promise<Errorable<UserBasic>> {
  if (Settings.get("api-key") === null) {
    return {
      error: true,
      message: "API Key not set",
    };
  }
  const userData = Settings.getJSON<UserBasic & { insertedAt: Date }>(
    "user-data"
  );

  if (userData) {
    if (
      userData.insertedAt &&
      new Date().getTime() - new Date(userData.insertedAt).getTime() <
        CACHE_TIME
    ) {
      Logger.debug("User cache still valid");
      return userData;
    } else {
      Logger.debug("User cache expired, fetching new data");
      Settings.setJSON("user-data", null);
    }
  }

  const res = await fetch(
    `https://api.torn.com/user/?selections=basic&key=${Settings.get(
      "api-key"
    )}&comment=TSC-Next`
  );

  if (!res.ok) {
    return {
      error: true,
      message: res.statusText,
    };
  }

  const data = await res.json();

  if (data.error) {
    return {
      error: true,
      message: data.error.error,
    };
  }

  Settings.setJSON("user-data", {
    ...data,
    insertedAt: new Date().getTime(),
  });

  return data;
}

export function getYATASpy(_userId: string) {
  // todo
  throw new Error("Not implemented");
}

export function getTornStatsSpy(_userId: string) {
  // todo
  throw new Error("Not implemented");
}
