import { ERC20Service } from "../ethereum/erc20.service"

const Compound = require('@compound-finance/compound-js')

export class CompoundService {

    public static async getAccountData(walletAddress: string): Promise<any> {

        const account = await Compound.api.account({
            "addresses": walletAddress,
            "network": "mainnet"
        })

        return account.accounts[0]

    }


    public static async depositEtherToCompound(amountOfEtherToBeDeposited: number, senderWalletPrivateKey: string, gasLimit: number, web3ProviderURL: string): Promise<void> {

        const compound = new Compound(web3ProviderURL, {
            privateKey: senderWalletPrivateKey,
        })

        const trxOptions = { gasLimit, mantissa: false }

        try {
            const trx = await compound.supply(Compound.ETH, amountOfEtherToBeDeposited, trxOptions)
            console.log(`You can check the deposit to compound transaction at https://etherscan.io/tx/${trx.hash}`)
        } catch (error) {
            console.log(`Something went wrong while depositing Ether to compound.finance: ${error.message}`)
        }

    }


    public static async borrowDAIFromCompound(amountOfDAIToBeBorrowed: number, walletPrivateKey: string, gasLimit: number, web3ProviderURL: string): Promise<void> {

        const compound = new Compound(web3ProviderURL, {
            privateKey: walletPrivateKey,
        })

        const daiScaledUp = amountOfDAIToBeBorrowed * 1000000000000000000
        const trxOptions = { gasLimit, mantissa: true }

        try {
            const trx = await compound.borrow(Compound.DAI, daiScaledUp, trxOptions)
            console.log(`You can check the borrow dai from compound transaction at https://etherscan.io/tx/${trx.hash}`)
        } catch (error) {
            console.log(`Something went wrong while depositing Ether to compound.finance: ${error.message}`)
        }

    }

    
    public static async redeemAsset(walletAddress: string, senderWalletPrivateKey: string, gasLimit: number, web3ProviderURL: string, amount?: number): Promise<void> {

        const amountOfcETHInWallet = await ERC20Service.getBalanceOfcETHInWallet(walletAddress, senderWalletPrivateKey, web3ProviderURL)
        
        const amountToBeRedeemed = (amount === undefined) ?
            (amountOfcETHInWallet * 0.33) : // if no amount is specified we redeem about one third - this turned out to make sense e.g. for the ThugLifeService
            amount


        const compound = new Compound(web3ProviderURL, {
            privateKey: senderWalletPrivateKey,
        })

        try {
            const trx = await compound.redeem(Compound.cETH, amountToBeRedeemed)
            console.log(`You can check the redemption transaction at https://etherscan.io/tx/${trx.hash}`)
        } catch (error) {
            console.log(`Something went wrong while redeeming a borrowing from compound.finance: ${error.message}`)
        }

    }
}