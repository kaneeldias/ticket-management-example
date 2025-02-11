export type Log = {
    requestUUID: string;
    timestamp: string;
    logType: string;
};

export type RequestLog = Log & {
    ipAddress: string | undefined;
    method: string;
    url: string;
    body: any;
};

export type ResponseLog = Log & {
    duration: string;
    statusCode: number;
    body: any;
};

export type ErrorLog = Log & {
    error: any;
    stack: string | undefined;
};

export type InfoLog = Log & {
    message: string;
};
