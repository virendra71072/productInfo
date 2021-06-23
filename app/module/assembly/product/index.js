const constant  = require(__basePath + 'app/config/constant');
const router    = require('express').Router({
    caseSensitive   : true,
    strict          : true
});

const productAssembly   = require(constant.path.module + 'assembly/product/productAssembly');
const validation    = require(constant.path.module + 'assembly/product/productValidation');
const productMiddleware = require(constant.path.module + 'assembly/product/productMiddleware');


/*
 * Router list
 */
 /* Register products */
router.post(
    '/',
    validation.create,
    productMiddleware.validateToken,
    productAssembly.create
);

/* get list of most view product whose view count is more than 0 */
router.get(
    '/most-view',
    productMiddleware.validateToken,
    productMiddleware.loadCurrencyRate,
    productAssembly.mostView
);

/* get a product detail by id */
router.get(
    '/:productId',
    validation.getProduct,
    productMiddleware.validateToken,
    productMiddleware.loadProduct,
    productMiddleware.loadCurrencyRate,
    productAssembly.getProduct
);

/* soft delete a product by id*/
router.delete(
    '/:productId',
    validation.getProduct,
    productMiddleware.validateToken,
    productMiddleware.loadProduct,
    productAssembly.delete
);

module.exports = {
    router: router
};
