import { ERC20Service } from "../ethereum/erc20.service"

export class AaveService {

    public static async getAccountData(walletAddress: string): Promise<any> {
        // tbd
    }


    public static async depositEtherToAave(amountOfEtherToBeDeposited: number, senderWalletPrivateKey: string, gasLimit: number, web3ProviderURL: string): Promise<void> {
        // tbd
    }


    public static async borrowDAIFromAave(amountOfDAIToBeBorrowed: number, walletPrivateKey: string, gasLimit: number, web3ProviderURL: string): Promise<void> {
        // tbd
    }


    public static async redeemAsset(walletAddress: string, senderWalletPrivateKey: string, gasLimit: number, web3ProviderURL: string, amount?: number): Promise<void> {
        // tbd
    }
}