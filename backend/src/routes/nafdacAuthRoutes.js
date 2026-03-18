import express from 'express';
import { nafdacAuthController } from '../controllers/nafdacAuthController.js';

const router = express.Router();

/**
 * NAFDAC Authentication Routes
 * Two-factor authentication flow for regulatory staff
 */

// Step 1: Email and password verification
router.post('/auth/login/step1', nafdacAuthController.loginStep1);

// Step 2: 2FA code verification
router.post('/auth/login/step2', nafdacAuthController.loginStep2);

// Get current user profile (requires auth)
router.get('/auth/profile', async (req, res) => {
  try {
    const { authMiddleware } = await import('../middleware/authMiddleware.js');
    authMiddleware(req, res, () => {
      res.json({
        success: true,
        data: {
          user: req.user
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Logout
router.post('/auth/logout', (req, res) => {
  // Just clear on client side - this is a confirmation endpoint
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
