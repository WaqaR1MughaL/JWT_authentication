// Usage: authorize('admin') or authorize('admin', 'editor')
// Must run AFTER authMiddleware, since it relies on req.user being set.
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

module.exports = authorize;
