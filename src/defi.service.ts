import { CompoundService } from "./compound/compound.service";
import { EthereumService } from "./ethereum/ethereum.service";
import { CoinMarketCapService } from "./coinmarketcap/coinmarketcap.service"

export class DeFiService {

    public static async getGasPriceInfo(): Promise<any> {
        return EthereumService.getGasPriceInfo()
    }
    
    public static async getCompoundAccountData(walletAddress: string): Promise<any> {
        return CompoundService.getAccountData(walletAddress)
    }

    public static async getPriceDataWithTimeStamp(): Promise<any> {
        return CoinMarketCapService.getPriceDataWithTimeStamp()
    }

    public static async transferEther(fromWallet: string, toWallet: string, amountInETH: number): Promise<any> {
        return EthereumService.transferEther(fromWallet, toWallet, amountInETH, 'ensureYourPrivateKeyIsAlwaysSafe')
    }
}