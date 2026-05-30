import bcrypt from 'bcryptjs';
import { db } from '../../config/database';
import { redis } from '../../config/redis';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../../utils/jwt';
import { AppError } from '../../middleware/error.middleware';
import { RegisterInput, LoginInput } from './auth.schema';

const SALT_ROUNDS = 12;
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

export async function register(input: RegisterInput) {
  const existing = await db.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError('Email already registered', 409, 'EMAIL_TAKEN');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await db.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: 'CUSTOMER',
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  });

  const tokens = await generateTokens(user.id, user.role);

  // Send welcome email (non-blocking)
  import('../../utils/email')
    .then(({ sendWelcomeEmail }) => sendWelcomeEmail(user.email, user.firstName))
    .catch(() => {});

  return { user, ...tokens };
}

export async function login(input: LoginInput) {
  const user = await db.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!user || !user.isActive) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const isMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const tokens = await generateTokens(user.id, user.role);
  const { passwordHash: _, ...safeUser } = user;

  return { user: safeUser, ...tokens };
}

export async function refreshTokens(rawRefreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
  }

  const tokenHash = hashToken(rawRefreshToken);
  const stored = await db.refreshToken.findFirst({
    where: {
      tokenHash,
      userId: payload.userId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!stored) {
    throw new AppError('Refresh token revoked or expired', 401, 'INVALID_TOKEN');
  }

  // Rotate: revoke old, issue new
  await db.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const tokens = await generateTokens(payload.userId, payload.role);
  return tokens;
}

export async function logout(userId: string, rawRefreshToken?: string) {
  if (rawRefreshToken) {
    const tokenHash = hashToken(rawRefreshToken);
    await db.refreshToken.updateMany({
      where: { userId, tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // Revoke all tokens for this user on full logout
  await redis.setex(`blacklist:${userId}`, REFRESH_TOKEN_TTL, '1');
}

async function generateTokens(userId: string, role: string) {
  const accessToken = signAccessToken({ userId, role });
  const refreshToken = signRefreshToken({ userId, role });
  const tokenHash = hashToken(refreshToken);

  await db.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL * 1000),
    },
  });

  return { accessToken, refreshToken };
}
