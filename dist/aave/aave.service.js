"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AaveService = void 0;
const constants_1 = require("../constants");
const Web3 = require('web3');
class AaveService {
    static async getAccountData(walletAddress, web3ProviderURL) {
        await AaveService.initialize(web3ProviderURL);
        const userAccountData = await AaveService.aaveLendingPoolContract.methods.getUserAccountData(walletAddress).call();
        return userAccountData;
    }
    static async depositEtherToAave(amountOfEtherToBeDeposited, senderWalletPrivateKey, gasLimit, web3ProviderURL) {
        await AaveService.initialize(web3ProviderURL);
        AaveService.aaveLendingPoolContract.methods.deposit("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", amountOfEtherToBeDeposited, 0).send({ from: senderWalletPrivateKey, value: amountOfEtherToBeDeposited })
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
        await AaveService.initialize(web3ProviderURL);
        AaveService.aaveLendingPoolContract.methods.borrow("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", amountOfDAIToBeBorrowed, 2, 0, process.env.ACCOUNT).send({ from: process.env.ACCOUNT, value: amountOfDAIToBeBorrowed })
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
        await AaveService.initialize(web3ProviderURL);
        // tbd
    }
    static async initialize(web3ProviderURL) {
        if (AaveService.isReadyToPerform) {
            // everything is already set up
        }
        else {
            AaveService.web3Connection = new Web3(new Web3.providers.HttpProvider(web3ProviderURL));
            AaveService.aaveProviderContract = new AaveService.web3Connection.eth.Contract(constants_1.addressProviderABI, "0x24a42fD28C976A61Df5D00D0599C34c4f90748c8");
            AaveService.lendingPoolAddress = await AaveService.aaveProviderContract.methods.getLendingPool().call();
            AaveService.aaveLendingPoolContract = new AaveService.web3Connection.eth.Contract(constants_1.aaveLendingPoolABI, AaveService.lendingPoolAddress);
            AaveService.isReadyToPerform = true;
        }
    }
}
exports.AaveService = AaveService;
AaveService.isReadyToPerform = false;
