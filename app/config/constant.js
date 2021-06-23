const basePath = __basePath;

module.exports = {
    sessionTime : 600,
    path        : {
        base        : basePath,
        app         : basePath + 'app/',
        module      : basePath + 'app/module/',
        log         : basePath + 'asset/log/',
    },
    defaultCurrency: "USD",
    defaultCurrencyRate: 1,
    currencyMap: {
        USD: "USDUSD",
        CAD: "USDCAD",
        GBP: "USDGBP",
        EUR: "USDEUR"
    }
};
