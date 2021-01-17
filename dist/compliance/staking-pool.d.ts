export declare class StakingPool {
    private static stakeEntries;
    private static walletReputations;
    private static p2pExchangeTransactions;
    static stakeETHAndMakeTransaction(walletAddress: string, amount: number, transactionInput: any): string;
    static repayStakedETHToSuccessfulContributorsAndVoters(transactionId: string): Promise<string>;
    static getWalletReputation(walletAddress: string): number;
    private static getInitialTransaction;
}
