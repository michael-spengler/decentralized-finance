"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeFiService = void 0;
const compound_service_1 = require("./compound/compound.service");
const ethereum_service_1 = require("./ethereum/ethereum.service");
const coinmarketcap_service_1 = require("./coinmarketcap/coinmarketcap.service");
class DeFiService {
    static async getGasPriceInfo() {
        return ethereum_service_1.EthereumService.getGasPriceInfo();
    }
    static async getCompoundAccountData(walletAddress) {
        return compound_service_1.CompoundService.getAccountData(walletAddress);
    }
    static async getPriceDataWithTimeStamp() {
        return coinmarketcap_service_1.CoinMarketCapService.getPriceDataWithTimeStamp();
    }
    static async transferEther(fromWallet, toWallet, amountInETH) {
        return ethereum_service_1.EthereumService.transferEther(fromWallet, toWallet, amountInETH, 'ensureYourPrivateKeyIsAlwaysSafe');
    }
}
exports.DeFiService = DeFiService;
