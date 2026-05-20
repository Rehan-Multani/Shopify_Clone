import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signAccessToken = (payload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtAccessExpiry });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiry });

export const verifyAccessToken = (token) => jwt.verify(token, env.jwtSecret);

export const verifyRefreshToken = (token) => jwt.verify(token, env.jwtRefreshSecret);

export const setAuthCookies = (res, { accessToken, refreshToken }) => {
  const base = {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSecure ? 'none' : 'lax',
  };
  res.cookie('accessToken', accessToken, { ...base, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...base, maxAge: 30 * 24 * 60 * 60 * 1000 });
};

export const clearAuthCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};
