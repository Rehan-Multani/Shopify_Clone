import { verifyAccessToken } from '../utils/token.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/User.js';

const extractToken = (req) => {
  if (req.cookies?.accessToken) return req.cookies.accessToken;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
};

export const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized('Authentication required');

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await User.findById(decoded.sub);
  if (!user || !user.isActive) throw ApiError.unauthorized('User no longer exists');

  req.user = user;
  next();
});

export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub);
    if (user?.isActive) req.user = user;
  } catch {
    /* ignore */
  }
  next();
});

export const requireRole = (...roles) =>
  (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden('Insufficient permissions'));
    next();
  };
