
import { ethers } from "ethers"
import { erc20Abi } from "../constants"

export class ERC20Service {

    public static async getBalanceOfERC20TokenInWallet(walletAddress: string, walletPrivateKey: string, tokenAddress: string, web3ProviderURL: string): Promise<number> {

        const provider = ethers.getDefaultProvider('mainnet', { infura: web3ProviderURL })
        const signer = new ethers.Wallet(walletPrivateKey)
        const account = signer.connect(provider)

        const daiSmartContract = new ethers.Contract(tokenAddress, erc20Abi, account)
        const balanceOfDaiOnAccount = await daiSmartContract.balanceOf(walletAddress)

        const balanceScaledDown = balanceOfDaiOnAccount / 1000000000000000000
        console.log(`balance of DAI on account: ${balanceScaledDown}`)

        return balanceScaledDown

    }

    public static async getBalanceOfDAIInWallet(walletAddress: string, walletPrivateKey: string, web3ProviderURL: string): Promise<number> {
        
        const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'

        return ERC20Service.getBalanceOfERC20TokenInWallet(walletAddress, walletPrivateKey, daiAddress, web3ProviderURL)

    }


    public static async getBalanceOfcETHInWallet(walletAddress: string, walletPrivateKey: string, web3ProviderURL: string): Promise<number>{
        const cETHAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5'

        return ERC20Service.getBalanceOfERC20TokenInWallet(walletAddress, walletPrivateKey, cETHAddress, web3ProviderURL)
    }

    public static async getBalanceOfBATInWallet(walletAddress: string, walletPrivateKey: string, web3ProviderURL: string): Promise<number>{
        const batAddress = '0x0d8775f648430679a709e98d2b0cb6250d2887ef'

        return ERC20Service.getBalanceOfERC20TokenInWallet(walletAddress, walletPrivateKey, batAddress, web3ProviderURL)
    }

    public static async getBalanceOfLINKInWallet(walletAddress: string, walletPrivateKey: string, web3ProviderURL: string): Promise<number>{
        const linkAddress = '0x514910771af9ca656af840dff83e8264ecf986ca'

        return ERC20Service.getBalanceOfERC20TokenInWallet(walletAddress, walletPrivateKey, linkAddress, web3ProviderURL)
    }
    
}