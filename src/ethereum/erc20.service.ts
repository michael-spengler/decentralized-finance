
import { ethers } from "ethers"
import { erc20Abi } from "../constants"

const provider = ethers.getDefaultProvider('mainnet', { infura: web3ProviderURL })

export class ERC20Service {

    public static async getBalanceOfERC20TokenInWallet(walletAddress: string, walletPrivateKey: string, tokenAddress: string): Promise<number> {

        const signer = new ethers.Wallet(walletPrivateKey)
        const account = signer.connect(provider)

        const daiSmartContract = new ethers.Contract(tokenAddress, erc20Abi, account)
        const balanceOfDaiOnAccount = await daiSmartContract.balanceOf(walletAddress)

        const balanceScaledDown = balanceOfDaiOnAccount / 1000000000000000000
        console.log(`balance of DAI on account: ${balanceScaledDown}`)

        return balanceScaledDown

    }

    public static async getBalanceOfDAIInWallet(walletAddress: string, walletPrivateKey: string): Promise<number> {
        
        const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'

        return ERC20Service.getBalanceOfERC20TokenInWallet(walletAddress, walletPrivateKey, daiAddress)

    }


    public static async getBalanceOfcETHInWallet(walletAddress: string, walletPrivateKey: string): Promise<number>{
        const cETHAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5'

        return ERC20Service.getBalanceOfERC20TokenInWallet(walletAddress, walletPrivateKey, cETHAddress)
    }
}