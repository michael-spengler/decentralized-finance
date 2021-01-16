"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AaveService = void 0;
const aave_web3_proxy_1 = require("./aave-web3-proxy");
class AaveService {
    static async getAccountData(walletAddress, web3ProviderURL) {
        await aave_web3_proxy_1.AaveWeb3Proxy.initialize(web3ProviderURL);
        const userAccountData = await aave_web3_proxy_1.AaveWeb3Proxy.aaveLendingPoolContract.methods.getUserAccountData(walletAddress).call();
        return userAccountData;
    }
    static async depositEtherToAave(amountOfEtherToBeDeposited, senderWalletPrivateKey, gasLimit) {
        aave_web3_proxy_1.AaveWeb3Proxy.aaveLendingPoolContract.methods.deposit("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", amountOfEtherToBeDeposited, 0).send({ from: senderWalletPrivateKey, value: amountOfEtherToBeDeposited })
            .once('transactionHash', (hash) => {
            // transaction hash
        })
            .on('confirmation', (number, receipt) => {
            // number of confirmations
        })
            .on('error', (error) => {
            console.log(error);
        });
    }
    static async borrowDAIFromAave(amountOfDAIToBeBorrowed, walletPrivateKey, gasLimit, web3ProviderURL) {
        aave_web3_proxy_1.AaveWeb3Proxy.aaveLendingPoolContract.methods.borrow("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", amountOfDAIToBeBorrowed, 2, 0, process.env.ACCOUNT).send({ from: process.env.ACCOUNT, value: amountOfDAIToBeBorrowed })
            .once('transactionHash', (hash) => {
            console.log(hash);
            // transaction hash
        })
            .on('confirmation', (number, receipt) => {
            // number of confirmations
        })
            .on('error', (error) => {
            console.log(error);
        });
    }
    static async redeemAsset(walletAddress, senderWalletPrivateKey, gasLimit, web3ProviderURL, amount) {
        // tbd
    }
}
exports.AaveService = AaveService;
