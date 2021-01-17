
import { p2pStakingPoolAbi } from "../constants"
import { EthereumService } from "../ethereum/ethereum.service";
import { StakingPool } from "./staking-pool";

const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER_URL));

export enum VOTING_DIRECTION {
    UP = 1,
    DOWN = 2
} 
export class ComplianceService {
    
    // checke die legimität des posts an sich --> 24 h monatlich 1 h weniger bis 2 h

    public static async stakeETHAndMakeTransaction(walletAddress: string, amount: number): Promise<string> {

        const reputation = StakingPool.getWalletReputation(walletAddress) 

        const currentEtherPriceInDAI = await EthereumService.getEtherPriceInDAI()

        const stakingAmount = 0.01 // e.g. Ether

        const p2pStakingPoolAddress = 'to be entered after deployment on mainnet';

        const p2pStakingPoolContract = new web3.eth.Contract(p2pStakingPoolAbi, p2pStakingPoolAddress);
        const referredTransactioId = await p2pStakingPoolContract.stakeETHAndMakeTransaction().call()

        return referredTransactioId
    }

    public static repayStakedETHToSuccessfulContributors(referredTransactioId: string) {
        // tbd
    }

    public static voteOnTransaction(walletAddress: string, referredTransactioId: string, votingDirection: VOTING_DIRECTION) {
        // tbd
    }

}