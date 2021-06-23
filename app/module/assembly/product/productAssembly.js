const constant              = require(__basePath + '/app/config/constant');
const response              = require(constant.path.app + 'util/response');
const utility               = require(constant.path.app + 'util/utility');
const async                 = require('async');
const {logger}              = require(constant.path.app + 'core/logger');
const productModel          = require(constant.path.app + 'module/model/database/productModel');

const productModelObj       = new productModel();

/*
 * Register Product
 * @param {object} req
 * @param {object} res
 * @returns {json}
 */
exports.create = function (req, res, next) {
    let name = utility.validOrDefault(req.body.name, null);
    let price = utility.validOrDefault(req.body.price, null);
    let description = utility.validOrDefault(req.body.description, null);
    let userId = utility.validOrDefault(req.userDetail.userId, null);

    logger.info('[create] add new product with param %s, %s', userId, name);

    let dataPayload = {
        name,
        price,
        description,
        userId
    };

    //Validate the input data
    let validateData = function(callback) {
        if (utility.isEmpty(userId) === true) {
            return res.status(500).json(response.build('ERROR_VALIDATION', 'userId is required!'));
        }

        return callback(null);
    }

    let createProduct = function (callback) {
        productModelObj.createProduct(dataPayload, function (error, result, body) {
            if (error) {
                return callback(error);
            }

            return callback(null, body);
        });
    }

    async.waterfall([
        validateData,
        createProduct
    ], function (error, result, body) {
        if (error) {
            return res.status(500).json(response.build('ERROR_SERVER_ERROR', {error: error}));
        }

        logger.info('[createProduct] Returned with status [%s].', 200);

        return res.status(200).json(response.build('SUCCESS', true));
    });


};

/*
 * get a single product detail
 * @param {object} req
 * @param {object} res
 * @returns {json}
 */
exports.getProduct = function (req, res, next) {
    let {productDetail, currencyRate, currency } = req;

    logger.info('[product] product with param %s,%s,%s', productDetail.productId, currencyRate, currency);
    productDetail['price'] = productDetail['price'] *  currencyRate;

    //Update the product view count
    let updateCount = function(callback) {
        productModelObj.updateCount(productDetail.productId, function (error, result) {
            if (error) {
                return callback(error);
            }

            if (utility.isEmpty(result) === true) {
                return callback(null, false);
            } else {
                return callback(null, result);
            }
        });
    }

    async.waterfall([
        updateCount
    ], function (error, result, body) {
        if (error) {
            return res.status(500).json(response.build('ERROR_SERVER_ERROR', {error: error}));
        }

        if (result == false) {
            return res.status(500).json(response.build('USER_NOT_FOUND'));
        }

        logger.info('[product] Returned with status [%s] & result:', 200, JSON.stringify(productDetail));
        return res.status(200).json(response.build('SUCCESS', productDetail));
    });
};

/*
 * soft delete a product
 * @param {object} req
 * @param {object} res
 * @returns {json}
 */
exports.delete = function (req, res, next) {
    let {productDetail } = req;

    logger.info('[product] product with param %s,%s,%s', productDetail.productId);

    let deleteProduct = function(callback) {
        productModelObj.softDelete(productDetail.productId, function (error, result) {
            if (error) {
                return callback(error);
            }

            if (utility.isEmpty(result) === true) {
                return callback(null, false);
            } else {
                return callback(null, result);
            }
        });
    }

    async.series([
        deleteProduct
    ], function (error, result, body) {
        if (error) {
            return res.status(500).json(response.build('ERROR_SERVER_ERROR', {error: error}));
        }

        logger.info('[product] Returned with status [%s]:', 200);
        return res.status(200).json(response.build('SUCCESS', true));
    });
};

/*
 * get the most view list of product
 * @param {object} req
 * @param {object} res
 * @returns {json}
 */
exports.mostView = function (req, res, next) {
    let {currencyRate, currency } = req;
    let { limit = 5, page=1} = req.query;
    if (page < 1) {
        page = 1;
    }

    if (limit < 1) {
        limit = 5;
    }

    logger.info('[product] product with param:', JSON.stringify(req.query));
    let options = {
        limit,
        page,
        currencyRate,
        currency
    };

    let getList = function(callback) {
        productModelObj.mostView(options, function (error, result) {
            if (error) {
                return callback(error);
            }

            if (utility.isEmpty(result) === true) {
                return callback(null, false);
            } else {
                return callback(null, result);
            }
        });

    }

    async.series([
        getList
    ], function (error, result, body) {
        if (error) {
            return res.status(500).json(response.build('ERROR_SERVER_ERROR', {error: error}));
        }

        logger.info('[product] Returned with status [%s]:', 200);
        return res.status(200).json(response.build('SUCCESS', result[0] || []));
    });
};


