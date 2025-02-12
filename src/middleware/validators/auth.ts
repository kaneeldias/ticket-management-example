import Joi from "joi";
import { LoginRequest } from "../../types/auth";

const loginRequest = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
});

/**
 * Validates a login request.
 * Throws an error if the request is invalid.
 * Otherwise, returns the validated request.
 *
 * @param login The object to validate
 * @returns {LoginRequest} The validated request
 */
export function validateLoginRequest(login: any): LoginRequest {
    const { error, value } = loginRequest.validate(login);
    if (error) {
        throw error;
    }
    return value;
}
