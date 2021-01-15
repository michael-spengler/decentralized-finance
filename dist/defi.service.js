"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeFiService = void 0;
const compound_service_1 = require("./compound/compound.service");
const ethereum_service_1 = require("./ethereum/ethereum.service");
const coinmarketcap_service_1 = require("./coinmarketcap/coinmarketcap.service");
const uniswap_service_1 = require("./uniswap/uniswap.service");
const erc20_service_1 = require("./ethereum/erc20.service");
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
    static async redeem(walletAddress, walletPrivateKey, gasLimit, web3ProviderURL) {
        const amountOfcETHInWallet = await erc20_service_1.ERC20Service.getBalanceOfcETHInWallet(walletAddress, walletPrivateKey);
        return compound_service_1.CompoundService.redeem(amountOfcETHInWallet, walletPrivateKey, gasLimit, web3ProviderURL);
    }
    static async getPriceDataWithTimeStamp() {
        return coinmarketcap_service_1.CoinMarketCapService.getPriceDataWithTimeStamp();
    }
    static async swapDAIToETH(amountOfDAIToBeSwapped, walletAddress, walletPrivateKey, web3ProviderURL) {
        await uniswap_service_1.UniSwapService.swapDAIToETH(amountOfDAIToBeSwapped, walletAddress, walletPrivateKey, web3ProviderURL);
    }
}
exports.DeFiService = DeFiService;
