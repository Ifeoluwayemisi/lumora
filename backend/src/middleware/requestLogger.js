/**
 * Request logging middleware
 * Logs all incoming requests with timing info
 */
export function requestLogger(req, res, next) {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();

  // Attach request ID to request object for use in downstream handlers
  req.id = requestId;

  // Log incoming request
  const logData = {
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
  };
  
  // Add body logging for POST/PUT/PATCH requests
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    logData.bodyKeys = req.body ? Object.keys(req.body) : [];
  }
  
  console.log(`[REQ-${requestId}] ${req.method} ${req.path}`, logData);

  // Capture the original res.json function
  const originalJson = res.json;

  // Override res.json to log response
  res.json = function (data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    console.log(`[RES-${requestId}] ${req.method} ${req.path}`, {
      statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      ...(statusCode >= 400 && {
        error: data?.error,
        message: data?.message,
      }),
    });

    // Call the original json function
    return originalJson.call(this, data);
  };

  next();
}
