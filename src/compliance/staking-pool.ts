
import { IP2PExchangeTransaction, IStakeEntry, IWalletReputation } from "./interfaces";
const fsExtra = require('fs-extra')

export class StakingPool {
    
    private static stakeEntries: IStakeEntry[] = []
    private static walletReputations: IWalletReputation[] = []
    private static p2pExchangeTransactions: IP2PExchangeTransaction
    
    
    public static stakeETHBeforeMakingATransaction() {
        return '12345'
    }

    public static getWalletReputation(walletAddress: string): number {
        return StakingPool.walletReputations.filter((entry: IWalletReputation) => entry.walletAddress === walletAddress )[0].reputation
    }
}