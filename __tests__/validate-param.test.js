const validateParam = require('../middleware/validateParam');

function mockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
}

describe('validateParam', () => {
  it('stores a validated positive integer param', () => {
    const req = { params: { id: '42' } };
    const res = mockResponse();
    const next = jest.fn();

    validateParam('id')(req, res, next);

    expect(req.validatedParams.id).toBe(42);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('preserves existing validated params', () => {
    const req = {
      params: { id: '7' },
      validatedParams: { slugId: 12 }
    };
    const res = mockResponse();
    const next = jest.fn();

    validateParam('id')(req, res, next);

    expect(req.validatedParams).toEqual({ slugId: 12, id: 7 });
    expect(next).toHaveBeenCalled();
  });

  it('rejects malformed params', () => {
    const req = { params: { id: 'abc' } };
    const res = mockResponse();
    const next = jest.fn();

    validateParam('id')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid id.' });
    expect(next).not.toHaveBeenCalled();
  });
});
