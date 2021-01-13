"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompoundService = void 0;
const Compound = require('@compound-finance/compound-js');
class CompoundService {
    static async getAccountData(walletAddress) {
        const account = await Compound.api.account({
            "addresses": walletAddress,
            "network": "mainnet"
        });
        return account.accounts[0];
    }
}
exports.CompoundService = CompoundService;
