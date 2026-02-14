import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import { ITokenPayload, IRefreshTokenPayload, ITokens } from '../types';
import prisma from '../config/prisma';

/**
 * Generate access token
 */
export const generateAccessToken = (payload: ITokenPayload): string => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

/**
 * Generate refresh token and save to database
 */
export const generateRefreshToken = async (userId: string): Promise<string> => {
  const tokenId = uuidv4();
  
  const payload: IRefreshTokenPayload = {
    userId,
    tokenId,
  };

  const token = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  });

  // Calculate expiration date
  const expiresInDays = parseInt(config.JWT_REFRESH_EXPIRES_IN, 10) || 7;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  // Save refresh token to database
  await prisma.refreshToken.create({
    data: {
      id: tokenId,
      token,
      userId,
      expiresAt,
    },
  });

  return token;
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokens = async (payload: ITokenPayload): Promise<ITokens> => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = await generateRefreshToken(payload.userId);

  return {
    accessToken,
    refreshToken,
  };
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): ITokenPayload => {
  return jwt.verify(token, config.JWT_SECRET) as ITokenPayload;
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): IRefreshTokenPayload => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as IRefreshTokenPayload;
};

/**
 * Revoke refresh token
 */
export const revokeRefreshToken = async (token: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: { token },
  });
};

/**
 * Revoke all user refresh tokens
 */
export const revokeAllUserTokens = async (userId: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
};

/**
 * Check if refresh token exists in database
 */
export const isRefreshTokenValid = async (token: string): Promise<boolean> => {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!storedToken) {
    return false;
  }

  // Check if token is expired
  if (new Date() > storedToken.expiresAt) {
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });
    return false;
  }

  return true;
};

/**
 * Clean up expired refresh tokens
 */
export const cleanupExpiredTokens = async (): Promise<number> => {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return result.count;
};