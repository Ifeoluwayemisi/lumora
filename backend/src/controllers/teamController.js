import {
  getTeamMembers,
  getPendingInvites,
  inviteTeamMember,
  acceptInvite,
  updateMemberRole,
  removeTeamMember,
  cancelInvite,
  updateLastActive,
  checkPermission,
} from "../services/teamService.js";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

/**
 * GET /manufacturer/team
 * Get all team members for a manufacturer
 * Supports both: /manufacturer/:manufacturerId/team and /manufacturer/team
 */
export async function getAllTeamMembers(req, res) {
  try {
    // Get manufacturerId from params or extract from JWT via user's manufacturer record
    let manufacturerId = req.params.manufacturerId;

    if (!manufacturerId) {
      // Extract from JWT token - look up manufacturer by userId
      const manufacturer = await prisma.manufacturer.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });

      if (!manufacturer) {
        return res.status(404).json({ error: "Manufacturer not found" });
      }

      manufacturerId = manufacturer.id;
    }

    // Verify user has access
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: { userId: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    if (manufacturer.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const members = await getTeamMembers(manufacturerId);

    res.json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    console.error("[GET_TEAM_MEMBERS] Error:", error.message);
    console.error("[GET_TEAM_MEMBERS] Stack:", error.stack);
    res
      .status(500)
      .json({
        error: "Failed to fetch team members",
        message:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
  }
}

/**
 * GET /manufacturer/team/invites
 * Get pending team invites
 * Supports both: /manufacturer/:manufacturerId/team/invites and /manufacturer/team/pending-invites
 */
export async function getPendingTeamInvites(req, res) {
  try {
    // Get manufacturerId from params or extract from JWT via user's manufacturer record
    let manufacturerId = req.params.manufacturerId;

    if (!manufacturerId) {
      // Extract from JWT token - look up manufacturer by userId
      const manufacturer = await prisma.manufacturer.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });

      if (!manufacturer) {
        return res.status(404).json({ error: "Manufacturer not found" });
      }

      manufacturerId = manufacturer.id;
    }

    // Verify user has access
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: { userId: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    if (manufacturer.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const invites = await getPendingInvites(manufacturerId);

    res.json({
      success: true,
      count: invites.length,
      invites,
    });
  } catch (error) {
    console.error("[GET_PENDING_INVITES] Error:", error.message);
    console.error("[GET_PENDING_INVITES] Stack:", error.stack);
    res
      .status(500)
      .json({
        error: "Failed to fetch pending invites",
        message:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
  }
}

/**
 * POST /manufacturer/team/invite
 * Send team invitation
 * Supports both: /manufacturer/:manufacturerId/team/invite and /manufacturer/team/invite
 */
export async function sendTeamInvite(req, res) {
  try {
    let { manufacturerId } = req.params;
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: "Email and role are required" });
    }

    // Extract manufacturerId from JWT if not in params
    if (!manufacturerId) {
      const manufacturer = await prisma.manufacturer.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });
      if (!manufacturer) {
        return res.status(404).json({ error: "Manufacturer not found" });
      }
      manufacturerId = manufacturer.id;
    }

    // Verify user has access and is admin
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: { userId: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    if (manufacturer.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const invite = await inviteTeamMember(manufacturerId, email, role);

    res.status(201).json({
      success: true,
      message: "Invitation sent successfully",
      invite,
    });
  } catch (error) {
    console.error("[SEND_INVITE] Error:", error.message);
    res
      .status(400)
      .json({ error: error.message || "Failed to send invitation" });
  }
}

/**
 * PATCH /manufacturer/team/:memberId/role
 * Update team member role
 * Supports both URL patterns with/without manufacturerId
 */
export async function updateTeamMemberRole(req, res) {
  try {
    let { manufacturerId, memberId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    // Extract manufacturerId from JWT if not in params
    if (!manufacturerId) {
      const manufacturer = await prisma.manufacturer.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });
      if (!manufacturer) {
        return res.status(404).json({ error: "Manufacturer not found" });
      }
      manufacturerId = manufacturer.id;
    }

    // Verify user has access
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: { userId: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    if (manufacturer.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const member = await updateMemberRole(manufacturerId, memberId, role);

    res.json({
      success: true,
      message: "Member role updated",
      member,
    });
  } catch (error) {
    console.error("[UPDATE_MEMBER_ROLE] Error:", error.message);
    res.status(400).json({ error: error.message || "Failed to update role" });
  }
}

/**
 * DELETE /manufacturer/team/:memberId
 * Remove team member
 * Supports both URL patterns with/without manufacturerId
 */
export async function deleteTeamMember(req, res) {
  try {
    let { manufacturerId, memberId } = req.params;

    // Extract manufacturerId from JWT if not in params
    if (!manufacturerId) {
      const manufacturer = await prisma.manufacturer.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });
      if (!manufacturer) {
        return res.status(404).json({ error: "Manufacturer not found" });
      }
      manufacturerId = manufacturer.id;
    }

    // Verify user has access
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: { userId: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    if (manufacturer.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await removeTeamMember(manufacturerId, memberId);

    res.json({
      success: true,
      message: "Team member removed",
    });
  } catch (error) {
    console.error("[DELETE_TEAM_MEMBER] Error:", error.message);
    res.status(400).json({ error: error.message || "Failed to remove member" });
  }
}

/**
 * DELETE /manufacturer/team/invites/:inviteId
 * Cancel pending invite
 * Supports both URL patterns with/without manufacturerId
 */
export async function cancelTeamInvite(req, res) {
  try {
    let { manufacturerId, inviteId } = req.params;

    // Extract manufacturerId from JWT if not in params
    if (!manufacturerId) {
      const manufacturer = await prisma.manufacturer.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });
      if (!manufacturer) {
        return res.status(404).json({ error: "Manufacturer not found" });
      }
      manufacturerId = manufacturer.id;
    }

    // Verify user has access
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: { userId: true },
    });

    if (!manufacturer) {
      return res.status(404).json({ error: "Manufacturer not found" });
    }

    if (manufacturer.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await cancelInvite(manufacturerId, inviteId);

    res.json({
      success: true,
      message: "Invitation cancelled",
    });
  } catch (error) {
    console.error("[CANCEL_INVITE] Error:", error.message);
    res
      .status(400)
      .json({ error: error.message || "Failed to cancel invitation" });
  }
}

/**
 * POST /team/invite/:token/accept
 * Accept team invitation
 */
export async function acceptTeamInvite(req, res) {
  try {
    const { token } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const result = await acceptInvite(token, name);

    res.json({
      success: true,
      message: "Invitation accepted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error accepting invite:", error);
    res
      .status(400)
      .json({ error: error.message || "Failed to accept invitation" });
  }
}
