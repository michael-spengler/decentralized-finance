"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeFiService = void 0;
const compound_service_1 = require("./compound/compound.service");
const ethereum_service_1 = require("./ethereum/ethereum.service");
class DeFiService {
    static async getGasPriceInfo() {
        return ethereum_service_1.EthereumService.getGasPriceInfo();
    }
    static async getCompoundAccountData(walletAddress) {
        return compound_service_1.CompoundService.getAccountData(walletAddress);
    }
}
exports.DeFiService = DeFiService;
