
import { IStakeEntry, IWalletReputation } from "./interfaces";

import { EthereumService } from "../ethereum/ethereum.service";

const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER_URL));

export enum VOTING_DIRECTION {
    up = 1,
    down = 2
} 
export class ComplianceServiceDouble {
    
    // checke die legimität des posts an sich --> 24 h monatlich 1 h weniger bis 2 h

    public static walletReputations: IWalletReputation[] = []

    public static async stakeETHBeforeMakingATransaction(walletAddress: string, amount: number): Promise<string> {

        const reputation = ComplianceServiceDouble.walletReputations.filter((entry: IWalletReputation) => entry.walletAddress === walletAddress )[0].reputation

        const currentEtherPriceInDAI = await EthereumService.getEtherPriceInDAI()

        const stakingAmount = 0.01 // e.g. Ether

        const referredTransactioId = ComplianceServiceDouble.stakeETHBeforeMakingATransaction('asdfökl', 1000)

        return referredTransactioId
    }

    public static repayStakedETHToSuccessfulContributors(referredTransactioId: string) {
        // tbd
    }

    public static voteOnTransaction(walletAddress: string, referredTransactioId: string, votingDirection: VOTING_DIRECTION) {
        // tbd
    }



}