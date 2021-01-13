"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthereumService = void 0;
const axios = require('axios');
class EthereumService {
    static async getGasPriceInfo() {
        const gasPriceInfo = (await axios.get('https://ethgasstation.info/json/ethgasAPI.json')).data;
        return gasPriceInfo;
    }
}
exports.EthereumService = EthereumService;
