import { CompoundService } from "./compound/compound.service";


export class DeFiService {
    
    public static async getCompoundAccountData(walletAddress: string): Promise<any> {
        return CompoundService.getAccountData(walletAddress)
    }
}