const requireSameOriginRequest = require('../middleware/requireSameOriginRequest');

function mockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
}

describe('requireSameOriginRequest', () => {
  it('allows safe methods without a custom header', () => {
    const req = { method: 'GET', get: jest.fn() };
    const res = mockResponse();
    const next = jest.fn();

    requireSameOriginRequest(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejects state-changing requests without the same-origin header', () => {
    const req = { method: 'POST', get: jest.fn().mockReturnValue(undefined) };
    const res = mockResponse();
    const next = jest.fn();

    requireSameOriginRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid request origin.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('allows state-changing requests with the same-origin header', () => {
    const req = { method: 'DELETE', get: jest.fn().mockReturnValue('XMLHttpRequest') };
    const res = mockResponse();
    const next = jest.fn();

    requireSameOriginRequest(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
