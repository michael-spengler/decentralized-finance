import { CompoundService } from "./compound/compound.service";
import { EthereumService } from "./ethereum/ethereum.service";
import { CoinMarketCapService } from "./coinmarketcap/coinmarketcap.service"

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

    public static async getPriceDataWithTimeStamp(): Promise<any> {
        return CoinMarketCapService.getPriceDataWithTimeStamp()
    }

}