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
    static async depositEtherToCompound(amountOfEtherToBeDeposited, senderWalletAddress, senderWalletPrivateKey, web3ProviderURL) {
        const compound = new Compound(web3ProviderURL, {
            privateKey: senderWalletPrivateKey,
        });
        try {
            const trx = await compound.supply(Compound.ETH, amountOfEtherToBeDeposited);
            console.log(`You can check the deposit to compound transaction at https://etherscan.io/tx/${trx.hash}`);
        }
        catch (error) {
            console.log('Something went wrong while depositing Ether to compound.finance');
        }
    }
}
exports.CompoundService = CompoundService;
