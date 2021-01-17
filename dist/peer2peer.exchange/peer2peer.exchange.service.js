"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Peer2PeerExchangeService = void 0;
const compliance_service_1 = require("../compliance/compliance.service");
const interfaces_1 = require("../compliance/interfaces");
class Peer2PeerExchangeService {
    constructor(stakingPoolType) {
        this.complianceService = new compliance_service_1.ComplianceService(stakingPoolType);
    }
    async createAPost(walletAddress, text) {
        const amount = this.getCurrentStakingAmountForPost();
        const transactionId = await this.complianceService.stakeETHAndMakeTransaction(walletAddress, amount, text);
        return transactionId;
    }
    async rewardSuccessfulContributorsAndVoters(postCreationTransactionId) {
        const rewardTransactionId = await this.complianceService.repayStakedETHToSuccessfulContributorsAndVoters(postCreationTransactionId);
        return rewardTransactionId;
    }
    async vote(walletAddress, postCreationTransactionId, votingDirection) {
        const votingTransactionID = await this.complianceService.voteOnTransaction(walletAddress, postCreationTransactionId, interfaces_1.VOTING_DIRECTION.UP);
        return votingTransactionID;
    }
    getCurrentStakingAmountForPost() {
        return 0.001;
    }
}
exports.Peer2PeerExchangeService = Peer2PeerExchangeService;
