
const Compound = require('@compound-finance/compound-js');

export class CompoundService {

    public static async getAccountData(walletAddress: string): Promise<any> {

        const account = await Compound.api.account({
            "addresses": walletAddress, 
            "network": "mainnet"
        });
        
        return account.accounts[0]
    }

}