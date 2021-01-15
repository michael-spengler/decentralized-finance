"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompoundService = void 0;
const erc20_service_1 = require("../ethereum/erc20.service");
const Compound = require('@compound-finance/compound-js');
class CompoundService {
    static async getAccountData(walletAddress) {
        const account = await Compound.api.account({
            "addresses": walletAddress,
            "network": "mainnet"
        });
        return account.accounts[0];
    }
    static async depositEtherToCompound(amountOfEtherToBeDeposited, senderWalletPrivateKey, gasLimit, web3ProviderURL) {
        const compound = new Compound(web3ProviderURL, {
            privateKey: senderWalletPrivateKey,
        });
        const trxOptions = { gasLimit, mantissa: false };
        try {
            const trx = await compound.supply(Compound.ETH, amountOfEtherToBeDeposited, trxOptions);
            console.log(`You can check the deposit to compound transaction at https://etherscan.io/tx/${trx.hash}`);
        }
        catch (error) {
            console.log(`Something went wrong while depositing Ether to compound.finance: ${error.message}`);
        }
    }
    static async borrowDAIFromCompound(amountOfDAIToBeBorrowed, walletPrivateKey, gasLimit, web3ProviderURL) {
        const compound = new Compound(web3ProviderURL, {
            privateKey: walletPrivateKey,
        });
        const daiScaledUp = amountOfDAIToBeBorrowed * 1000000000000000000;
        const trxOptions = { gasLimit, mantissa: true };
        try {
            const trx = await compound.borrow(Compound.DAI, daiScaledUp, trxOptions);
            console.log(`You can check the borrow dai from compound transaction at https://etherscan.io/tx/${trx.hash}`);
        }
        catch (error) {
            console.log(`Something went wrong while depositing Ether to compound.finance: ${error.message}`);
        }
    }
    static async redeemAsset(walletAddress, senderWalletPrivateKey, gasLimit, web3ProviderURL, amount) {
        const amountOfcETHInWallet = await erc20_service_1.ERC20Service.getBalanceOfcETHInWallet(walletAddress, senderWalletPrivateKey, web3ProviderURL);
        const amountToBeRedeemed = (amount === undefined) ?
            (amountOfcETHInWallet * 0.33) : // if no amount is specified we redeem about one third - this turned out to make sense e.g. for the ThugLifeService
            amount;
        const compound = new Compound(web3ProviderURL, {
            privateKey: senderWalletPrivateKey,
        });
        try {
            const trx = await compound.redeem(Compound.cETH, amountToBeRedeemed);
            console.log(`You can check the redemption transaction at https://etherscan.io/tx/${trx.hash}`);
        }
        catch (error) {
            console.log(`Something went wrong while redeeming a borrowing from compound.finance: ${error.message}`);
        }
    }
}
exports.CompoundService = CompoundService;
