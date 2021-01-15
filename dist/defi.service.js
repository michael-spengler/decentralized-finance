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
    static async transferEther(fromWallet, toWallet, amountInETH) {
        return ethereum_service_1.EthereumService.transferEther(fromWallet, toWallet, amountInETH, 'ensureYourPrivateKeyIsAlwaysSafe');
    }
    static async getCompoundAccountData(walletAddress) {
        return compound_service_1.CompoundService.getAccountData(walletAddress);
    }
    static async depositEtherToCompound(amountOfEtherToBeDeposited, senderWalletAddress, senderWalletPrivateKey, web3ProviderURL) {
        return compound_service_1.CompoundService.depositEtherToCompound(amountOfEtherToBeDeposited, senderWalletAddress, senderWalletPrivateKey, web3ProviderURL);
    }
    static async getPriceDataWithTimeStamp() {
        return coinmarketcap_service_1.CoinMarketCapService.getPriceDataWithTimeStamp();
    }
}
exports.DeFiService = DeFiService;
