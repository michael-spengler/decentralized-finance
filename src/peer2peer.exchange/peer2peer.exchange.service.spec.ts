

import { STAKING_POOL_TYPE, VOTING_DIRECTION } from "../compliance/interfaces"
import { Peer2PeerExchangeService } from "./peer2peer.exchange.service"

describe("Peer2PeerExchangeService", () => {
    
    let peer2PeerExchangeService: Peer2PeerExchangeService
    let postCreationTransactionId: string

    let walletAddressContentCreator: string
    let walletAddressVoter1: string
    let walletAddressVoter2: string
    let walletAddressVoter3: string

    beforeEach(async () => {
        peer2PeerExchangeService = new Peer2PeerExchangeService(STAKING_POOL_TYPE.TYPESCRIPT_PROGRAM)
    })

    it("lets you create a post and gives you a postCreationTransactionId", async () => {

        walletAddressContentCreator = '0x1234567890'
        postCreationTransactionId = await peer2PeerExchangeService.createAPost(walletAddressContentCreator, "Give: A fancy DeFi Module")

        expect(postCreationTransactionId).toBe("12345")

    })

    
    it("gives you a reward if you voted in favor of the majority representing the community", async () => {

        walletAddressVoter1 = '0Xkvowieiowejfsdvmod'
        walletAddressVoter2 = '0Xkvowieiowejfsdvmos'
        walletAddressVoter3 = '0Xkvowieiowejfsdvmoa'

        const votingTransactionId1 = await peer2PeerExchangeService.vote(walletAddressVoter1, postCreationTransactionId, VOTING_DIRECTION.UP)
        const votingTransactionId2 = await peer2PeerExchangeService.vote(walletAddressVoter2, postCreationTransactionId, VOTING_DIRECTION.DOWN)
        const votingTransactionId3 = await peer2PeerExchangeService.vote(walletAddressVoter3, postCreationTransactionId, VOTING_DIRECTION.UP)

        const actualRewardTransactionId = await peer2PeerExchangeService.rewardSuccessfulContributorsAndVoters(postCreationTransactionId)
        const expectedTransactionId = "ourfancyRepaymentTransactionIDh726"

        expect(actualRewardTransactionId).toBe(expectedTransactionId)

    })


})