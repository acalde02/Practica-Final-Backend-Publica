const { validationResult } = require("express-validator");

const validateResults = (req, res, next) => {
  try {
    validationResult(req).throw(); // Lanza si hay errores
    return next(); // Si no hay errores, pasa al siguiente middleware/controlador
  } catch (err) {
    return res.status(400).json({
      error: "INVALID_OR_MISSING_FIELDS",
      details: err.array()
    });
  }
};

module.exports = validateResults;
