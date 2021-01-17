"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceServiceDouble = exports.VOTING_DIRECTION = void 0;
// import { EthereumService } from "../ethereum/ethereum.service";
const staking_pool_1 = require("./staking-pool");
// const Web3 = require('web3');
// const web3 = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER_URL));
var VOTING_DIRECTION;
(function (VOTING_DIRECTION) {
    VOTING_DIRECTION[VOTING_DIRECTION["UP"] = 1] = "UP";
    VOTING_DIRECTION[VOTING_DIRECTION["DOWN"] = 2] = "DOWN";
})(VOTING_DIRECTION = exports.VOTING_DIRECTION || (exports.VOTING_DIRECTION = {}));
class ComplianceServiceDouble {
    // checke die legimität des posts an sich --> 24 h monatlich 1 h weniger bis 2 h
    static async stakeETHAndMakeTransaction(walletAddress, stakingAmount, transactionInput) {
        const reputation = staking_pool_1.StakingPool.getWalletReputation(walletAddress);
        // const currentEtherPriceInDAI = await EthereumService.getEtherPriceInDAI()
        const referredTransactionId = staking_pool_1.StakingPool.stakeETHAndMakeTransaction(walletAddress, stakingAmount, transactionInput);
        return referredTransactionId;
    }
    static async repayStakedETHToSuccessfulContributorsAndVoters(referredTransactioId) {
        const rewardTransactionId = await staking_pool_1.StakingPool.repayStakedETHToSuccessfulContributorsAndVoters(referredTransactioId);
        return rewardTransactionId;
    }
    static async voteOnTransaction(walletAddress, referredTransactioId, votingDirection) {
        return 'h726';
    }
}
exports.ComplianceServiceDouble = ComplianceServiceDouble;
