export declare enum VOTING_DIRECTION {
    UP = 1,
    DOWN = 2
}
export declare class ComplianceService {
    static stakeETHAndMakeTransaction(walletAddress: string, amount: number): Promise<string>;
    static repayStakedETHToSuccessfulContributors(referredTransactioId: string): void;
    static voteOnTransaction(walletAddress: string, referredTransactioId: string, votingDirection: VOTING_DIRECTION): void;
}
