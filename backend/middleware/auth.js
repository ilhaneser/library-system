exports.isLoggedIn = (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Please log in to access this resource' });
    }
    next();
  };
  
  // Admin authorization middleware
  exports.isAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  };