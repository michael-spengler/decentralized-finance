import { VOTING_DIRECTION } from "../compliance/compliance.service";
export declare class Peer2PeerExchangeService {
    static createAPost(walletAddress: string, text: string): Promise<string>;
    static rewardSuccessfulContributorsAndVoters(postCreationTransactionId: string): Promise<string>;
    static vote(walletAddress: string, postCreationTransactionId: string, votingDirection: VOTING_DIRECTION): Promise<string>;
    static getCurrentStakingAmountForPost(): number;
}
