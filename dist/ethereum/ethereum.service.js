"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthereumService = void 0;
const axios = require('axios');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER_URL));
class EthereumService {
    static async getGasPriceInfo() {
        const gasPriceInfo = (await axios.get('https://ethgasstation.info/json/ethgasAPI.json')).data;
        return gasPriceInfo;
    }
    static async transferEther(fromWallet, toWallet, amountInETH, senderPrivateKey) {
        const amountInWei = amountInETH * 1000000000000000000; // this would e.g. transfer 0.01 Ether
        const transactionObject = await EthereumService.getTransactionObject(fromWallet, toWallet, amountInWei);
        await EthereumService.signAndSend(transactionObject, senderPrivateKey);
    }
    static async signAndSend(transactionObject, senderPrivateKey) {
        const signedTransaction = await web3.eth.accounts.signTransaction(transactionObject, senderPrivateKey);
        web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
            .on('transactionHash', (hash) => {
            console.log(hash);
        })
            .on('receipt', (receipt) => {
            console.log(receipt);
        })
            .on('confirmation', (confirmationNumber, receipt) => {
            console.log(confirmationNumber);
            console.log(receipt);
        })
            .on('error', console.error);
    }
    static async getTransactionObject(from, to, amountInWei) {
        const txCount = await web3.eth.getTransactionCount(from, "pending");
        const gasPrice = await web3.eth.getGasPrice();
        return {
            nonce: web3.utils.numberToHex(txCount),
            gasLimit: web3.utils.numberToHex(33000),
            gasPrice: web3.utils.toHex(gasPrice),
            from,
            to,
            value: amountInWei,
            chainId: '0x1',
        };
    }
}
exports.EthereumService = EthereumService;
