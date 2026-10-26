import prisma from "../../../configs/prisma.js";
import { SignupRequestDto } from "../dtos/requests/signup.dto.js";
import { SigninRequestDto } from "../dtos/requests/signin.dto.js";
import { UserResponseDto } from "../dtos/responses/userResponse.dto.js";
import {
  hashPassword,
  comparePassword,
} from "../../../utils/password.utils.js";
import { generateAccessToken } from "../../../utils/jwt.utils.js";
import { ConflictError, UnauthorizedError } from "../../../utils/errors.js";
import { User, UserRole } from "@prisma/client";

const mapUserResponse = (user: User): UserResponseDto => {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
};

export const registerUser = async (
  dto: SignupRequestDto,
): Promise<{ user: UserResponseDto; token: string }> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (existingUser) {
    throw new ConflictError("Email is already registered");
  }

  const passwordHash = await hashPassword(dto.password);

  try {
    const newUser = await prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: UserRole.USER,
      },
    });

    const token = generateAccessToken({
      id: newUser.id,
      role: newUser.role,
    });

    return {
      user: mapUserResponse(newUser),
      token,
    };
  } catch (error: any) {
    if (error && error.code === "P2002") {
      throw new ConflictError("Email is already registered");
    }
    throw error;
  }
};

export const signinUser = async (
  dto: SigninRequestDto,
): Promise<{ user: UserResponseDto; token: string }> => {
  const user = await prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isPasswordValid = await comparePassword(
    dto.password,
    user.passwordHash,
  );
  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const token = generateAccessToken({
    id: user.id,
    role: user.role,
  });

  return {
    user: mapUserResponse(user),
    token,
  };
};

export const getCurrentUser = async (
  userId: number,
): Promise<UserResponseDto> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new UnauthorizedError("User account no longer exists");
  }

  return mapUserResponse(user);
};
