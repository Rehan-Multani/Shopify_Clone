import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ok, created } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from '../utils/token.js';

const issueTokens = async (user) => {
  const payload = { sub: user._id.toString(), role: user.role, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  await User.findByIdAndUpdate(user._id, {
    $push: { refreshTokens: refreshToken },
    lastLoginAt: new Date(),
  });
  return { accessToken, refreshToken };
};

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) throw ApiError.badRequest('Name, email and password are required');

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw ApiError.conflict('Email already in use');

  const user = await User.create({
    name,
    email,
    password,
    role: role === 'master_admin' ? 'merchant' : role || 'merchant',
  });

  const tokens = await issueTokens(user);
  setAuthCookies(res, tokens);

  res.status(201).json(created({ user, ...tokens }, 'Account created'));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw ApiError.badRequest('Email and password are required');

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid credentials');
  }
  if (!user.isActive) throw ApiError.forbidden('Account disabled');

  const tokens = await issueTokens(user);
  setAuthCookies(res, tokens);

  res.json(ok({ user, ...tokens }, 'Logged in'));
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (token && req.user) {
    await User.findByIdAndUpdate(req.user._id, { $pull: { refreshTokens: token } });
  }
  clearAuthCookies(res);
  res.json(ok(null, 'Logged out'));
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) throw ApiError.unauthorized('Refresh token missing');

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const user = await User.findById(decoded.sub).select('+refreshTokens');
  if (!user || !user.refreshTokens.includes(token)) {
    throw ApiError.unauthorized('Refresh token revoked');
  }

  await User.findByIdAndUpdate(user._id, { $pull: { refreshTokens: token } });
  const tokens = await issueTokens(user);
  setAuthCookies(res, tokens);
  res.json(ok(tokens, 'Refreshed'));
});

export const me = asyncHandler(async (req, res) => {
  res.json(ok(req.user));
});
