const constant         = require(__basePath + 'app/config/constant');
const validationHelper = require(constant.path.app + 'util/validation');
const responseHelper   = require(constant.path.app + 'util/response');

/*
 * function to validate input request
 * @param {object} req
 * @param {object} res
 * @param {object} next
 */
exports.create = function (req, res, next) {
    let headerSchema = {};

    let schema = {};

    let bodySchema = {
        name : {
            notEmpty: true,
        },
        price   : {
            notEmpty: true,
            isFloat: true
        },
        description: {
            notEmpty: false
        }
    };

    req.checkHeaders(headerSchema);
    req.checkParams(schema);
    req.checkBody(bodySchema);

    req.getValidationResult().then(function (result) {

        // Checking for validation errors
        if (false === result.isEmpty()) {
            return res.status(400).json(responseHelper.build(
                'ERROR_VALIDATION', validationHelper.parseValidationErrors(result.mapped())
            )).end();
        }

        next();
    });
};

/*
 * function to validate input request
 * @param {object} req
 * @param {object} res
 * @param {object} next
 */
exports.getProduct = function (req, res, next) {
    let headerSchema = {};

    let schema = {
        productId   : {
            notEmpty: true
        },
    };

    let bodySchema = {
    };

    req.checkHeaders(headerSchema);
    req.checkParams(schema);
    req.checkBody(bodySchema);

    req.getValidationResult().then(function (result) {

        // Checking for validation errors
        if (false === result.isEmpty()) {
            return res.status(400).json(responseHelper.build(
                'ERROR_VALIDATION', validationHelper.parseValidationErrors(result.mapped())
            )).end();
        }

        next();
    });
};


