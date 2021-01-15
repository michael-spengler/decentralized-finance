"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERC20Service = void 0;
const ethers_1 = require("ethers");
const constants_1 = require("../constants");
class ERC20Service {
    static async getBalanceOfERC20TokenInWallet(walletAddress, walletPrivateKey, tokenAddress, web3ProviderURL) {
        const provider = ethers_1.ethers.getDefaultProvider('mainnet', { infura: web3ProviderURL });
        const signer = new ethers_1.ethers.Wallet(walletPrivateKey);
        const account = signer.connect(provider);
        const daiSmartContract = new ethers_1.ethers.Contract(tokenAddress, constants_1.erc20Abi, account);
        const balanceOfDaiOnAccount = await daiSmartContract.balanceOf(walletAddress);
        const balanceScaledDown = balanceOfDaiOnAccount / 1000000000000000000;
        console.log(`balance of DAI on account: ${balanceScaledDown}`);
        return balanceScaledDown;
    }
    static async getBalanceOfDAIInWallet(walletAddress, walletPrivateKey, web3ProviderURL) {
        const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
        return ERC20Service.getBalanceOfERC20TokenInWallet(walletAddress, walletPrivateKey, daiAddress, web3ProviderURL);
    }
    static async getBalanceOfcETHInWallet(walletAddress, walletPrivateKey, web3ProviderURL) {
        const cETHAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5';
        return ERC20Service.getBalanceOfERC20TokenInWallet(walletAddress, walletPrivateKey, cETHAddress, web3ProviderURL);
    }
}
exports.ERC20Service = ERC20Service;
