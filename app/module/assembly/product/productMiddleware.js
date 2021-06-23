const constant              = require(__basePath + '/app/config/constant');
const config                = require(constant.path.app + 'core/configuration');
const response              = require(constant.path.app + 'util/response');
const utility               = require(constant.path.app + 'util/utility');
const underscore            = require('underscore');
const jwt                   = require('jsonwebtoken');
const async                 = require('async');
const {logger}              = require(constant.path.app + 'core/logger');
const baseModel             = require(constant.path.app + 'module/model/system/baseModel');
const productModel          = require(constant.path.app + 'module/model/database/productModel');

const productModelObj       = new productModel();
const systemBaseModelObj    = new baseModel();

/*
 * Validate user input token with jwt (JSON WEB TOKEN)
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns {json}
 */
exports.validateToken = function (req, res, next) {
    const { token = null } = req.headers;
    try {
        var detail = jwt.verify(token, 'user_session');
        if (detail && !!detail['userId']) {
            req.userDetail = detail;
            next();
        } else {
            logger.error('[validateToken] Invalid token');
            return res.status(500).json(response.build('INVALID_AUTH_TOKEN'));
        }
    } catch(err) {
        logger.info('[validateToken] Returned with error [%s]:', err);
        return res.status(500).json(response.build('INVALID_AUTH_TOKEN', {error: err}));
    }
};

/*
 * Load product detail
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns {json}
 */
exports.loadProduct = function (req, res, next) {
    const { productId = null } = req.params;

    let loadData = function(callback) {

        productModelObj.getProductById(productId, function (error, result) {
            if (error) {
                return callback(error);
            }

            if (utility.isEmpty(result) === true) {
                return callback(null, false);
            } else {

                return callback(null, result[0]);
            }
        });
    }

    async.series([
        loadData
    ], function (error, result, body) {
        logger.info('[loadProduct] Returned with error [%s] & result:', error, result);
        if (error) {
            return res.status(500).json(response.build('ERROR_SERVER_ERROR', {error: error}));
        }

        if (underscore.size(result[0]) == 0) {
            return res.status(500).json(response.build('ERROR_PRODUCT_NOT_EXISTS'));
        }

        req.productDetail = result[0];
        next();
    });
};

/*
 * fetch the current currency rate
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns {json}
 */
exports.loadCurrencyRate = function (req, res, next) {
    const { currency = 'USD' } = req.query;

    let url = `${config.get('currencyRate:host')}&access_key=${config.get('currencyRate:apiKey')}&currencies=${currency}`;

    let loadData = function(callback) {
        systemBaseModelObj.sendRequest(
            'GET',
            url,
            {},
            {},
            {},
            callback
        );
    }

    async.series([
        loadData
    ], function (error, result) {
        logger.info('[loadCurrencyRate] Returned with error [%s] & result:', error, result);
        if (error) {
            return res.status(500).json(response.build('ERROR_SERVER_ERROR', {error: error}));
        }

        result = underscore.first(result);
        if (underscore.size(result[0]['body']) == 0) {
            return res.status(500).json(response.build('ERROR_CURRENCY_API_SERVER_ERROR'));
        }

        let currencyMapValue = `${constant.defaultCurrency}${currency}`;
        if (!!result[0]['body']['quotes'] && !!result[0]['body']['quotes'][currencyMapValue]) {
            req.currencyRate = result[0]['body']['quotes'][currencyMapValue];
            req.currency = currency;
        } else {
            req.currencyRate = constant.defaultCurrencyRate;
            req.currency = constant.defaultCurrency;
        }
        next();
    });
};


