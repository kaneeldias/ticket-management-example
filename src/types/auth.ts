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

export type AuthenticatedResponse = {
    token: string;
};
