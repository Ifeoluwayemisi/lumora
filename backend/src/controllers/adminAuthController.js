import * as adminAuthService from "../services/adminAuthService.js";
import * as auditLogService from "../services/auditLogService.js";
import jwt from "jsonwebtoken";
import { generateQRCodeData } from "../utils/twoFactorAuth.js";

/**
 * Admin Registration (First-time setup by super admin)
 */
export async function registerAdminController(req, res) {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Create admin
    const admin = await adminAuthService.createAdminUser(
      email,
      password,
      firstName,
      lastName,
      role,
    );

    // Generate QR code for 2FA setup
    const qrCodeData = generateQRCodeData(email, admin.twoFactorSecret);

    // Log action
    await auditLogService.logAdminAction(
      admin.id,
      "admin_registered",
      "AdminUser",
      admin.id,
      null,
      { email, firstName, lastName, role },
      "Initial admin registration",
      req.ip,
      req.get("user-agent"),
    );

    return res.status(201).json({
      success: true,
      data: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        message: "Admin registered. Please scan 2FA QR code.",
        qrCodeData,
      },
    });
  } catch (err) {
    console.error("[ADMIN_REGISTER] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to register admin",
    });
  }
}

/**
 * Admin Login Step 1: Email & Password
 */
export async function adminLoginStep1Controller(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password required",
      });
    }

    // Verify credentials
    const admin = await adminAuthService.verifyAdminLogin(email, password);

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Generate temp token for 2FA step
    const tempToken = jwt.sign(
      {
        adminId: admin.id,
        email: admin.email,
        step: "2fa_pending",
      },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }, // Short expiry
    );

    return res.status(200).json({
      success: true,
      data: {
        tempToken,
        message: "Password verified. Please enter 2FA code.",
        adminId: admin.id,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error("[ADMIN_LOGIN_STEP1] Error:", err.message);
    return res.status(401).json({
      success: false,
      error: "Invalid credentials",
    });
  }
}

/**
 * Admin Login Step 2: 2FA Verification
 */
export async function adminLoginStep2Controller(req, res) {
  try {
    const { adminId, twoFactorToken, tempToken } = req.body;

    if (!adminId || !twoFactorToken || !tempToken) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: "2FA session expired. Please login again.",
      });
    }

    if (decoded.adminId !== adminId || decoded.step !== "2fa_pending") {
      return res.status(401).json({
        success: false,
        error: "Invalid 2FA session",
      });
    }

    // Verify 2FA token
    const is2FAValid = await adminAuthService.verify2FAToken(
      adminId,
      twoFactorToken,
    );

    if (!is2FAValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid 2FA code",
      });
    }

    // Update last login
    await adminAuthService.updateLastLogin(adminId, req.ip);

    // Get admin details
    const admin = await adminAuthService.getAdminUser(adminId);

    // Generate JWT token
    const authToken = jwt.sign(
      {
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
        type: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    // Log successful login
    await auditLogService.logAdminAction(
      adminId,
      "admin_login_success",
      "AdminUser",
      adminId,
      null,
      { email: admin.email, lastLogin: new Date() },
      "Successful 2FA login",
      req.ip,
      req.get("user-agent"),
    );

    return res.status(200).json({
      success: true,
      data: {
        token: authToken,
        admin: {
          id: admin.id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
        },
        message: "Login successful",
      },
    });
  } catch (err) {
    console.error("[ADMIN_LOGIN_STEP2] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "2FA verification failed",
    });
  }
}

/**
 * Get current admin profile
 */
export async function getAdminProfileController(req, res) {
  try {
    const adminId = req.admin?.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    const admin = await adminAuthService.getAdminUser(adminId);

    return res.status(200).json({
      success: true,
      data: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        lastLogin: admin.lastLogin,
        lastLoginIp: admin.lastLoginIp,
      },
    });
  } catch (err) {
    console.error("[GET_ADMIN_PROFILE] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch profile",
    });
  }
}

/**
 * Change admin password
 */
export async function changeAdminPasswordController(req, res) {
  try {
    const adminId = req.admin?.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Both passwords required",
      });
    }

    await adminAuthService.changeAdminPassword(
      adminId,
      oldPassword,
      newPassword,
    );

    // Log password change
    await auditLogService.logAdminAction(
      adminId,
      "password_changed",
      "AdminUser",
      adminId,
      null,
      null,
      "Admin password changed",
      req.ip,
      req.get("user-agent"),
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("[CHANGE_PASSWORD] Error:", err.message);
    return res.status(400).json({
      success: false,
      error: err.message || "Failed to change password",
    });
  }
}

/**
 * Admin logout
 */
export async function adminLogoutController(req, res) {
  try {
    const adminId = req.admin?.id;

    // Log logout
    await auditLogService.logAdminAction(
      adminId,
      "admin_logout",
      "AdminUser",
      adminId,
      null,
      null,
      "Admin logged out",
      req.ip,
      req.get("user-agent"),
    );

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error("[ADMIN_LOGOUT] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to logout",
    });
  }
}

/**
 * List all admin users (Super Admin only)
 */
export async function listAdminUsersController(req, res) {
  try {
    const adminId = req.admin?.id;
    const adminRole = req.admin?.role;

    if (adminRole !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        error: "Only super admins can view all admins",
      });
    }

    const admins = await adminAuthService.listAdminUsers();

    return res.status(200).json({
      success: true,
      data: admins,
    });
  } catch (err) {
    console.error("[LIST_ADMINS] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to list admins",
    });
  }
}
