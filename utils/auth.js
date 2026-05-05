const withAuth = (req, res, next) => {
  if (!req.session.user_id) {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    return res.redirect('/login');
  } else {
    next();
  }
};

module.exports = withAuth;