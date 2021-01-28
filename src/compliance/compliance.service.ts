

// Experimental Mode - Trying things out here
// checke die legimität des posts an sich --> 24 h monatlich 1 h weniger bis 2 h



import { p2pStakingPoolAbi } from "../constants"
import { EthereumService } from "../ethereum/ethereum.service";
import { STAKING_POOL_TYPE, VOTING_DIRECTION } from "./interfaces";
import { StakingPool } from "./staking-pool";

const Web3 = require('web3');

let web3: any

export class ComplianceService {

    private stakingPoolType: STAKING_POOL_TYPE

    constructor(stakingPoolType: STAKING_POOL_TYPE) {
        this.stakingPoolType = stakingPoolType
    }

    public async stakeETHAndMakeTransaction(walletAddress: string, amount: number, transactionInput: any): Promise<string> {

        let referredTransactioId

        if (this.stakingPoolType === STAKING_POOL_TYPE.SOLIDITY_SMART_CONTRACT) {
            console.log("smart")
            if (web3 === undefined) {
                web3 = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER_URL));
            }
            
            const reputation = StakingPool.getWalletReputation(walletAddress)
            
            const currentEtherPriceInDAI = await EthereumService.getEtherPriceInDAI()
            
            
            const p2pStakingPoolAddress = 'to be entered after deployment on mainnet';
            
            const p2pStakingPoolContract = new web3.eth.Contract(p2pStakingPoolAbi, p2pStakingPoolAddress);
            referredTransactioId = await p2pStakingPoolContract.stakeETHAndMakeTransaction().call()
            
        } else if (this.stakingPoolType === STAKING_POOL_TYPE.TYPESCRIPT_PROGRAM) {
            
            console.log("typescript")
            const stakingAmount = 0.01 // e.g. Ether

            referredTransactioId = await StakingPool.stakeETHAndMakeTransaction(walletAddress, amount, transactionInput)

        }

        return referredTransactioId
    }

    public async repayStakedETHToSuccessfulContributorsAndVoters(referredTransactioId: string): Promise<any> {
        const rewardTransactionId = await StakingPool.repayStakedETHToSuccessfulContributorsAndVoters(referredTransactioId)

        return rewardTransactionId
    }

    public async voteOnTransaction(walletAddress: string, referredTransactioId: string, votingDirection: VOTING_DIRECTION, amount: number): Promise<string> {
        let votingTransactionID: string = ''
        if (this.stakingPoolType === STAKING_POOL_TYPE.SOLIDITY_SMART_CONTRACT) {
            console.log("voting via smart contract")
            votingTransactionID = 'tbd'
        } else if (this.stakingPoolType === STAKING_POOL_TYPE.TYPESCRIPT_PROGRAM ){
            console.log("voting via typescript")
            votingTransactionID = StakingPool.voteOnTransaction(walletAddress, referredTransactioId, votingDirection, amount)
        } else {
            throw new Error('unknown staking pool type')
        }

        return votingTransactionID
     
    }

}