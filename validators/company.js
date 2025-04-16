const { check } = require("express-validator")
const validateResults = require("../utils/handleValidator")

const validatorCompany = [
    check("name").exists().notEmpty(),
    check("cif").exists().notEmpty().isLength({ min: 9, max: 9 }),
    check("street").exists().notEmpty(),
    check("number").exists().notEmpty().isNumeric(),
    check("postal").exists().notEmpty().isNumeric().isLength({ min: 5, max: 5 }),
    check("city").exists().notEmpty(),
    check("province").exists().notEmpty(),
    (req, res, next) => {
        return validateResults(req, res, next)
    }
]

module.exports = { validatorCompany }