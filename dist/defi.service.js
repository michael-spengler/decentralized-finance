"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeFiService = void 0;
const compound_service_1 = require("./compound/compound.service");
const aave_service_1 = require("./aave/aave.service");
const ethereum_service_1 = require("./ethereum/ethereum.service");
const coinmarketcap_service_1 = require("./coinmarketcap/coinmarketcap.service");
const uniswap_service_1 = require("./uniswap/uniswap.service");
const erc20_service_1 = require("./ethereum/erc20.service");
const thug_life_service_1 = require("./thug-life-investments/thug-life.service");
const dydx_service_1 = require("./dydx/dydx.service");
// import { DyDxService } from "./dydx/dydx.service"
class DeFiService {
    static async getGasPriceInfo() {
        return ethereum_service_1.EthereumService.getGasPriceInfo();
    }
    static async transferEther(fromWallet, toWallet, amountInETH) {
        return ethereum_service_1.EthereumService.transferEther(fromWallet, toWallet, amountInETH, 'ensureYourPrivateKeyIsAlwaysSafe');
    }
    static async getBalanceOfERC20TokenInWallet(walletAddress, walletPrivateKey, tokenAddress, web3ProviderURL) {
        return erc20_service_1.ERC20Service.getBalanceOfERC20TokenInWallet(walletAddress, walletPrivateKey, tokenAddress, web3ProviderURL);
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
    static async getAaveAccountData(walletAddress, web3ProviderURL) {
        return aave_service_1.AaveService.getAccountData(walletAddress, web3ProviderURL);
    }
    static async depositEtherToAave(amountOfEtherToBeDeposited, senderWalletPrivateKey, gasLimit, web3ProviderURL) {
        return aave_service_1.AaveService.depositEtherToAave(amountOfEtherToBeDeposited, senderWalletPrivateKey, gasLimit, web3ProviderURL);
    }
    static async borrowDAIFromAave(amountOfDAIToBeBorrowed, walletPrivateKey, gasLimit, web3ProviderURL) {
        return aave_service_1.AaveService.borrowDAIFromAave(amountOfDAIToBeBorrowed, walletPrivateKey, gasLimit, web3ProviderURL);
    }
    static async redeemAssetFromAave(walletAddress, walletPrivateKey, gasLimit, web3ProviderURL, amount) {
        return aave_service_1.AaveService.redeemAsset(walletAddress, walletPrivateKey, gasLimit, web3ProviderURL, amount);
    }
    static async getPriceDataWithTimeStamp(coinMarketCapAPIKey) {
        return coinmarketcap_service_1.CoinMarketCapService.getPriceDataWithTimeStamp(coinMarketCapAPIKey);
    }
    static async swapDAIToETH(amountOfDAIToBeSwapped, walletAddress, walletPrivateKey, web3ProviderURL) {
        await uniswap_service_1.UniSwapService.swapDAIToETH(amountOfDAIToBeSwapped, walletAddress, walletPrivateKey, web3ProviderURL);
    }
    static async startTheAutomatedManagedFund(walletAddress, walletPrivateKey, web3ProviderURL, healthFactorLimitForInvestmentRound, healthFactorLimitForRedemptionToStart, gasLimit, checkEachXMinutes) {
        return thug_life_service_1.ThugLifeService.startTheAutomatedManagedFund(walletAddress, walletPrivateKey, gasLimit, healthFactorLimitForInvestmentRound, healthFactorLimitForRedemptionToStart, web3ProviderURL, checkEachXMinutes);
    }
    static async getDyDxPerpetualAccountBalances(walletAddress) {
        return dydx_service_1.DyDxService.getPerpetualAccountBalances(walletAddress);
    }
}
exports.DeFiService = DeFiService;
