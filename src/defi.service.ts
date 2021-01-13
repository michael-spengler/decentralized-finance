import { CompoundService } from "./compound/compound.service";
import { EthereumService } from "./ethereum/ethereum.service";


export class DeFiService {

    public static async getGasPriceInfo(): Promise<any> {
        return EthereumService.getGasPriceInfo()
    }
    
    public static async getCompoundAccountData(walletAddress: string): Promise<any> {
        return CompoundService.getAccountData(walletAddress)
    }
}