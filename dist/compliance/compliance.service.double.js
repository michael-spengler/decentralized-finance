"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceServiceDouble = exports.VOTING_DIRECTION = void 0;
const ethereum_service_1 = require("../ethereum/ethereum.service");
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER_URL));
var VOTING_DIRECTION;
(function (VOTING_DIRECTION) {
    VOTING_DIRECTION[VOTING_DIRECTION["up"] = 1] = "up";
    VOTING_DIRECTION[VOTING_DIRECTION["down"] = 2] = "down";
})(VOTING_DIRECTION = exports.VOTING_DIRECTION || (exports.VOTING_DIRECTION = {}));
class ComplianceServiceDouble {
    static async stakeETHBeforeMakingATransaction(walletAddress, amount) {
        const reputation = ComplianceServiceDouble.walletReputations.filter((entry) => entry.walletAddress === walletAddress)[0].reputation;
        const currentEtherPriceInDAI = await ethereum_service_1.EthereumService.getEtherPriceInDAI();
        const stakingAmount = 0.01; // e.g. Ether
        const referredTransactioId = ComplianceServiceDouble.stakeETHBeforeMakingATransaction('asdfökl', 1000);
        return referredTransactioId;
    }
    static repayStakedETHToSuccessfulContributors(referredTransactioId) {
        // tbd
    }
    static voteOnTransaction(walletAddress, referredTransactioId, votingDirection) {
        // tbd
    }
}
exports.ComplianceServiceDouble = ComplianceServiceDouble;
// checke die legimität des posts an sich --> 24 h monatlich 1 h weniger bis 2 h
ComplianceServiceDouble.walletReputations = [];
