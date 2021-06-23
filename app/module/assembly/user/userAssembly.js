const constant              = require(__basePath + '/app/config/constant');
const response              = require(constant.path.app + 'util/response');
const utility               = require(constant.path.app + 'util/utility');
const config                = require(constant.path.app + 'core/configuration');
const async                 = require('async');
const {logger}              = require(constant.path.app + 'core/logger');
const underscore            = require('underscore');
const jwt                   = require('jsonwebtoken');
const userModel             = require(constant.path.app + 'module/model/database/userModel');


const userModelObj   = new userModel();

/*
 * Register User
 * @param {object} req
 * @param {object} res
 * @returns {json}
 */
exports.create = function (req, res, next) {
    let name = utility.validOrDefault(req.body.name, null);
    let email = utility.validOrDefault(req.body.email, null);
    let password = utility.validOrDefault(req.body.password, null);
    let confirmPassword = utility.validOrDefault(req.body.confirmPassword, null);

    logger.info('[user -> create] Register new user with param %s, %s', name, email);

    //validate user detail
    let validateData = function(callback) {
        if (utility.isEmpty(name) === true) {
            return res.status(500).json(response.build('ERROR_VALIDATION', 'Name is required!'));
        } else if (utility.isEmpty(email) === true) {
            return res.status(500).json(response.build('ERROR_VALIDATION', 'Email is required!'));
        } else if (utility.validateEmail(email) === false) {
            return res.status(500).json(response.build('ERROR_VALIDATION', 'Invalid Email Id!'));
        } else if (utility.isEmpty(password) === true) {
            return res.status(500).json(response.build('ERROR_VALIDATION', 'Password is required!'));
        } else if (utility.isEmpty(confirmPassword) === true) {
            return res.status(500).json(response.build('ERROR_VALIDATION', 'Confirm Password is required!'));
        } else if (password != confirmPassword) {
            return res.status(500).json(response.build('ERROR_VALIDATION', 'Confirm Password is not match with password!'));
        }

        userModelObj.getEmailInfo(email, function (error, result) {
            if (error) {
                return callback(error);
            }

            if (utility.isEmpty(result) === true) {
                return callback(null, false);
            } else {
                return callback(null, true);
            }
        });
        
    }

    let createUser = function (alreadyEmail, callback) {
        if (alreadyEmail == true) {
            return res.status(500).json(response.build('ERROR_USER_ALREADY_EXISTS', false));
        }

        userModelObj.createUser(name, email, password, function (error, result, body) {
            if (error) {
                return callback(error);
            }

            return callback(null, body);
        });
    }

    async.waterfall([
        validateData,
        createUser
    ], function (error, result, body) {
        if (error) {
            return res.status(500).json(response.build('ERROR_SERVER_ERROR', {error: error}));
        }

        logger.info('[createUser] Returned with status [%s].', 200);

        return res.status(200).json(response.build('SUCCESS', true));
    });

};

/*
 * Login & generate token
 * @param {object} req
 * @param {object} res
 * @returns {json}
 */
exports.login = function (req, res, next) {
    let email = utility.validOrDefault(req.body.email, null);
    let password = utility.validOrDefault(req.body.password, null);

    logger.info('[login] login user with param %s', email);

    let validateData = function(callback) {
        if (utility.isEmpty(email) === true) {
            return res.status(500).json(response.build('ERROR_VALIDATION', 'Email is required!'));
        } else if (utility.validateEmail(email) === false) {
            return res.status(500).json(response.build('ERROR_VALIDATION', 'Invalid Email Id!'));
        } else if (utility.isEmpty(password) === true) {
            return res.status(500).json(response.build('ERROR_VALIDATION', 'Password is required!'));
        }

        userModelObj.loginCheck(email, password, function (error, result) {
            if (error) {
                return callback(error);
            }
            
            if (utility.isEmpty(result) === true) {
                return callback(null, false);
            } else {
                var info = underscore.first(result);
                
                return callback(null, true, info);
            }
        });
        
    }

    async.waterfall([
        validateData
    ], function (error, result, body) {
        if (error) {
            return res.status(500).json(response.build('ERROR_SERVER_ERROR', {error: error}));
        }
        
        logger.info('[login] Login Returned with status [%s].', 200);

        if (result == false) {
            return res.status(500).json(response.build('INVALID_CREDENTIAL'));   
        }

        //generate JWT token & set session expire time 1 day
        var token = jwt.sign(body, 'user_session', { expiresIn: 60 * 60 * 24});

        return res.status(200).json(response.build('SUCCESS', {token}));
    });

};

