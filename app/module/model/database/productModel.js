const constant   = require(__basePath + '/app/config/constant');
const database   = require(constant.path.app + 'core/database');
const utility    = require(constant.path.app + 'util/utility');
const underscore = require("underscore");

/*
 * Class for product model
 */
class ProductModel {

    constructor() {
        this.databaseObj = database.getInstance();
    }

    static get DB() {
        return {
            READSLAVE: 'READSLAVE',
            MASTER   : 'MASTER'
        };
    }

    createProduct(dataPayload, callback) {
        let userData = {
            productId   : utility.uuid(),
            userId   : dataPayload.userId,
            name   : dataPayload.name,
            price   : dataPayload.price,
            description   : dataPayload.description,
            createdAt: new Date()
        };

        let query = `
            INSERT INTO 
                products (
                    productId,
                    userId,
                    name,
                    price,
                    description,
                    createdAt
                ) 
            VALUES (
                :productId,
                :userId,
                :name,
                :price,
                :description,
                :createdAt
            ) 
        `;

        this.databaseObj.query(
            ProductModel.DB.MASTER,
            {
                sql   : query,
                values: userData
            },
            callback,
            {queryFormat: 'namedParameters'}
        );
    };

    getProductById(productId, callback) {

        let query = `
            SELECT
                productId,
                name,
                price,
                description,
                viewCount,
                createdAt
            FROM 
                products
            WHERE
                productId = ?
                AND deletedAt is NULL
            ORDER BY
                createdAt desc
        `;

        this.databaseObj.query(
            ProductModel.DB.READSLAVE,
            {
                sql   : query,
                values: [productId]
            },
            callback
        );
    };

    updateCount(productId, callback) {
        let userData = {
            productId  : productId
        };

        let query = `
            UPDATE 
                products 
            SET 
                viewCount = viewCount + 1
            WHERE (
                productId = :productId
                AND deletedAt is NULL
            ) 
        `;

        this.databaseObj.query(
            ProductModel.DB.MASTER,
            {
                sql   : query,
                values: userData
            },
            callback,
            {queryFormat: 'namedParameters'}
        );
    };

    softDelete(productId, callback) {
        let userData = {
            productId  : productId,
            deletedAt  : new Date()
        };

        let query = `
            UPDATE 
                products 
            SET 
                deletedAt = :deletedAt
            WHERE (
                productId = :productId
            ) 
        `;

        this.databaseObj.query(
            ProductModel.DB.MASTER,
            {
                sql   : query,
                values: userData
            },
            callback,
            {queryFormat: 'namedParameters'}
        );
    };

    mostView(options, callback) {
        let {page = 1, limit = 2, currencyRate, currency} = options;

        let dataParam = {
            offset      : (page - 1) * limit,
            limit       : limit,
            currencyRate: currencyRate
        };

        let query = `
            SELECT
                productId,
                name,
                (price * ${currencyRate}) as price,
                description,
                viewCount
            FROM 
                products
            WHERE
                viewCount > 0
                AND deletedAt is NULL
            ORDER BY
                viewCount desc
            LIMIT ${dataParam.offset},${dataParam.limit} 
        `;

        this.databaseObj.query(
            ProductModel.DB.READSLAVE,
            {
                sql   : query,
                values: dataParam
            },
            callback
        );
    };
}

module.exports = ProductModel;
