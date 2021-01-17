import { STAKING_POOL_TYPE, VOTING_DIRECTION } from "./interfaces";
export declare class ComplianceService {
    private stakingPoolType;
    constructor(stakingPoolType: STAKING_POOL_TYPE);
    stakeETHAndMakeTransaction(walletAddress: string, amount: number, transactionInput: any): Promise<string>;
    repayStakedETHToSuccessfulContributorsAndVoters(referredTransactioId: string): Promise<any>;
    voteOnTransaction(walletAddress: string, referredTransactioId: string, votingDirection: VOTING_DIRECTION): Promise<string>;
}
