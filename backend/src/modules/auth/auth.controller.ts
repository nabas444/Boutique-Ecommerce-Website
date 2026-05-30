import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { registerSchema, loginSchema, refreshSchema } from './auth.schema';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { body } = registerSchema.parse({ body: req.body });
    const result = await authService.register(body);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { body } = loginSchema.parse({ body: req.body });
    const result = await authService.login(body);

    // Store refresh token in httpOnly cookie as well
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const rawToken =
      req.cookies.refreshToken ||
      refreshSchema.parse({ body: req.body }).body.refreshToken;

    const tokens = await authService.refreshTokens(rawToken);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, data: tokens });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const rawToken = req.cookies.refreshToken || req.body.refreshToken;
    await authService.logout(req.user!.userId, rawToken);

    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: req.user });
  } catch (err) {
    next(err);
  }
}
