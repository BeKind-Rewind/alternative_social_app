const crypto = require('crypto');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const TOKEN_BYTES = 32;

function createToken() {
  return crypto.randomBytes(TOKEN_BYTES).toString('hex');
}

function isValidToken(expected, submitted) {
  if (typeof expected !== 'string' || typeof submitted !== 'string') {
    return false;
  }

  const expectedBuffer = Buffer.from(expected, 'hex');
  const submittedBuffer = Buffer.from(submitted, 'hex');

  return (
    expectedBuffer.length === submittedBuffer.length &&
    expectedBuffer.length === TOKEN_BYTES &&
    crypto.timingSafeEqual(expectedBuffer, submittedBuffer)
  );
}

function csrfProtection(req, res, next) {
  if (!req.session) {
    return next(new Error('Session middleware must be mounted before CSRF protection.'));
  }

  if (SAFE_METHODS.has(req.method)) {
    if (req.method === 'GET' && req.accepts('html')) {
      req.session.csrfToken = req.session.csrfToken || createToken();
      res.locals.csrfToken = req.session.csrfToken;
    }
    return next();
  }

  if (!isValidToken(req.session.csrfToken, req.get('x-csrf-token'))) {
    return res.status(403).json({ message: 'Invalid CSRF token.' });
  }

  return next();
}

module.exports = {
  csrfProtection,
  createToken,
  isValidToken
};
