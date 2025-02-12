/**
 * This file contains all the types related to authentication and authorization.
 */

/**
 * The request body to make a login request
 *
 * @property email - The email of the user
 * @property password - The password of the user
 */
export type LoginRequest = {
    email: string;
    password: string;
};

/**
 * The response body of a successful login request
 *
 * @property token - The JWT token to be used for authentication
 */
export type AuthenticatedResponse = {
    token: string;
};

/**
 * The decoded JWT token
 *
 * @property id - The id of the user
 * @property email - The email of the user
 */
export type JWTDecoded = {
    id: number;
    email: string;
};
