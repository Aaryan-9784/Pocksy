/**
 * Goal Controller
 * Savings pots, progress tracking, and goal allocations
 */

import { Request, Response, NextFunction } from 'express';
import { Goal } from '../models/Goal';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

/**
 * GET /api/goals
 * Get all goals with summary stats
 */
export async function getGoals(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    const goals = await Goal.find({ userId }).sort({ status: 1, createdAt: -1 });

    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

    ApiResponse.success(res, 'Goals retrieved', {
      goals,
      totalTarget,
      totalSaved,
      overallProgress: totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/goals
 * Create a new goal
 */
export async function createGoal(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    const { title, targetAmount, currentAmount = 0, targetDate, category, color, icon } = req.body;

    if (!title || !targetAmount) {
      throw ApiError.badRequest('Title and target amount are required');
    }

    const goal = await Goal.create({
      userId,
      title: title.trim(),
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      category: category || 'savings',
      color: color || '#16A34A',
      icon: icon || 'trophy-outline',
      status: Number(currentAmount) >= Number(targetAmount) ? 'completed' : 'in_progress',
    });

    ApiResponse.created(res, 'Goal created successfully', goal);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/goals/:id/deposit
 * Add or withdraw funds from a goal
 */
export async function depositToGoal(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    const { id } = req.params;
    const { amount } = req.body;

    const depositAmount = Number(amount);
    if (!depositAmount || isNaN(depositAmount)) {
      throw ApiError.badRequest('A valid deposit amount is required');
    }

    const goal = await Goal.findOne({ _id: id, userId });
    if (!goal) {
      throw ApiError.notFound('Goal not found');
    }

    goal.currentAmount = Math.max(0, goal.currentAmount + depositAmount);
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed';
    } else {
      goal.status = 'in_progress';
    }

    await goal.save();

    ApiResponse.success(res, 'Goal updated successfully', goal);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/goals/:id
 * Update goal
 */
export async function updateGoal(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!goal) {
      throw ApiError.notFound('Goal not found');
    }

    ApiResponse.success(res, 'Goal updated', goal);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/goals/:id
 * Delete goal
 */
export async function deleteGoal(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const goal = await Goal.findOneAndDelete({ _id: id, userId });
    if (!goal) {
      throw ApiError.notFound('Goal not found');
    }

    ApiResponse.success(res, 'Goal deleted successfully');
  } catch (error) {
    next(error);
  }
}
