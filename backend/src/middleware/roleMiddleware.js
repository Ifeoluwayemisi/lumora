/**
 * Role-based Access Control Middleware
 * Restricts endpoint access to specific user roles
 *
 * Usage: app.use('/api/admin', roleMiddleware('ADMIN'))
 */
export function roleMiddleware(allowedRole) {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    // Normalize role comparison (handle both uppercase and lowercase)
    const userRole = req.user.role?.toUpperCase();
    const requiredRole = allowedRole?.toUpperCase();

    // Check if user has the required role
    if (userRole !== requiredRole) {
      return res.status(403).json({
        error: "Forbidden",
        message: `This action requires ${requiredRole} role. You have ${userRole} role.`,
      });
    }

    next();
  };
}

/**
 * Multiple Role Middleware
 * Allow access to users with any of the specified roles
 */
export function roleMiddlewareMultiple(allowedRoles) {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    const userRole = req.user.role?.toUpperCase();
    const normalizedRoles = allowedRoles.map((r) => r.toUpperCase());

    // Check if user has any of the allowed roles
    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "Forbidden",
        message: `This action requires one of: ${normalizedRoles.join(
          ", "
        )}. You have ${userRole} role.`,
      });
    }

    next();
  };
}
