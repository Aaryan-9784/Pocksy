/**
 * Auth Controller
 * Handles registration, login, and current user retrieval
 */

import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { generateToken } from '../middleware/auth';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

/**
 * POST /api/auth/register
 * Create a new user account
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw ApiError.conflict('An account with this email already exists');
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    // Generate token
    const token = generateToken(user._id.toString());

    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      monthlyBudget: user.monthlyBudget,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    ApiResponse.created(res, 'Account created successfully', {
      user: userResponse,
      token,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Authenticate user and return token
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;

    // Find user with password field included
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      monthlyBudget: user.monthlyBudget,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    ApiResponse.success(res, 'Login successful', {
      user: userResponse,
      token,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;

    ApiResponse.success(res, 'User retrieved', {
      _id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      monthlyBudget: user.monthlyBudget,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/auth/profile
 * Update user preferences (name, currency, monthlyBudget)
 */
export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, currency, monthlyBudget } = req.body;

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (currency !== undefined) updateData.currency = currency;
    if (monthlyBudget !== undefined) updateData.monthlyBudget = Number(monthlyBudget);

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    ApiResponse.success(res, 'Profile updated successfully', {
      _id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      monthlyBudget: user.monthlyBudget,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/forgot-password
 * Handle password recovery requests
 */
export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      throw ApiError.badRequest('Email is required');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    // Don't reveal if user exists for security, return success response
    ApiResponse.success(res, 'If an account exists with this email, a reset link has been dispatched');
  } catch (error) {
    next(error);
  }
}

