import { STAKING_POOL_TYPE, VOTING_DIRECTION } from "../compliance/interfaces";
export declare class Peer2PeerExchangeService {
    private complianceService;
    constructor(stakingPoolType: STAKING_POOL_TYPE);
    createAPost(walletAddress: string, text: string): Promise<string>;
    rewardSuccessfulContributorsAndVoters(postCreationTransactionId: string): Promise<string>;
    vote(walletAddress: string, postCreationTransactionId: string, votingDirection: VOTING_DIRECTION): Promise<string>;
    getCurrentStakingAmountForPost(): number;
}
