const {
  csrfProtection,
  createToken,
  isValidToken
} = require('../middleware/csrfProtection');

function mockResponse() {
  return {
    locals: {},
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
}

describe('csrfProtection', () => {
  it('creates a hex token and validates only the same token', () => {
    const token = createToken();

    expect(token).toMatch(/^[a-f0-9]{64}$/);
    expect(isValidToken(token, token)).toBe(true);
    expect(isValidToken(token, createToken())).toBe(false);
    expect(isValidToken(token, 'not-a-token')).toBe(false);
  });

  it('exposes a token to HTML GET requests', () => {
    const req = {
      method: 'GET',
      session: {},
      accepts: jest.fn().mockReturnValue('html')
    };
    const res = mockResponse();
    const next = jest.fn();

    csrfProtection(req, res, next);

    expect(req.session.csrfToken).toMatch(/^[a-f0-9]{64}$/);
    expect(res.locals.csrfToken).toBe(req.session.csrfToken);
    expect(next).toHaveBeenCalled();
  });

  it('rejects unsafe requests without a valid token', () => {
    const req = {
      method: 'POST',
      session: { csrfToken: createToken() },
      get: jest.fn().mockReturnValue(createToken())
    };
    const res = mockResponse();
    const next = jest.fn();

    csrfProtection(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid CSRF token.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('allows unsafe requests with a valid token', () => {
    const token = createToken();
    const req = {
      method: 'DELETE',
      session: { csrfToken: token },
      get: jest.fn().mockReturnValue(token)
    };
    const res = mockResponse();
    const next = jest.fn();

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
