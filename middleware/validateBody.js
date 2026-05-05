function validateBody(parser) {
  return (req, res, next) => {
    const result = parser(req.body);
    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }
    req.validated = result.data;
    next();
  };
}

module.exports = validateBody;
