
// import { IStakeEntry } from "./interfaces";

// import { p2pStakingPoolAbi } from "../constants"
// import { EthereumService } from "../ethereum/ethereum.service";

// const Web3 = require('web3');

// const web3 = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER_URL));


// export class ComplianceService {
    
//     // checke die legimität des posts an sich --> 24 h monatlich 1 h weniger bis 2 h


//     public static async stakeETHBeforeMakingATransaction(walletAddress: string, amount: number) {

//         const reputation = 1 // get reputation of walletAddress

//         const currentEtherPriceInDAI = await EthereumService.getEtherPriceInDAI()

//         const stakingAmount = 0.01 // e.g. Ether

//         const p2pStakingPoolAddress = 'to be entered after deployment on mainnet';

//         const p2pStakingPoolContract = new web3.eth.Contract(p2pStakingPoolAbi, p2pStakingPoolAddress);
//         let priceInDAI = (await p2pStakingPoolContract.methods.stakeETHBeforeMakingATransaction(stakingAmount).call()) / 1000000;


//         return priceInDAI

//     }

//     public static repayStakedETHToSuccessfulContributor() {
//         // tbd
//     }

//     public static voteOnTransaction() {
//         // tbd
//     }



// }