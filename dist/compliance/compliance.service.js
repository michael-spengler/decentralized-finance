"use strict";
// checke die legimität des posts an sich --> 24 h monatlich 1 h weniger bis 2 h
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceService = void 0;
const constants_1 = require("../constants");
const ethereum_service_1 = require("../ethereum/ethereum.service");
const interfaces_1 = require("./interfaces");
const staking_pool_1 = require("./staking-pool");
const Web3 = require('web3');
let web3;
class ComplianceService {
    constructor(stakingPoolType) {
        this.stakingPoolType = stakingPoolType;
    }
    async stakeETHAndMakeTransaction(walletAddress, amount, transactionInput) {
        let referredTransactioId;
        if (this.stakingPoolType === interfaces_1.STAKING_POOL_TYPE.SOLIDITY_SMART_CONTRACT) {
            if (web3 === undefined) {
                web3 = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER_URL));
            }
            const reputation = staking_pool_1.StakingPool.getWalletReputation(walletAddress);
            const currentEtherPriceInDAI = await ethereum_service_1.EthereumService.getEtherPriceInDAI();
            const p2pStakingPoolAddress = 'to be entered after deployment on mainnet';
            const p2pStakingPoolContract = new web3.eth.Contract(constants_1.p2pStakingPoolAbi, p2pStakingPoolAddress);
            referredTransactioId = await p2pStakingPoolContract.stakeETHAndMakeTransaction().call();
        }
        else if (this.stakingPoolType === interfaces_1.STAKING_POOL_TYPE.TYPESCRIPT_PROGRAM) {
            const stakingAmount = 0.01; // e.g. Ether
            referredTransactioId = await staking_pool_1.StakingPool.stakeETHAndMakeTransaction(walletAddress, amount, transactionInput);
        }
        return referredTransactioId;
    }
    async repayStakedETHToSuccessfulContributorsAndVoters(referredTransactioId) {
        const rewardTransactionId = await staking_pool_1.StakingPool.repayStakedETHToSuccessfulContributorsAndVoters(referredTransactioId);
        return rewardTransactionId;
    }
    async voteOnTransaction(walletAddress, referredTransactioId, votingDirection) {
        return 'h726';
    }
}
exports.ComplianceService = ComplianceService;
