const {check} = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorProject = [
    check('name').exists().notEmpty(),
    check('description').exists().notEmpty(),
    check('startDate').exists().notEmpty(),
    check('endDate').exists().notEmpty(),
    check('client').exists().notEmpty(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

module.exports = {validatorProject};

    