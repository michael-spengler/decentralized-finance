"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AaveService = void 0;
class AaveService {
    static async getAccountData(walletAddress) {
        // tbd
    }
    static async depositEtherToAave(amountOfEtherToBeDeposited, senderWalletPrivateKey, gasLimit, web3ProviderURL) {
        // tbd
    }
    static async borrowDAIFromAave(amountOfDAIToBeBorrowed, walletPrivateKey, gasLimit, web3ProviderURL) {
        // tbd
    }
    static async redeemAsset(walletAddress, senderWalletPrivateKey, gasLimit, web3ProviderURL, amount) {
        // tbd
    }
}
exports.AaveService = AaveService;
