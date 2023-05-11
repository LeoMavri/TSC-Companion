declare let key: string;
interface Spy {
    success: boolean;
    message: string;
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
declare function getSpy(key: string, id: string): Promise<any>;
