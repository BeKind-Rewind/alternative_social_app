const withAuth = require('../utils/auth');

describe('withAuth', () => {
  it('returns 401 JSON for unauthenticated API requests', () => {
    const req = { session: {}, originalUrl: '/api/posts' };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      redirect: jest.fn()
    };
    const next = jest.fn();
    withAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required.' });
    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('redirects HTML routes to login when unauthenticated', () => {
    const req = { session: {}, originalUrl: '/dashboard' };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      redirect: jest.fn()
    };
    const next = jest.fn();
    withAuth(req, res, next);
    expect(res.redirect).toHaveBeenCalledWith('/login');
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when session has user_id', () => {
    const req = { session: { user_id: 7 }, originalUrl: '/api/comments' };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      redirect: jest.fn()
    };
    const next = jest.fn();
    withAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });
});
