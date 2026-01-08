import prisma from "../models/prismaClient.js";
import { parseISO, isValid } from "date-fns";
import { Parser } from "json2csv";

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
    const { codeValue, productId } = req.body;

    const fav = await prisma.userFavorites.create({
      data: { userId, codeValue, productId },
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
 * Exports user history as CSV
 */
export async function exportUserHistory(req, res) {
  try {
    const userId = req.user.id;
    const { state, from, to, format = "csv" } = req.query;

    if (format !== "csv") {
      return res.status(400).json({ message: "Only CSV export supported" });
    }

    const { history } = await fetchUserHistory({
      userId,
      state,
      from,
      to,
      paginate: false, // export all history
    });

    const parser = new Parser();
    const csv = parser.parse(history);

    res.header("Content-Type", "text/csv");
    res.attachment("user_history.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to export user history" });
  }
}
