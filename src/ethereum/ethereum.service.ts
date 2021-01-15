
import { priceFeedAbi } from "../constants"

const axios = require('axios')

const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER_URL));

export class EthereumService {

    public static async getGasPriceInfo(): Promise<any> {
        const gasPriceInfo = (await axios.get('https://ethgasstation.info/json/ethgasAPI.json')).data

        return gasPriceInfo
    }

    public static async getEtherPriceInDAI(): Promise<number> {

        const priceFeedAddress = '0x922018674c12a7f0d394ebeef9b58f186cde13c1';
        const priceFeed = new web3.eth.Contract(priceFeedAbi, priceFeedAddress);
        let priceInDAI = (await priceFeed.methods.price('ETH').call()) / 1000000;

        console.log(`According to the price feed address ${priceFeedAddress}: The price for Ether is about ${priceInDAI} DAI.`)

        return priceInDAI
    }


    public static async transferEther(fromWallet: string, toWallet: string, amountInETH: number, senderPrivateKey: string): Promise<any> {

        EthereumService.checkEnvironmentIsConfiguredProperly()

        const amountInWei = amountInETH * 1000000000000000000

        const transactionObject = await EthereumService.getTransactionObject(fromWallet, toWallet, amountInWei)

        await EthereumService.signAndSend(transactionObject, senderPrivateKey)
    }


    public static async signAndSend(transactionObject: any, senderPrivateKey: string) {

        const signedTransaction = await web3.eth.accounts.signTransaction(transactionObject, senderPrivateKey)

        web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
            .on('transactionHash', (hash: string) => {
                console.log(hash);
            })
            .on('receipt', (receipt: any) => {
                console.log(receipt);
            })
            .on('confirmation', (confirmationNumber: number, receipt: any) => {
                console.log(confirmationNumber);
                console.log(receipt);
            })
            .on('error', console.error)

    }


    public static async getTransactionObject(from: string, to: string, amountInWei: number) {

        const txCount = await web3.eth.getTransactionCount(from, "pending")
        const gasPrice = await web3.eth.getGasPrice()

        return {
            nonce: web3.utils.numberToHex(txCount),
            gasLimit: web3.utils.numberToHex(33000),
            gasPrice: web3.utils.toHex(gasPrice),
            from,
            to,
            value: amountInWei,
            chainId: '0x1',
        }

    }

    private static checkEnvironmentIsConfiguredProperly() {

        if (process.env.SENDER_WALLET_ADDRESS === undefined ||
            process.env.RECEIVER_WALLET_ADDRESS === undefined ||
            process.env.SENDER_WALLET_PRIVATE_KEY === undefined) {
            throw new Error('Copy the .env.template file to .env and ensure there is a valid value for SENDER_WALLET_ADDRESS, RECEIVER_WALLET_ADDRESS and SENDER_WALLET_PRIVATE_KEY')
        }

    }

}

