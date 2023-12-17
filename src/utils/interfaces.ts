export enum ErrorCode {
    InvalidRequest = 1,
    Maintenance = 2,
    InvalidApiKey = 3,
    InternalError = 4,
    UserDisabled = 5,
    CachedOnly = 6,
    ServiceDown = 999,
}

export type SpyErrorable =
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
