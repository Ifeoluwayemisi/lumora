import prisma from "../models/prismaClient.js";

/**
 * GET /notifications
 * Get all notifications for authenticated user
 */
export async function getNotifications(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { status, type, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    // Build query filters
    const where = { userId };
    if (status) where.read = status === "read";
    if (type) where.type = type.toUpperCase();

    // Fetch notifications
    const [notifications, total] = await Promise.all([
      prisma.userNotifications.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.userNotifications.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
      notifications,
    });
  } catch (error) {
    console.error("[GET_NOTIFICATIONS] Error:", error.message);
    return res.status(500).json({
      error: "Failed to fetch notifications",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Please try again later",
    });
  }
}

/**
 * PATCH /notifications/:id
 * Mark notification as read
 */
export async function markNotificationRead(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify ownership
    const notification = await prisma.userNotifications.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Update status
    const updated = await prisma.userNotifications.update({
      where: { id },
      data: { read: true },
    });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification: updated,
    });
  } catch (error) {
    console.error("[MARK_READ] Error:", error.message);
    return res.status(500).json({
      error: "Failed to update notification",
    });
  }
}

/**
 * DELETE /notifications/:id
 * Delete a notification
 */
export async function deleteNotification(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify ownership
    const notification = await prisma.userNotifications.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Delete
    await prisma.userNotifications.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("[DELETE_NOTIFICATION] Error:", error.message);
    return res.status(500).json({
      error: "Failed to delete notification",
    });
  }
}

/**
 * PATCH /notifications/mark-all-read
 * Mark all unread notifications as read
 */
export async function markAllNotificationsRead(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await prisma.userNotifications.updateMany({
      where: {
        userId,
        read: false,
      },
      data: { read: true },
    });

    return res.status(200).json({
      success: true,
      message: `${result.count} notifications marked as read`,
      count: result.count,
    });
  } catch (error) {
    console.error("[MARK_ALL_READ] Error:", error.message);
    return res.status(500).json({
      error: "Failed to mark all as read",
    });
  }
}

/**
 * DELETE /notifications/clear-read
 * Delete all read notifications
 */
export async function clearReadNotifications(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await prisma.userNotifications.deleteMany({
      where: {
        userId,
        read: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: `${result.count} read notifications cleared`,
      count: result.count,
    });
  } catch (error) {
    console.error("[CLEAR_READ] Error:", error.message);
    return res.status(500).json({
      error: "Failed to clear notifications",
    });
  }
}

/**
 * GET /notifications/unread-count
 * Get count of unread notifications
 */
export async function getUnreadCount(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const count = await prisma.userNotifications.count({
      where: {
        userId,
        read: false,
      },
    });

    return res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error("[UNREAD_COUNT] Error:", error.message);
    return res.status(500).json({
      error: "Failed to fetch unread count",
    });
  }
}
