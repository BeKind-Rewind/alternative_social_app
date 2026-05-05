const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function requireSameOriginRequest(req, res, next) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  if (req.get('x-requested-with') !== 'XMLHttpRequest') {
    return res.status(403).json({ message: 'Invalid request origin.' });
  }

  return next();
}

module.exports = requireSameOriginRequest;
