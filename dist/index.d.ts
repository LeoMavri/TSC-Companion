declare enum ErrorCode {
    InvalidRequest = 1,
    Maintenance = 2,
    InvalidApiKey = 3,
    InternalError = 4,
    ServiceDown = 5
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
declare function shortenNumber(number: number): string;
declare function getSpy(key: string, id: string, debug: boolean): Promise<any>;
declare function waitForElement(querySelector: string, timeout?: number): Promise<void>;
