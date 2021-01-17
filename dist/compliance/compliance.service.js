"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceService = exports.VOTING_DIRECTION = void 0;
const constants_1 = require("../constants");
const ethereum_service_1 = require("../ethereum/ethereum.service");
const staking_pool_1 = require("./staking-pool");
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER_URL));
var VOTING_DIRECTION;
(function (VOTING_DIRECTION) {
    VOTING_DIRECTION[VOTING_DIRECTION["UP"] = 1] = "UP";
    VOTING_DIRECTION[VOTING_DIRECTION["DOWN"] = 2] = "DOWN";
})(VOTING_DIRECTION = exports.VOTING_DIRECTION || (exports.VOTING_DIRECTION = {}));
class ComplianceService {
    // checke die legimität des posts an sich --> 24 h monatlich 1 h weniger bis 2 h
    static async stakeETHAndMakeTransaction(walletAddress, amount) {
        const reputation = staking_pool_1.StakingPool.getWalletReputation(walletAddress);
        const currentEtherPriceInDAI = await ethereum_service_1.EthereumService.getEtherPriceInDAI();
        const stakingAmount = 0.01; // e.g. Ether
        const p2pStakingPoolAddress = 'to be entered after deployment on mainnet';
        const p2pStakingPoolContract = new web3.eth.Contract(constants_1.p2pStakingPoolAbi, p2pStakingPoolAddress);
        const referredTransactioId = await p2pStakingPoolContract.stakeETHAndMakeTransaction().call();
        return referredTransactioId;
    }
    static repayStakedETHToSuccessfulContributors(referredTransactioId) {
        // tbd
    }
    static voteOnTransaction(walletAddress, referredTransactioId, votingDirection) {
        // tbd
    }
}
exports.ComplianceService = ComplianceService;
