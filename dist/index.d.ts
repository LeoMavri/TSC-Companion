declare const DEBUG = false;
declare const TSC_API = "https://tsc.diicot.cc/stats/update";
declare const DEBUG_API = "http://localhost:25565/stats/update";
declare const AUTHORIZATION = "10000000-6000-0000-0009-000000000001";
declare const API_KEY_ENTRY = "tsc_api_key";
declare enum ErrorCode {
    InvalidRequest = 1,
    Maintenance = 2,
    InvalidApiKey = 3,
    InternalError = 4,
    UserDisabled = 5,
    CachedOnly = 6,
    ServiceDown = 999
}
type SpyErrorable = {
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
} | {
    success: false;
    code: ErrorCode;
};
declare function shortenNumber(number: number): string;
declare function getSpy(key: string, id: string, debug: boolean): Promise<SpyErrorable>;
declare function waitForElement(querySelector: string, timeout?: number): Promise<void>;
