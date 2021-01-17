
import { IP2PExchangeTransaction, IStakeEntry, IWalletReputation } from "./interfaces";
const fsExtra = require('fs-extra')

export class StakingPool {

    private static stakeEntries: IStakeEntry[] = []
    private static walletReputations: IWalletReputation[] = []
    private static p2pExchangeTransactions: IP2PExchangeTransaction


    public static stakeETHAndMakeTransaction(walletAddress: string, amount: number, transactionInput: any) {
        const p2pExchangeTransactions: IP2PExchangeTransaction = StakingPool.getInitialTransaction()
        p2pExchangeTransactions.initiatingWalletAddress = walletAddress
        p2pExchangeTransactions.transactionInput = transactionInput

        const originalTransactionId =  '12345'

        return originalTransactionId
    }

    public static async repayStakedETHToSuccessfulContributorsAndVoters(transactionId: string): Promise<string> {
        const repaymentTransactionId =  'h725'

        return repaymentTransactionId
    }

    public static getWalletReputation(walletAddress: string): number {
        const entry = StakingPool.walletReputations.filter((entry: IWalletReputation) => entry.walletAddress === walletAddress)[0]
        if (entry === undefined){
            return 1 // this is the initial reputation score
        } else {
            return entry.reputation
        }
    }


    private static getInitialTransaction(): IP2PExchangeTransaction {

        return {
            initiatingWalletAddress: "",
            transactionId: "",
            timeStampTriggered: "",
            timestampFinalized: "",
            transactionInput: "",
            votes: [
                {
                    ups: 0,
                    downs: 0
                }
            ]
        }
    }


}