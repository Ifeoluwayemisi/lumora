import prisma from "../models/prismaClient.js";
import { parseISO, isValid } from "date-fns";
import { Parser } from "json2csv";
import bcrypt from "bcryptjs";
import PDFDocument from "pdfkit";

/**
 * Shared helper to fetch user history
 * Can be used for both listing and exporting
 */
async function fetchUserHistory({
  userId,
  state,
  from,
  to,
  page = 1,
  limit = 20,
  paginate = true,
}) {
  const where = { userId };

  if (state) where.verificationState = state;

  if (from || to) {
    where.createdAt = {};
    if (from) {
      const fromDate = parseISO(from);
      if (isValid(fromDate)) where.createdAt.gte = fromDate;
    }
    if (to) {
      const toDate = parseISO(to);
      if (isValid(toDate)) where.createdAt.lte = toDate;
    }
  }

  const query = {
    where,
    orderBy: { createdAt: "desc" },
  };

  if (paginate) {
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    query.skip = (pageNum - 1) * limitNum;
    query.take = limitNum;
  }

  const [history, total] = await Promise.all([
    prisma.verificationLog.findMany(query),
    prisma.verificationLog.count({ where }),
  ]);

  return { history, total };
}

/**
 * GET /history
 * Returns paginated user history
 */
export async function getUserHistory(req, res) {
  try {
    const userId = req.user.id;
    const { state, from, to, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(parseInt(limit) || 20, 100);

    const { history, total } = await fetchUserHistory({
      userId,
      state,
      from,
      to,
      page: pageNum,
      limit: limitNum,
      paginate: true,
    });

    res.json({
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
      history,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user history" });
  }
}

/**
 * POST /favorites
 * Add a product to user favorites
 */
export async function addFavorite(req, res) {
  try {
    const userId = req.user.id;
    const { codeValue, productName, productId } = req.body;

    const fav = await prisma.userFavorites.create({
      data: { userId, codeValue, productName, productId },
    });

    res.json(fav);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add favorite" });
  }
}

/**
 * GET /favorites
 * List all user favorites
 */
export async function getFavorites(req, res) {
  try {
    const userId = req.user.id;
    const favorites = await prisma.userFavorites.findMany({
      where: { userId },
    });
    res.json(favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch favorites" });
  }
}

/**
 * DELETE /favorite/:id
 * Remove a favorite by ID
 */
export async function removeFavorite(req, res) {
  try {
    const userId = req.user.id;
    const favId = req.params.id;

    const result = await prisma.userFavorites.deleteMany({
      where: { id: favId, userId },
    });
    res.json({ success: result.count > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove favorite" });
  }
}

/**
 * GET /notifications
 * Get all user notifications
 */
export async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const notifications = await prisma.userNotifications.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
}

/**
 * PATCH /notifications/:id
 * Mark a notification as read
 */
export async function markNotificationRead(req, res) {
  try {
    const userId = req.user.id;
    const notifId = req.params.id;

    const notif = await prisma.userNotifications.updateMany({
      where: { id: notifId, userId },
      data: { read: true },
    });

    res.json({ success: notif.count > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
}

/**
 * GET /dashboard
 * Returns simple user dashboard stats
 */
export async function getUserDashboard(req, res) {
  try {
    const userId = req.user.id;

    const [total, genuine, highRisk, unregistered] = await Promise.all([
      prisma.verificationLog.count({ where: { userId } }),
      prisma.verificationLog.count({
        where: { userId, verificationState: "GENUINE" },
      }),
      prisma.verificationLog.count({
        where: { userId, verificationState: "CODE_ALREADY_USED" },
      }),
      prisma.verificationLog.count({
        where: { userId, verificationState: "UNREGISTERED_PRODUCT" },
      }),
    ]);

    res.json({ total, genuine, highRisk, unregistered });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
}

/**
 * GET /history/export
 * Exports user history as CSV, JSON, or PDF
 */
export async function exportUserHistory(req, res) {
  try {
    const userId = req.user.id;
    const { state, from, to, format = "csv" } = req.query;

    const validFormats = ["csv", "json", "pdf"];
    if (!validFormats.includes(format)) {
      return res
        .status(400)
        .json({ message: "Invalid format. Use csv, json, or pdf" });
    }

    const { history } = await fetchUserHistory({
      userId,
      state,
      from,
      to,
      paginate: false,
    });

    if (format === "csv") {
      const parser = new Parser();
      const csv = parser.parse(history);
      res.header("Content-Type", "text/csv");
      res.attachment("user_history.csv");
      return res.send(csv);
    }

    if (format === "json") {
      res.header("Content-Type", "application/json");
      res.attachment("user_history.json");
      return res.send(JSON.stringify(history, null, 2));
    }

    if (format === "pdf") {
      const doc = new PDFDocument();
      res.header("Content-Type", "application/pdf");
      res.attachment("user_history.pdf");
      doc.pipe(res);

      doc.fontSize(16).text("Verification History Report", { underline: true });
      doc.fontSize(10).text(`Exported: ${new Date().toLocaleDateString()}\n`);

      history.forEach((record, idx) => {
        doc.fontSize(10).text(`\n${idx + 1}. Code: ${record.codeValue}`);
        doc.text(`   Status: ${record.verificationState}`);
        doc.text(`   Date: ${new Date(record.createdAt).toLocaleDateString()}`);
        if (record.location) doc.text(`   Location: ${record.location}`);
      });

      doc.end();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to export user history" });
  }
}

/**
 * PATCH /profile
 * Update user profile (name and email)
 */
export async function updateUserProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if email already exists (but not for current user)
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
      },
    });

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
}

/**
 * PATCH /password
 * Change user password
 */
export async function changeUserPassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "All password fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to change password" });
  }
}

/**
 * DELETE /account
 * Delete user account permanently
 */
export async function deleteUserAccount(req, res) {
  try {
    const userId = req.user.id;
    const { password, confirmation } = req.body;

    // Validate confirmation
    if (confirmation !== "DELETE MY ACCOUNT") {
      return res.status(400).json({ message: "Invalid confirmation text" });
    }

    // Get user and verify password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password is incorrect" });
    }

    // Delete all user data in cascade
    // Note: relies on database foreign key cascade delete configuration
    await Promise.all([
      prisma.userNotifications.deleteMany({ where: { userId } }),
      prisma.userFavorites.deleteMany({ where: { userId } }),
      prisma.verificationLog.deleteMany({ where: { userId } }),
    ]);

    // Finally delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete account" });
  }
}

/**
 * GET /settings
 * Get user notification preferences
 */
export async function getUserSettings(req, res) {
  try {
    const userId = req.user.id;

    // For now, return default settings from user model
    // In future, create separate UserSettings table
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
      },
    });

    const settings = {
      emailNotifications: true,
      pushNotifications: false,
      weeklyDigest: true,
      suspiciousActivityAlerts: true,
    };

    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
}

/**
 * PATCH /settings
 * Update user notification preferences
 */
export async function updateUserSettings(req, res) {
  try {
    const userId = req.user.id;
    const {
      emailNotifications,
      pushNotifications,
      weeklyDigest,
      suspiciousActivityAlerts,
    } = req.body;

    // Validate input
    const validSettings = {
      emailNotifications: Boolean(emailNotifications),
      pushNotifications: Boolean(pushNotifications),
      weeklyDigest: Boolean(weeklyDigest),
      suspiciousActivityAlerts: Boolean(suspiciousActivityAlerts),
    };

    // Store settings (in future, use separate UserSettings table)
    // For now, just return success
    res.json({
      message: "Settings updated successfully",
      settings: validSettings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update settings" });
  }
}

/**
 * DELETE /history
 * Clear all user verification history
 */
export async function clearUserHistory(req, res) {
  try {
    const userId = req.user.id;
    const { confirmation } = req.body;

    if (confirmation !== true) {
      return res.status(400).json({ message: "Confirmation required" });
    }

    const result = await prisma.verificationLog.deleteMany({
      where: { userId },
    });

    res.json({
      message: "History cleared successfully",
      deletedCount: result.count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to clear history" });
  }
}

/**
 * GET /dashboard-summary
 * Get dashboard summary stats
 */
export async function getDashboardSummary(req, res) {
  try {
    const userId = req.user.id;

    const [total, genuine, suspicious, used] = await Promise.all([
      prisma.verificationLog.count({ where: { userId } }),
      prisma.verificationLog.count({
        where: { userId, verificationState: "GENUINE" },
      }),
      prisma.verificationLog.count({
        where: {
          userId,
          verificationState: {
            in: ["SUSPICIOUS_PATTERN"],
          },
        },
      }),
      prisma.verificationLog.count({
        where: { userId, verificationState: "CODE_ALREADY_USED" },
      }),
    ]);

    // Get recent verifications
    const recent = await prisma.verificationLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Get favorites count
    const favoritesCount = await prisma.userFavorites.count({
      where: { userId },
    });

    res.json({
      stats: {
        total,
        genuine,
        suspicious,
        used,
        favorites: favoritesCount,
      },
      recent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dashboard summary" });
  }
}
/**
 * PATCH /profile-picture
 * Upload or update user profile picture
 */
export async function uploadProfilePicture(req, res) {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    // Validate file type
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedMimes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed",
      });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({
        message: "File size exceeds 5MB limit",
      });
    }

    // Generate filename
    const filename = `profile_${userId}_${Date.now()}.${
      req.file.mimetype.split("/")[1]
    }`;
    const filepath = `uploads/profiles/${filename}`;

    // In production, you'd use cloud storage (S3, Cloudinary, etc.)
    // For now, store locally
    const fs = await import("fs");
    const path = await import("path");

    const uploadsDir = path.resolve("uploads/profiles");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fullPath = path.join(uploadsDir, filename);
    fs.writeFileSync(fullPath, req.file.buffer);

    // Update user profile picture in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profilePicture: filepath,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
      },
    });

    res.json({
      message: "Profile picture uploaded successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to upload profile picture",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
}

/**
 * GET /profile
 * Get user profile including profile picture
 */
export async function getUserProfile(req, res) {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePicture: true,
        verified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
}
