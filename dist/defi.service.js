"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeFiService = void 0;
const compound_service_1 = require("./compound/compound.service");
const ethereum_service_1 = require("./ethereum/ethereum.service");
const coinmarketcap_service_1 = require("./coinmarketcap/coinmarketcap.service");
const uniswap_service_1 = require("./uniswap/uniswap.service");
const thug_life_service_1 = require("./thug-life-investments/thug-life.service");
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
    static async depositEtherToCompound(amountOfEtherToBeDeposited, senderWalletPrivateKey, gasLimit, web3ProviderURL) {
        return compound_service_1.CompoundService.depositEtherToCompound(amountOfEtherToBeDeposited, senderWalletPrivateKey, gasLimit, web3ProviderURL);
    }
    static async borrowDAIFromCompound(amountOfDAIToBeBorrowed, walletPrivateKey, gasLimit, web3ProviderURL) {
        return compound_service_1.CompoundService.borrowDAIFromCompound(amountOfDAIToBeBorrowed, walletPrivateKey, gasLimit, web3ProviderURL);
    }
    static async redeemAssetFromCompound(walletAddress, walletPrivateKey, gasLimit, web3ProviderURL, amount) {
        return compound_service_1.CompoundService.redeemAsset(walletAddress, walletPrivateKey, gasLimit, web3ProviderURL, amount);
    }
    static async getPriceDataWithTimeStamp() {
        return coinmarketcap_service_1.CoinMarketCapService.getPriceDataWithTimeStamp();
    }
    static async swapDAIToETH(amountOfDAIToBeSwapped, walletAddress, walletPrivateKey, web3ProviderURL) {
        await uniswap_service_1.UniSwapService.swapDAIToETH(amountOfDAIToBeSwapped, walletAddress, walletPrivateKey, web3ProviderURL);
    }
    static async startTheAutomatedManagedFund(walletAddress, walletPrivateKey, web3ProviderURL, healthFactorLimitForInvestmentRound, healthFactorLimitForRedemptionToStart, gasLimit, checkEachXMinutes) {
        return thug_life_service_1.ThugLifeService.startTheAutomatedManagedFund(walletAddress, walletPrivateKey, gasLimit, healthFactorLimitForInvestmentRound, healthFactorLimitForRedemptionToStart, web3ProviderURL, checkEachXMinutes);
    }
}
exports.DeFiService = DeFiService;
