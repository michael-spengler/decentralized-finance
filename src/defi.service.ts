import { CompoundService } from "./compound/compound.service";
import { EthereumService } from "./ethereum/ethereum.service";
import { CoinMarketCapService } from "./coinmarketcap/coinmarketcap.service"
import { UniSwapService } from "./uniswap/uniswap.service";
import { ERC20Service } from "./ethereum/erc20.service";
import { ThugLifeService } from "./thug-life-investments/thug-life.service";

export class DeFiService {

    public static async getGasPriceInfo(): Promise<any> {
        return EthereumService.getGasPriceInfo()
    }

    public static async transferEther(fromWallet: string, toWallet: string, amountInETH: number): Promise<any> {
        return EthereumService.transferEther(fromWallet, toWallet, amountInETH, 'ensureYourPrivateKeyIsAlwaysSafe')
    }

    public static async getCompoundAccountData(walletAddress: string): Promise<any> {
        return CompoundService.getAccountData(walletAddress)
    }

    public static async depositEtherToCompound(amountOfEtherToBeDeposited: number, senderWalletPrivateKey: string, gasLimit: number, web3ProviderURL: string): Promise<void> {
        return CompoundService.depositEtherToCompound(amountOfEtherToBeDeposited, senderWalletPrivateKey, gasLimit, web3ProviderURL)
    }

    public static async borrowDAIFromCompound(amountOfDAIToBeBorrowed: number, walletPrivateKey: string, gasLimit: number, web3ProviderURL: string) {
        return CompoundService.borrowDAIFromCompound(amountOfDAIToBeBorrowed, walletPrivateKey, gasLimit, web3ProviderURL)
    }

    public static async redeemAssetFromCompound(walletAddress: string, walletPrivateKey: string, gasLimit: number, web3ProviderURL: string, amount?: number) {
        return CompoundService.redeemAsset(walletAddress, walletPrivateKey, gasLimit, web3ProviderURL, amount)
    }

    public static async getPriceDataWithTimeStamp(): Promise<any> {
        return CoinMarketCapService.getPriceDataWithTimeStamp()
    }

    public static async swapDAIToETH(amountOfDAIToBeSwapped: number, walletAddress: string, walletPrivateKey: string, web3ProviderURL: string): Promise<void> {
        await UniSwapService.swapDAIToETH(amountOfDAIToBeSwapped, walletAddress, walletPrivateKey, web3ProviderURL)
    }

    public static async startTheAutomatedManagedFund(walletAddress: string, walletPrivateKey: string, web3ProviderURL: string, healthFactorLimitForInvestmentRound: number, healthFactorLimitForRedemptionToStart: number, gasLimit: number): Promise<any> {
        return ThugLifeService.startTheAutomatedManagedFund(walletAddress, walletPrivateKey, gasLimit, healthFactorLimitForInvestmentRound, healthFactorLimitForRedemptionToStart, web3ProviderURL)
    }

}