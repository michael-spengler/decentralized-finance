export declare enum VOTING_DIRECTION {
    UP = 1,
    DOWN = 2
}
export declare class ComplianceServiceDouble {
    static stakeETHAndMakeTransaction(walletAddress: string, stakingAmount: number, transactionInput: any): Promise<string>;
    static repayStakedETHToSuccessfulContributorsAndVoters(referredTransactioId: string): Promise<any>;
    static voteOnTransaction(walletAddress: string, referredTransactioId: string, votingDirection: VOTING_DIRECTION): Promise<string>;
}
