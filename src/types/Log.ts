/**
 * Define the types for the logs
 */

/**
 * Base type for all logs
 *
 * @property requestUUID - The UUID of the request
 * @property timestamp - The timestamp of the log
 * @property logType - The type of the log
 */
export type Log = {
    requestUUID: string;
    timestamp: string;
    logType: string;
};

/**
 * Log for a request
 *
 * @property ipAddress - The IP address of the request
 * @property method - The HTTP method of the request
 * @property url - The URL of the request
 */
export type RequestLog = Log & {
    ipAddress: string | undefined;
    method: string;
    url: string;
    body: any;
};

/**
 * Log for a response
 *
 * @property duration - The duration of the request
 * @property statusCode - The status code of the response
 * @property body - The body of the response
 */
export type ResponseLog = Log & {
    duration: string;
    statusCode: number;
    body: any;
};

/**
 * Log for an error
 *
 * @property error - The error that occurred
 * @property stack - The stack trace of the error
 */
export type ErrorLog = Log & {
    error: any;
    stack: string | undefined;
};

/**
 * Log for an info message
 *
 * @property message - The info message
 */
export type InfoLog = Log & {
    message: string;
};
