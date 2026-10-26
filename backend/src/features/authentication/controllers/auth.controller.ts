import { Request, Response, NextFunction } from "express";
import {
  registerUser,
  signinUser,
  getCurrentUser,
} from "../services/auth.service.js";
import { setAuthCookie, clearAuthCookie } from "../../../utils/cookie.utils.js";
import { UnauthorizedError } from "../../../utils/errors.js";
import { AuthResponseDto } from "../dtos/responses/authResponse.dto.js";
import { UserResponseDto } from "../dtos/responses/userResponse.dto.js";

/**
 * POST /api/auth/signup
 */
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user, token } = await registerUser(req.body);
    setAuthCookie(res, token);

    const response: AuthResponseDto = {
      user,
      message: "Account registered successfully",
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/signin
 */
export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user, token } = await signinUser(req.body);
    setAuthCookie(res, token);

    const response: AuthResponseDto = {
      user,
      message: "Signed in successfully",
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/signout
 */
export const signout = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    clearAuthCookie(res);
    res.status(200).json({ message: "Signed out successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
export const me = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user?.id) {
      throw new UnauthorizedError("Unauthorized");
    }

    const user: UserResponseDto = await getCurrentUser(req.user.id);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
