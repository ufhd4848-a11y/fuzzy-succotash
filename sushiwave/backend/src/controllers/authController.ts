import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { IAuthRequest, AppError } from '../types';
import prisma from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateTokens,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  isRefreshTokenValid,
} from '../utils/jwt';
import config from '../config';
import logger from '../config/logger';

/**
 * Register a new user
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(409, 'User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        address: address || null,
        role: UserRole.USER,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        role: true,
      },
    });

    // Generate tokens
    const tokens = await generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      domain: config.COOKIE_DOMAIN,
    };

    res.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    logger.info({ message: 'User registered', userId: user.id, email: user.email });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Generate tokens
    const tokens = await generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      domain: config.COOKIE_DOMAIN,
    };

    res.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    logger.info({ message: 'User logged in', userId: user.id, email: user.email });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address,
          role: user.role,
        },
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      throw new AppError(401, 'Refresh token is required');
    }

    // Check if token is valid in database
    const isValid = await isRefreshTokenValid(token);

    if (!isValid) {
      throw new AppError(401, 'Invalid or expired refresh token');
    }

    // Verify token
    const decoded = verifyRefreshToken(token);

    // Revoke old token
    await revokeRefreshToken(token);

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        role: true,
      },
    });

    if (!user) {
      throw new AppError(401, 'User no longer exists');
    }

    // Generate new tokens
    const tokens = await generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      domain: config.COOKIE_DOMAIN,
    };

    res.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { tokens },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 */
export const logout = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (token) {
      await revokeRefreshToken(token);
    }

    // Clear cookies
    res.clearCookie('accessToken', { domain: config.COOKIE_DOMAIN });
    res.clearCookie('refreshToken', { domain: config.COOKIE_DOMAIN });

    if (req.user) {
      logger.info({ message: 'User logged out', userId: req.user.id });
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout from all devices
 */
export const logoutAll = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    // Revoke all user tokens
    await revokeAllUserTokens(req.user.id);

    // Clear cookies
    res.clearCookie('accessToken', { domain: config.COOKIE_DOMAIN });
    res.clearCookie('refreshToken', { domain: config.COOKIE_DOMAIN });

    logger.info({ message: 'User logged out from all devices', userId: req.user.id });

    res.json({
      success: true,
      message: 'Logged out from all devices successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 */
export const getMe = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    res.json({
      success: true,
      data: { user: req.user },
    });
  } catch (error) {
    next(error);
  }
};