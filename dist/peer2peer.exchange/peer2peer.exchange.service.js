"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Peer2PeerExchangeService = void 0;
const compliance_service_1 = require("../compliance/compliance.service");
const compliance_service_double_1 = require("../compliance/compliance.service.double");
class Peer2PeerExchangeService {
    static async createAPost(walletAddress, text) {
        const amount = Peer2PeerExchangeService.getCurrentStakingAmountForPost();
        const transactionId = await compliance_service_double_1.ComplianceServiceDouble.stakeETHAndMakeTransaction(walletAddress, amount, text);
        return transactionId;
    }
    static async rewardSuccessfulContributorsAndVoters(postCreationTransactionId) {
        const rewardTransactionId = await compliance_service_double_1.ComplianceServiceDouble.repayStakedETHToSuccessfulContributorsAndVoters(postCreationTransactionId);
        return rewardTransactionId;
    }
    static async vote(walletAddress, postCreationTransactionId, votingDirection) {
        const votingTransactionID = await compliance_service_double_1.ComplianceServiceDouble.voteOnTransaction(walletAddress, postCreationTransactionId, compliance_service_1.VOTING_DIRECTION.UP);
        return votingTransactionID;
    }
    static getCurrentStakingAmountForPost() {
        return 0.001;
    }
}
exports.Peer2PeerExchangeService = Peer2PeerExchangeService;
