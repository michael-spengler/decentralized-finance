"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinMarketCapService = void 0;
require('dotenv').config();
const axios = require('axios');
class CoinMarketCapService {
    static async getPriceDataWithTimeStamp(coinMarketCapAPIKey) {
        process.env.NODE_ENV = 'production';
        const result = (await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', { headers: { 'X-CMC_PRO_API_KEY': coinMarketCapAPIKey } })).data;
        return { coinmarketcapResult: result };
    }
}
exports.CoinMarketCapService = CoinMarketCapService;
