import { ComplianceService } from "../compliance/compliance.service"
import { STAKING_POOL_TYPE, VOTING_DIRECTION } from "../compliance/interfaces"

export class Peer2PeerExchangeService {

    private complianceService: ComplianceService

    constructor(stakingPoolType: STAKING_POOL_TYPE) {
        this.complianceService = new ComplianceService(stakingPoolType)
    }
    public async createAPost(walletAddress: string, text: string): Promise<string> {
        const amount = this.getCurrentStakingAmountForPost()
        const transactionId = await this.complianceService.stakeETHAndMakeTransaction(walletAddress, amount, text)

        return transactionId
    }

    public async rewardSuccessfulContributorsAndVoters(postCreationTransactionId: string): Promise<string> {
        const rewardTransactionId = await this.complianceService.repayStakedETHToSuccessfulContributorsAndVoters(postCreationTransactionId)

        return rewardTransactionId
    }


    public async vote(walletAddress: string, postCreationTransactionId: string, votingDirection: VOTING_DIRECTION): Promise<string> {
        const votingTransactionID = await this.complianceService.voteOnTransaction(walletAddress, postCreationTransactionId, VOTING_DIRECTION.UP)

        return votingTransactionID
    }

    public getCurrentStakingAmountForPost(): number {
        return 0.001
    }

}