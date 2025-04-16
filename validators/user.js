const { check } = require("express-validator")
const validateResults = require("../utils/handleValidator")

const validatorUser = [
    check("email").exists().notEmpty().isEmail(),
    check("name").exists().notEmpty().isString(),
    check("surnames").exists().notEmpty().isString(),
    check("nif").exists().notEmpty().isString(),
    (req, res, next) => {
        return validateResults(req, res, next)
    }
]

module.exports = { validatorUser }