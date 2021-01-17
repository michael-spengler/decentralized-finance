

import { VOTING_DIRECTION } from "../compliance/compliance.service"
import { Peer2PeerExchangeService } from "./peer2peer.exchange.service"

describe("Peer2PeerExchangeService", () => {
    beforeEach(async () => {
        // not needed yet

    })

    it("lets you create a post and gives you a postCreationTransactionId", async () => {

        const walletAddress = '0XWalletAddress'
        const postCreationTransactionId = await Peer2PeerExchangeService.createAPost(walletAddress, "Give: A fancy DeFi Module")
        expect(postCreationTransactionId).toBe("12345")

    })

    
    it("gives you a reward if you voted in favor of the majority representing the community", async () => {

        const walletAddress = '0Xkvowieiowejfsdvmoi'
        await Peer2PeerExchangeService.vote(walletAddress, "12345", VOTING_DIRECTION.UP)

        const rewardTransactionId = await Peer2PeerExchangeService.rewardSuccessfulContributorsAndVoters("12345")
        expect(rewardTransactionId).toBe("h725")

    })


})