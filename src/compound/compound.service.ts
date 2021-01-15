


const Compound = require('@compound-finance/compound-js');

export class CompoundService {

    public static async getAccountData(walletAddress: string): Promise<any> {

        const account = await Compound.api.account({
            "addresses": walletAddress,
            "network": "mainnet"
        });

        return account.accounts[0]
    }


    public static async depositEtherToCompound(amountOfEtherToBeDeposited: number, senderWalletAddress: string, senderWalletPrivateKey: string, web3ProviderURL: string): Promise<void> {
        
        const compound = new Compound(web3ProviderURL, {
            privateKey: senderWalletPrivateKey,
        });

        try {
            const trx = await compound.supply(Compound.ETH, amountOfEtherToBeDeposited);
            console.log(`You can check the deposit to compound transaction at https://etherscan.io/tx/${trx.hash}`);
        } catch (error) {
            console.log('Something went wrong while depositing Ether to compound.finance')
        }

    }

}