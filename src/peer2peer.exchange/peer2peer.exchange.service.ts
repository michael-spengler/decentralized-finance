import { VOTING_DIRECTION } from "../compliance/compliance.service";
import { ComplianceServiceDouble } from "../compliance/compliance.service.double";

export class Peer2PeerExchangeService {
    
    public static async createAPost(walletAddress: string, text: string): Promise<string> {
        const amount = Peer2PeerExchangeService.getCurrentStakingAmountForPost()
        const transactionId = await ComplianceServiceDouble.stakeETHAndMakeTransaction(walletAddress, amount, text)

        return transactionId
    }

    public static async rewardSuccessfulContributorsAndVoters(postCreationTransactionId: string): Promise<string> {
        const rewardTransactionId = await ComplianceServiceDouble.repayStakedETHToSuccessfulContributorsAndVoters(postCreationTransactionId)
        
        return rewardTransactionId
    }
    

    public static async vote(walletAddress: string, postCreationTransactionId: string, votingDirection: VOTING_DIRECTION): Promise<string> {
        const votingTransactionID = await ComplianceServiceDouble.voteOnTransaction(walletAddress, postCreationTransactionId, VOTING_DIRECTION.UP)

        return votingTransactionID
    }

    public static getCurrentStakingAmountForPost(): number {
        return 0.001 
    }
    
}