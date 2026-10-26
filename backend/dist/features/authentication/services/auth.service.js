import prisma from "../../../configs/prisma.js";
import { hashPassword, comparePassword, } from "../../../utils/password.utils.js";
import { generateAccessToken } from "../../../utils/jwt.utils.js";
import { ConflictError, UnauthorizedError } from "../../../utils/errors.js";
import { UserRole } from "@prisma/client";
const mapUserResponse = (user) => {
    return {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    };
};
export const registerUser = async (dto) => {
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
    }
    catch (error) {
        if (error && error.code === "P2002") {
            throw new ConflictError("Email is already registered");
        }
        throw error;
    }
};
export const signinUser = async (dto) => {
    const user = await prisma.user.findUnique({
        where: { email: dto.email },
    });
    if (!user) {
        throw new UnauthorizedError("Invalid email or password");
    }
    const isPasswordValid = await comparePassword(dto.password, user.passwordHash);
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
export const getCurrentUser = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new UnauthorizedError("User account no longer exists");
    }
    return mapUserResponse(user);
};
