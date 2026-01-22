/**
 * Role-based Access Control Middleware
 * Restricts endpoint access to specific user roles
 * Supports both regular users (req.user) and admin users (req.admin)
 *
 * Usage: roleMiddleware("ADMIN") or roleMiddleware("ADMIN", "MODERATOR")
 */
export function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    // Check if user or admin is authenticated
    const user = req.user || req.admin;
    
    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    // Normalize role comparison (handle both uppercase and lowercase)
    const userRole = user.role?.toUpperCase();
    const normalizedRoles = allowedRoles.map((r) => r.toUpperCase());

    // Check if user has any of the allowed roles
    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "Forbidden",
        message: `This action requires one of ${normalizedRoles.join(", ")} roles. You have ${userRole} role.`,
      });
    }

    next();
  };
}

/**
 * DEPRECATED: Use roleMiddleware with multiple arguments instead
 * Multiple Role Middleware - Allow access to users with any of the specified roles
 */
export function roleMiddlewareMultiple(allowedRoles) {
  return roleMiddleware(...allowedRoles);
}
