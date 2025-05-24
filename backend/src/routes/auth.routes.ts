import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { body } from 'express-validator';
import { validationMiddleware } from '../middleware/validation.middleware';

const router = Router();

// Register
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validationMiddleware
], authController.register);

// Login
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validationMiddleware
], authController.login);

// Logout
router.post('/logout', authMiddleware, authController.logout);

// Update profile
router.patch('/profile', authMiddleware, [
  body('username').optional().isLength({ min: 3 }),
  body('email').optional().isEmail(),
  validationMiddleware
], authController.updateProfile);

export default router;