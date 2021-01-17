

import { aaveLendingPoolABI, addressProviderABI } from '../constants'

const Web3 = require('web3');

export class AaveService {

    public static aaveProviderContract: any
    public static lendingPoolAddress: any
    public static aaveLendingPoolContract: any
    public static web3Connection: any

    private static isReadyToPerform: boolean = false

    public static async getAccountData(walletAddress: string, web3ProviderURL: string): Promise<any> {

        await AaveService.initialize(web3ProviderURL)
        
        const userAccountData = await AaveService.aaveLendingPoolContract.methods.getUserAccountData(walletAddress).call()
        
        return userAccountData
    }
    
    
    public static async depositEtherToAave(amountOfEtherToBeDeposited: number, senderWalletPrivateKey: string, gasLimit: number, web3ProviderURL: string): Promise<void> {
        
        await AaveService.initialize(web3ProviderURL)

        AaveService.aaveLendingPoolContract.methods.deposit(
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

        await AaveService.initialize(web3ProviderURL)

        AaveService.aaveLendingPoolContract.methods.borrow(
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

        await AaveService.initialize(web3ProviderURL)
        // tbd
    }

    
    private static async initialize(web3ProviderURL: string): Promise<void> {
        if (AaveService.isReadyToPerform) {
            // everything is already set up
        } else {
            AaveService.web3Connection = new Web3(new Web3.providers.HttpProvider(web3ProviderURL));
            AaveService.aaveProviderContract = new AaveService.web3Connection.eth.Contract(addressProviderABI, "0x24a42fD28C976A61Df5D00D0599C34c4f90748c8");
            AaveService.lendingPoolAddress = await AaveService.aaveProviderContract.methods.getLendingPool().call()
            AaveService.aaveLendingPoolContract = new AaveService.web3Connection.eth.Contract(aaveLendingPoolABI, AaveService.lendingPoolAddress);
            AaveService.isReadyToPerform = true
        }
    }
}
