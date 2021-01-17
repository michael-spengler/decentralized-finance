"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StakingPool = void 0;
const fsExtra = require('fs-extra');
class StakingPool {
    static stakeETHAndMakeTransaction(walletAddress, amount, transactionInput) {
        const p2pExchangeTransactions = StakingPool.getInitialTransaction();
        p2pExchangeTransactions.initiatingWalletAddress = walletAddress;
        p2pExchangeTransactions.transactionInput = transactionInput;
        const originalTransactionId = '12345';
        return originalTransactionId;
    }
    static async repayStakedETHToSuccessfulContributorsAndVoters(transactionId) {
        const repaymentTransactionId = 'h725';
        return repaymentTransactionId;
    }
    static getWalletReputation(walletAddress) {
        const entry = StakingPool.walletReputations.filter((entry) => entry.walletAddress === walletAddress)[0];
        if (entry === undefined) {
            return 1; // this is the initial reputation score
        }
        else {
            return entry.reputation;
        }
    }
    static getInitialTransaction() {
        return {
            initiatingWalletAddress: "",
            transactionId: "",
            timeStampTriggered: "",
            timestampFinalized: "",
            transactionInput: "",
            votes: [
                {
                    ups: 0,
                    downs: 0
                }
            ]
        };
    }
}
exports.StakingPool = StakingPool;
StakingPool.stakeEntries = [];
StakingPool.walletReputations = [];
