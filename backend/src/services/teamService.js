import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import crypto from "crypto";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Get all team members for a manufacturer
 */
async function getTeamMembers(manufacturerId) {
  return prisma.teamMember.findMany({
    where: { manufacturerId, status: "active" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      joinedAt: true,
      lastActiveAt: true,
    },
    orderBy: { joinedAt: "desc" },
  });
}

/**
 * Get pending team invites for a manufacturer
 */
async function getPendingInvites(manufacturerId) {
  return prisma.teamInvite.findMany({
    where: {
      manufacturerId,
      status: "pending",
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      expiresAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Send team invitation email
 */
async function sendTeamInviteEmail(email, manufacturerName, inviteToken, role) {
  const acceptUrl = `${process.env.FRONTEND_URL || "https://lumora-gold.vercel.app"}/team/invite/${inviteToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `${manufacturerName} invited you to join their team on Lumora`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; color: white;">
          <h1 style="margin: 0;">Team Invitation</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
          <p style="margin: 0 0 20px 0; color: #1f2937;">Hi there,</p>
          
          <p style="margin: 0 0 20px 0; color: #1f2937;">
            <strong>${manufacturerName}</strong> has invited you to join their team on Lumora as a <strong>${role}</strong>.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <p style="margin: 0; color: #1f2937;">
              <strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}<br>
              <strong>Manufacturer:</strong> ${manufacturerName}
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Accept Invitation</a>
          </div>
          
          <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 12px;">
            This invitation will expire in 7 days. If you don't recognize this request, you can safely ignore this email.
          </p>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #6b7280;">
          <p style="margin: 0;">Lumora - Counterfeit Prevention Platform</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending team invite email:", error);
    return false;
  }
}

/**
 * Invite a team member
 */
async function inviteTeamMember(manufacturerId, email, role) {
  // Check if email already exists as team member
  const existingMember = await prisma.teamMember.findUnique({
    where: { manufacturerId_email: { manufacturerId, email } },
  });

  if (existingMember) {
    throw new Error("User is already part of this team");
  }

  // Check if invite already exists
  const existingInvite = await prisma.teamInvite.findUnique({
    where: { manufacturerId_email: { manufacturerId, email } },
  });

  if (existingInvite && existingInvite.status === "pending") {
    throw new Error("Invitation already sent to this email");
  }

  // Get manufacturer details
  const manufacturer = await prisma.manufacturer.findUnique({
    where: { id: manufacturerId },
    select: { name: true },
  });

  if (!manufacturer) {
    throw new Error("Manufacturer not found");
  }

  // Create invite token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Create invite in database
  const invite = await prisma.teamInvite.create({
    data: {
      manufacturerId,
      email,
      role,
      token,
      expiresAt,
    },
  });

  // Send email
  await sendTeamInviteEmail(email, manufacturer.name, token, role);

  return {
    id: invite.id,
    email: invite.email,
    role: invite.role,
    status: "pending",
    expiresAt: invite.expiresAt,
  };
}

/**
 * Accept team invitation
 */
async function acceptInvite(token, name) {
  const invite = await prisma.teamInvite.findUnique({
    where: { token },
    include: { manufacturer: true },
  });

  if (!invite) {
    throw new Error("Invitation not found");
  }

  if (invite.status !== "pending") {
    throw new Error("This invitation has already been used or expired");
  }

  if (new Date() > invite.expiresAt) {
    throw new Error("This invitation has expired");
  }

  // Create team member
  const teamMember = await prisma.teamMember.create({
    data: {
      manufacturerId: invite.manufacturerId,
      email: invite.email,
      name,
      role: invite.role,
    },
  });

  // Mark invite as accepted
  await prisma.teamInvite.update({
    where: { id: invite.id },
    data: {
      status: "accepted",
      acceptedAt: new Date(),
    },
  });

  return {
    id: teamMember.id,
    manufacturerId: teamMember.manufacturerId,
    email: teamMember.email,
    role: teamMember.role,
    manufacturer: {
      id: invite.manufacturer.id,
      name: invite.manufacturer.name,
    },
  };
}

/**
 * Update team member role
 */
async function updateMemberRole(manufacturerId, memberId, newRole) {
  const validRoles = ["admin", "editor", "viewer"];
  if (!validRoles.includes(newRole)) {
    throw new Error("Invalid role");
  }

  const member = await prisma.teamMember.findFirst({
    where: { id: memberId, manufacturerId },
  });

  if (!member) {
    throw new Error("Team member not found");
  }

  return prisma.teamMember.update({
    where: { id: memberId },
    data: { role: newRole },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      joinedAt: true,
    },
  });
}

/**
 * Remove team member
 */
async function removeTeamMember(manufacturerId, memberId) {
  const member = await prisma.teamMember.findFirst({
    where: { id: memberId, manufacturerId },
  });

  if (!member) {
    throw new Error("Team member not found");
  }

  return prisma.teamMember.update({
    where: { id: memberId },
    data: { status: "removed" },
  });
}

/**
 * Cancel pending invite
 */
async function cancelInvite(manufacturerId, inviteId) {
  const invite = await prisma.teamInvite.findFirst({
    where: { id: inviteId, manufacturerId },
  });

  if (!invite) {
    throw new Error("Invite not found");
  }

  return prisma.teamInvite.delete({
    where: { id: inviteId },
  });
}

/**
 * Update last active time
 */
async function updateLastActive(memberId) {
  return prisma.teamMember.update({
    where: { id: memberId },
    data: { lastActiveAt: new Date() },
  });
}

/**
 * Check if user has permission for action
 */
async function checkPermission(manufacturerId, memberId, requiredRole) {
  const member = await prisma.teamMember.findFirst({
    where: { id: memberId, manufacturerId },
  });

  if (!member) return false;

  const roles = { admin: 3, editor: 2, viewer: 1 };
  return (roles[member.role] || 0) >= (roles[requiredRole] || 0);
}

export {
  getTeamMembers,
  getPendingInvites,
  inviteTeamMember,
  acceptInvite,
  updateMemberRole,
  removeTeamMember,
  cancelInvite,
  updateLastActive,
  checkPermission,
};
