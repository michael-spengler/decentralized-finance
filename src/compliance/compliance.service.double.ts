
// import { EthereumService } from "../ethereum/ethereum.service";
import { StakingPool } from "./staking-pool";

// const Web3 = require('web3');

// const web3 = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER_URL));

export enum VOTING_DIRECTION {
    UP = 1,
    DOWN = 2
} 
export class ComplianceServiceDouble {
    
    // checke die legimität des posts an sich --> 24 h monatlich 1 h weniger bis 2 h

    public static async stakeETHAndMakeTransaction(walletAddress: string, stakingAmount: number, transactionInput: any): Promise<string> {

        const reputation =  StakingPool.getWalletReputation(walletAddress) 

        // const currentEtherPriceInDAI = await EthereumService.getEtherPriceInDAI()

        const referredTransactionId = StakingPool.stakeETHAndMakeTransaction(walletAddress, stakingAmount, transactionInput)

        return referredTransactionId
        
    }

    public static async repayStakedETHToSuccessfulContributorsAndVoters(referredTransactioId: string): Promise<any> {
        const rewardTransactionId = await StakingPool.repayStakedETHToSuccessfulContributorsAndVoters(referredTransactioId)
        
        return rewardTransactionId
    }

    public static async voteOnTransaction(walletAddress: string, referredTransactioId: string, votingDirection: VOTING_DIRECTION): Promise<string> {
        return 'h726'
    }
}