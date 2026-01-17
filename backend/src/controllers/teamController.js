const {
  getTeamMembers,
  getPendingInvites,
  inviteTeamMember,
  acceptInvite,
  updateMemberRole,
  removeTeamMember,
  cancelInvite,
  updateLastActive,
  checkPermission,
} = require("../services/teamService");

/**
 * GET /manufacturer/team
 * Get all team members
 */
async function getAllTeamMembers(req, res) {
  try {
    const { manufacturerId } = req.params;

    // Verify user has access
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: { userId: true },
    });
    await prisma.$disconnect();

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
    console.error("Error fetching team members:", error);
    res.status(500).json({ error: "Failed to fetch team members" });
  }
}

/**
 * GET /manufacturer/team/invites
 * Get pending team invites
 */
async function getPendingTeamInvites(req, res) {
  try {
    const { manufacturerId } = req.params;

    // Verify user has access
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: { userId: true },
    });
    await prisma.$disconnect();

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
    console.error("Error fetching pending invites:", error);
    res.status(500).json({ error: "Failed to fetch pending invites" });
  }
}

/**
 * POST /manufacturer/team/invite
 * Send team invitation
 */
async function sendTeamInvite(req, res) {
  try {
    const { manufacturerId } = req.params;
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: "Email and role are required" });
    }

    // Verify user has access and is admin
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: { userId: true },
    });
    await prisma.$disconnect();

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
    console.error("Error sending invite:", error);
    res
      .status(400)
      .json({ error: error.message || "Failed to send invitation" });
  }
}

/**
 * PATCH /manufacturer/team/:memberId/role
 * Update team member role
 */
async function updateTeamMemberRole(req, res) {
  try {
    const { manufacturerId, memberId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    // Verify user has access
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: { userId: true },
    });
    await prisma.$disconnect();

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
    console.error("Error updating member role:", error);
    res.status(400).json({ error: error.message || "Failed to update role" });
  }
}

/**
 * DELETE /manufacturer/team/:memberId
 * Remove team member
 */
async function deleteTeamMember(req, res) {
  try {
    const { manufacturerId, memberId } = req.params;

    // Verify user has access
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: { userId: true },
    });
    await prisma.$disconnect();

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
    console.error("Error removing team member:", error);
    res.status(400).json({ error: error.message || "Failed to remove member" });
  }
}

/**
 * DELETE /manufacturer/team/invites/:inviteId
 * Cancel pending invite
 */
async function cancelTeamInvite(req, res) {
  try {
    const { manufacturerId, inviteId } = req.params;

    // Verify user has access
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: manufacturerId },
      select: { userId: true },
    });
    await prisma.$disconnect();

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
    console.error("Error cancelling invite:", error);
    res
      .status(400)
      .json({ error: error.message || "Failed to cancel invitation" });
  }
}

/**
 * POST /team/invite/:token/accept
 * Accept team invitation
 */
async function acceptTeamInvite(req, res) {
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

module.exports = {
  getAllTeamMembers,
  getPendingTeamInvites,
  sendTeamInvite,
  updateTeamMemberRole,
  deleteTeamMember,
  cancelTeamInvite,
  acceptTeamInvite,
};
