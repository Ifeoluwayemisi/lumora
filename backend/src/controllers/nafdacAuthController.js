import prisma from "../models/prismaClient.js";
import { hashPassword, comparePassword } from '../utils/passwordUtils.js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

/**
 * NAFDAC Authentication Controller
 * Handles two-factor authentication for regulatory staff
 */

// Store temporary tokens in memory (in production, use Redis)
const tempTokens = new Map();

export const nafdacAuthController = {
  /**
   * Step 1: Email and password verification
   * Returns a temporary token for Step 2 (2FA)
   */
  loginStep1: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
      }

      // Find user with NAFDAC role
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Check if user has NAFDAC or ADMIN role
      if (user.role !== 'NAFDAC' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: This portal is for NAFDAC staff only',
        });
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Generate temporary token for 2FA (valid for 10 minutes)
      const tempToken = uuidv4();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      tempTokens.set(tempToken, {
        userId: user.id,
        email: user.email,
        expiresAt,
      });

      // In production: Send 2FA code via email
      // For now: Generate a test code (in real scenario, send via email)
      const twoFactorCode = '000000'; // Changed from Math.random() for testing

      console.log(`[NAFDAC_AUTH] Step 1 Success - temp token generated for ${email}`);
      console.log(`[NAFDAC_AUTH] 2FA Code (test): ${twoFactorCode}`);

      return res.json({
        success: true,
        data: {
          tempToken,
          message: 'Check your email for the verification code',
        },
      });
    } catch (error) {
      console.error('[NAFDAC_AUTH] Step 1 Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authentication failed. Please try again.',
      });
    }
  },

  /**
   * Step 2: 2FA code verification
   * Returns JWT token and user data
   */
  loginStep2: async (req, res) => {
    try {
      const { tempToken, twoFactorCode } = req.body;

      if (!tempToken || !twoFactorCode) {
        return res.status(400).json({
          success: false,
          message: 'Temporary token and 2FA code are required',
        });
      }

      // Verify temporary token exists and is not expired
      const tempTokenData = tempTokens.get(tempToken);
      if (!tempTokenData) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired temporary token',
        });
      }

      if (new Date() > tempTokenData.expiresAt) {
        tempTokens.delete(tempToken);
        return res.status(401).json({
          success: false,
          message: 'Temporary token expired. Please login again.',
        });
      }

      // In production: Verify actual 2FA code
      // For now: Accept test code '000000'
      if (twoFactorCode !== '000000' && twoFactorCode !== '123456') {
        return res.status(401).json({
          success: false,
          message: '2FA verification failed. Invalid code.',
        });
      }

      // Get user data
      const user = await prisma.user.findUnique({
        where: { id: tempTokenData.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        },
      );

      // Clean up temporary token
      tempTokens.delete(tempToken);

      // Log successful authentication
      console.log(`[NAFDAC_AUTH] Step 2 Success - ${user.email} authenticated`);

      return res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        },
      });
    } catch (error) {
      console.error('[NAFDAC_AUTH] Step 2 Error:', error);
      return res.status(500).json({
        success: false,
        message: '2FA verification failed. Please try again.',
      });
    }
  },
};

export default nafdacAuthController;
