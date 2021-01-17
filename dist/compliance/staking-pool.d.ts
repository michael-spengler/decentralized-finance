export declare class StakingPool {
    private static stakeEntries;
    private static walletReputations;
    private static p2pExchangeTransactions;
    static stakeETHBeforeMakingATransaction(): string;
    static getWalletReputation(walletAddress: string): number;
}
