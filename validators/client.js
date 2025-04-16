const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatorClient = [
    check("name").exists().notEmpty(),
    check("street").exists().notEmpty(),
    check("number").exists().notEmpty().isNumeric(),
    check("postal").exists().notEmpty().isNumeric().isLength({ min: 5, max: 5 }),
    check("city").exists().notEmpty(),
    check("province").exists().notEmpty(),
    check("phone").exists().notEmpty(),
    check("email").exists().notEmpty().isEmail(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

module.exports = { validatorClient };