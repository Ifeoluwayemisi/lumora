import prisma from "../models/prismaClient.js";
import * as auditLogService from "../services/auditLogService.js";

/**
 * Get all users with filtering and search
 */
export async function getUsersController(req, res) {
  try {
    const { status, search, page = 1, limit = 10, role } = req.query;
    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {};
    if (status === "active") where.accountStatus = "active";
    if (status === "suspended") where.accountStatus = "suspended";
    if (status === "flagged") where.isFlagged = true;
    if (role) where.role = role;

    // Add search
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          accountStatus: true,
          isFlagged: true,
          verified: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      data: {
        users,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (err) {
    console.error("[GET_USERS] Error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

/**
 * Get user statistics
 */
export async function getUserStatsController(req, res) {
  try {
    const [totalUsers, activeUsers, suspendedUsers, flaggedUsers] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { accountStatus: "active" } }),
        prisma.user.count({ where: { accountStatus: "suspended" } }),
        prisma.user.count({ where: { isFlagged: true } }),
      ]);

    res.status(200).json({
      data: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        flaggedUsers,
      },
    });
  } catch (err) {
    console.error("[GET_USER_STATS] Error:", err);
    res.status(500).json({ error: "Failed to fetch user statistics" });
  }
}

/**
 * Get single user details
 */
export async function getUserDetailController(req, res) {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        accountStatus: true,
        isFlagged: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ data: user });
  } catch (err) {
    console.error("[GET_USER_DETAIL] Error:", err);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
}

/**
 * Suspend user account
 */
export async function suspendUserController(req, res) {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    console.log(
      "[SUSPEND_USER] Starting suspension for userId:",
      userId,
      "reason:",
      reason,
    );

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const suspended = await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: "suspended",
      },
    });

    // Log the action
    await auditLogService.logAction({
      adminId: req.user?.id,
      action: "suspend_user",
      userId,
      details: {
        reason: reason || "No reason provided",
        previousStatus: user.accountStatus,
        newStatus: "suspended",
      },
    });

    console.log("[SUSPEND_USER] ✅ Successfully suspended userId:", userId);

    res.json({
      success: true,
      message: "User account suspended successfully",
      user: suspended,
    });
  } catch (err) {
    console.error("[SUSPEND_USER] Error:", err);
    res.status(500).json({ error: "Failed to suspend user" });
  }
}

/**
 * Unsuspend user account
 */
export async function unsuspendUserController(req, res) {
  try {
    const { userId } = req.params;

    console.log("[UNSUSPEND_USER] Starting unsuspension for userId:", userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const unsuspended = await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: "active",
      },
    });

    // Log the action
    await auditLogService.logAction({
      adminId: req.user?.id,
      action: "unsuspend_user",
      userId,
      details: {
        previousStatus: user.accountStatus,
        newStatus: "active",
      },
    });

    console.log("[UNSUSPEND_USER] ✅ Successfully unsuspended userId:", userId);

    res.json({
      success: true,
      message: "User account restored successfully",
      user: unsuspended,
    });
  } catch (err) {
    console.error("[UNSUSPEND_USER] Error:", err);
    res.status(500).json({ error: "Failed to unsuspend user" });
  }
}

/**
 * Flag user for review
 */
export async function flagUserController(req, res) {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    console.log(
      "[FLAG_USER] Starting flag for userId:",
      userId,
      "reason:",
      reason,
    );

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const flagged = await prisma.user.update({
      where: { id: userId },
      data: {
        isFlagged: true,
      },
    });

    // Log the action
    await auditLogService.logAction({
      adminId: req.user?.id,
      action: "flag_user",
      userId,
      details: {
        reason: reason || "No reason provided",
      },
    });

    console.log("[FLAG_USER] ✅ Successfully flagged userId:", userId);

    res.json({
      success: true,
      message: "User flagged for review successfully",
      user: flagged,
    });
  } catch (err) {
    console.error("[FLAG_USER] Error:", err);
    res.status(500).json({ error: "Failed to flag user" });
  }
}

/**
 * Unflag user
 */
export async function unflagUserController(req, res) {
  try {
    const { userId } = req.params;

    console.log("[UNFLAG_USER] Starting unflag for userId:", userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const unflagged = await prisma.user.update({
      where: { id: userId },
      data: {
        isFlagged: false,
      },
    });

    // Log the action
    await auditLogService.logAction({
      adminId: req.user?.id,
      action: "unflag_user",
      userId,
      details: {
        message: "User unflagged",
      },
    });

    console.log("[UNFLAG_USER] ✅ Successfully unflagged userId:", userId);

    res.json({
      success: true,
      message: "User unflagged successfully",
      user: unflagged,
    });
  } catch (err) {
    console.error("[UNFLAG_USER] Error:", err);
    res.status(500).json({ error: "Failed to unflag user" });
  }
}
