"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const compliance_service_1 = require("../compliance/compliance.service");
const peer2peer_exchange_service_1 = require("./peer2peer.exchange.service");
describe("Peer2PeerExchangeService", () => {
    beforeEach(async () => {
        // not needed yet
    });
    it("lets you create a post and gives you a postCreationTransactionId", async () => {
        const walletAddress = '0XWalletAddress';
        const postCreationTransactionId = await peer2peer_exchange_service_1.Peer2PeerExchangeService.createAPost(walletAddress, "Give: A fancy DeFi Module");
        expect(postCreationTransactionId).toBe("12345");
    });
    it("gives you a reward if you voted in favor of the majority representing the community", async () => {
        const walletAddress = '0Xkvowieiowejfsdvmoi';
        await peer2peer_exchange_service_1.Peer2PeerExchangeService.vote(walletAddress, "12345", compliance_service_1.VOTING_DIRECTION.UP);
        const rewardTransactionId = await peer2peer_exchange_service_1.Peer2PeerExchangeService.rewardSuccessfulContributorsAndVoters("12345");
        expect(rewardTransactionId).toBe("h725");
    });
});
