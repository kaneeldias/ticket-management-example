/**
 * Error thrown when the user is not authenticated or they are not authorized to access a resource.
 *
 * @class AuthenticationError
 * @extends {Error}
 */
export class AuthenticationError extends Error {
    /**
     * Creates an instance of AuthenticationError.
     **/
    constructor() {
        super("Access denied");
    }
}
