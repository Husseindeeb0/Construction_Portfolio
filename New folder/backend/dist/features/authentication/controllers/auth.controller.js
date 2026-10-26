import { registerUser, signinUser, getCurrentUser, } from "../services/auth.service.js";
import { setAuthCookie, clearAuthCookie } from "../../../utils/cookie.utils.js";
import { UnauthorizedError } from "../../../utils/errors.js";
/**
 * POST /api/auth/signup
 */
export const signup = async (req, res, next) => {
    try {
        const { user, token } = await registerUser(req.body);
        setAuthCookie(res, token);
        const response = {
            user,
            message: "Account registered successfully",
        };
        res.status(201).json(response);
    }
    catch (error) {
        next(error);
    }
};
/**
 * POST /api/auth/signin
 */
export const signin = async (req, res, next) => {
    try {
        const { user, token } = await signinUser(req.body);
        setAuthCookie(res, token);
        const response = {
            user,
            message: "Signed in successfully",
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
/**
 * POST /api/auth/signout
 */
export const signout = async (_req, res, next) => {
    try {
        clearAuthCookie(res);
        res.status(200).json({ message: "Signed out successfully" });
    }
    catch (error) {
        next(error);
    }
};
/**
 * GET /api/auth/me
 */
export const me = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            throw new UnauthorizedError("Unauthorized");
        }
        const user = await getCurrentUser(req.user.id);
        res.status(200).json({ user });
    }
    catch (error) {
        next(error);
    }
};
