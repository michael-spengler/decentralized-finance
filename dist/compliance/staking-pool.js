"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StakingPool = void 0;
const fsExtra = require('fs-extra');
class StakingPool {
    static stakeETHBeforeMakingATransaction() {
        return '12345';
    }
    static getWalletReputation(walletAddress) {
        return StakingPool.walletReputations.filter((entry) => entry.walletAddress === walletAddress)[0].reputation;
    }
}
exports.StakingPool = StakingPool;
StakingPool.stakeEntries = [];
StakingPool.walletReputations = [];
