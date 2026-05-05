const { parsePositiveInteger } = require('../utils/validation');

function validateParam(paramName) {
  return (req, res, next) => {
    const value = parsePositiveInteger(req.params[paramName]);
    if (!value) {
      return res.status(400).json({ message: `Invalid ${paramName}.` });
    }

    req.validatedParams = {
      ...req.validatedParams,
      [paramName]: value
    };
    next();
  };
}

module.exports = validateParam;
