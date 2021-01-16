

import { AaveWeb3Proxy } from './aave-web3-proxy';

export class AaveService {


    public static async getAccountData(walletAddress: string, web3ProviderURL: string): Promise<any> {

        await AaveWeb3Proxy.initialize(web3ProviderURL)

        const userAccountData = await AaveWeb3Proxy.aaveLendingPoolContract.methods.getUserAccountData(walletAddress).call()

        return userAccountData
    }


    public static async depositEtherToAave(amountOfEtherToBeDeposited: number, senderWalletPrivateKey: string, gasLimit: number): Promise<void> {
        AaveWeb3Proxy.aaveLendingPoolContract.methods.deposit(
            "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", amountOfEtherToBeDeposited, 0).send({ from: senderWalletPrivateKey, value: amountOfEtherToBeDeposited })
            .once('transactionHash', (hash: string) => {
                // transaction hash
            })
            .on('confirmation', (number: number, receipt: any) => {
                // number of confirmations
            })
            .on('error', (error: any) => {
                console.log(error);
            });
    }


    public static async borrowDAIFromAave(amountOfDAIToBeBorrowed: number, walletPrivateKey: string, gasLimit: number, web3ProviderURL: string): Promise<void> {

        AaveWeb3Proxy.aaveLendingPoolContract.methods.borrow(
            "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", amountOfDAIToBeBorrowed, 2, 0, process.env.ACCOUNT).send({ from: process.env.ACCOUNT, value: amountOfDAIToBeBorrowed })
            .once('transactionHash', (hash: string) => {
                console.log(hash)
                // transaction hash
            })
            .on('confirmation', (number: number, receipt: any) => {
                // number of confirmations
            })
            .on('error', (error: any) => {
                console.log(error);
            });

    }


    public static async redeemAsset(walletAddress: string, senderWalletPrivateKey: string, gasLimit: number, web3ProviderURL: string, amount?: number): Promise<void> {
        // tbd
    }
    
}
