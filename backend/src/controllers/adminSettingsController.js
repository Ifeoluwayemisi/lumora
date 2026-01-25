import prisma from "../models/prismaClient.js";

/**
 * Get admin settings for current user
 */
export async function getSettingsController(req, res) {
  try {
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get or create settings for this admin
    let settings = await prisma.adminSettings.findUnique({
      where: { adminId },
    });

    // If no settings exist, create defaults
    if (!settings) {
      settings = await prisma.adminSettings.create({
        data: {
          adminId,
          emailNotifications: true,
          pushNotifications: false,
          digestFrequency: "weekly",
          sessionTimeout: 30,
          twoFactorRequired: true,
          ipWhitelist: false,
          theme: "auto",
          alertsCritical: true,
          alertsHigh: true,
          alertsModerate: false,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (err) {
    console.error("[GET_SETTINGS] Error:", err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
}

/**
 * Update admin settings
 */
export async function updateSettingsController(req, res) {
  try {
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      emailNotifications,
      pushNotifications,
      digestFrequency,
      sessionTimeout,
      twoFactorRequired,
      ipWhitelist,
      theme,
      alertsCritical,
      alertsHigh,
      alertsModerate,
    } = req.body;

    // Validate session timeout
    if (sessionTimeout && (sessionTimeout < 5 || sessionTimeout > 120)) {
      return res
        .status(400)
        .json({ error: "Session timeout must be between 5 and 120 minutes" });
    }

    // Update or create settings
    const settings = await prisma.adminSettings.upsert({
      where: { adminId },
      update: {
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(pushNotifications !== undefined && { pushNotifications }),
        ...(digestFrequency && { digestFrequency }),
        ...(sessionTimeout && { sessionTimeout }),
        ...(twoFactorRequired !== undefined && { twoFactorRequired }),
        ...(ipWhitelist !== undefined && { ipWhitelist }),
        ...(theme && { theme }),
        ...(alertsCritical !== undefined && { alertsCritical }),
        ...(alertsHigh !== undefined && { alertsHigh }),
        ...(alertsModerate !== undefined && { alertsModerate }),
      },
      create: {
        adminId,
        emailNotifications: emailNotifications ?? true,
        pushNotifications: pushNotifications ?? false,
        digestFrequency: digestFrequency ?? "weekly",
        sessionTimeout: sessionTimeout ?? 30,
        twoFactorRequired: twoFactorRequired ?? true,
        ipWhitelist: ipWhitelist ?? false,
        theme: theme ?? "auto",
        alertsCritical: alertsCritical ?? true,
        alertsHigh: alertsHigh ?? true,
        alertsModerate: alertsModerate ?? false,
      },
    });

    console.log("[UPDATE_SETTINGS] ✅ Settings updated for admin:", adminId);

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (err) {
    console.error("[UPDATE_SETTINGS] Error:", err);
    res.status(500).json({ error: "Failed to update settings" });
  }
}

/**
 * Reset settings to defaults
 */
export async function resetSettingsController(req, res) {
  try {
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const settings = await prisma.adminSettings.upsert({
      where: { adminId },
      update: {
        emailNotifications: true,
        pushNotifications: false,
        digestFrequency: "weekly",
        sessionTimeout: 30,
        twoFactorRequired: true,
        ipWhitelist: false,
        theme: "auto",
        alertsCritical: true,
        alertsHigh: true,
        alertsModerate: false,
      },
      create: {
        adminId,
        emailNotifications: true,
        pushNotifications: false,
        digestFrequency: "weekly",
        sessionTimeout: 30,
        twoFactorRequired: true,
        ipWhitelist: false,
        theme: "auto",
        alertsCritical: true,
        alertsHigh: true,
        alertsModerate: false,
      },
    });

    console.log(
      "[RESET_SETTINGS] ✅ Settings reset to defaults for admin:",
      adminId,
    );

    res.status(200).json({
      success: true,
      message: "Settings reset to defaults",
      data: settings,
    });
  } catch (err) {
    console.error("[RESET_SETTINGS] Error:", err);
    res.status(500).json({ error: "Failed to reset settings" });
  }
}
