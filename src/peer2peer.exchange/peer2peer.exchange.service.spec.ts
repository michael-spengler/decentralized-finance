

import { STAKING_POOL_TYPE, VOTING_DIRECTION } from "../compliance/interfaces"
import { Peer2PeerExchangeService } from "./peer2peer.exchange.service"

describe("Peer2PeerExchangeService", () => {
    
    let peer2PeerExchangeService: Peer2PeerExchangeService
    beforeEach(async () => {
        peer2PeerExchangeService = new Peer2PeerExchangeService(STAKING_POOL_TYPE.TYPESCRIPT_PROGRAM)
    })

    it("lets you create a post and gives you a postCreationTransactionId", async () => {

        const walletAddress = '0XWalletAddress'
        const postCreationTransactionId = await peer2PeerExchangeService.createAPost(walletAddress, "Give: A fancy DeFi Module")

        expect(postCreationTransactionId).toBe("12345")

    })

    
    it("gives you a reward if you voted in favor of the majority representing the community", async () => {

        const walletAddress1 = '0Xkvowieiowejfsdvmod'
        const walletAddress2 = '0Xkvowieiowejfsdvmos'
        const walletAddress3 = '0Xkvowieiowejfsdvmoa'

        const votingTransactionId1 = await peer2PeerExchangeService.vote(walletAddress1, "12345", VOTING_DIRECTION.UP)
        const votingTransactionId2 = await peer2PeerExchangeService.vote(walletAddress2, "12345", VOTING_DIRECTION.DOWN)
        const votingTransactionId3 = await peer2PeerExchangeService.vote(walletAddress3, "12345", VOTING_DIRECTION.UP)

        console.log(`votingTransactionId1: ${votingTransactionId1}`)
        console.log(`votingTransactionId2: ${votingTransactionId2}`)
        console.log(`votingTransactionId3: ${votingTransactionId3}`)

        const rewardTransactionId = await peer2PeerExchangeService.rewardSuccessfulContributorsAndVoters("12345")
        
        expect(rewardTransactionId).toBe("h725")

    })


})