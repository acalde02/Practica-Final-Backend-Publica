const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorDeliveryNote = [
  check("format")
    .isIn(["hours", "material"])
    .withMessage("Format must be either 'hours' or 'material'"),

  check("projectId")
    .notEmpty()
    .withMessage("Project ID is required"),

  check("clientId")
    .notEmpty()
    .withMessage("Client ID is required"),

  check("hours")
    .if((value, { req }) => req.body.format === "hours")
    .notEmpty()
    .withMessage("Hours are required for format 'hours'")
    .isNumeric()
    .withMessage("Hours must be a number"),

  check("material")
    .if((value, { req }) => req.body.format === "material")
    .notEmpty()
    .withMessage("Material is required for format 'material'"),

  check("quantity")
    .if((value, { req }) => req.body.format === "material")
    .notEmpty()
    .withMessage("Quantity is required for format 'material'")
    .isNumeric()
    .withMessage("Quantity must be a number"),

  validateResults
];

module.exports = { validatorDeliveryNote };
