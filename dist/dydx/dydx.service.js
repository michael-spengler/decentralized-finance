"use strict";
// https://docs.instadapp.io/installation/ ??
Object.defineProperty(exports, "__esModule", { value: true });
exports.DyDxService = void 0;
// https://docs.dydx.exchange/#introduction
// import { BigNumber } from '@dydxprotocol/solo';
const perpetual_1 = require("@dydxprotocol/perpetual");
const Web3 = require('web3');
class DyDxService {
    static async initialize(walletAddress, walletPrivateKey, web3ProviderURL) {
        const provider = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER_URL));
        DyDxService.dydxPerpetual = new perpetual_1.Perpetual(provider, perpetual_1.PerpetualMarket.PBTC_USDC, perpetual_1.Networks.MAINNET, // Optional
        {
            defaultAccount: walletAddress,
            accounts: [
                {
                    address: walletAddress,
                    privateKey: walletPrivateKey,
                },
            ],
        });
        DyDxService.isReadyToServe = true;
    }
    static async getPerpetualAccountBalances(walletAddress, walletPrivateKey, web3ProviderURL) {
        if (!DyDxService.isReadyToServe) {
            await DyDxService.initialize(walletAddress, walletPrivateKey, web3ProviderURL);
        }
        const result = await DyDxService.dydxPerpetual.api.getAccountBalances({
            account: walletAddress,
        });
        return result;
    }
    static async getPerpetualBalanceUpdates(walletAddress, walletPrivateKey, web3ProviderURL) {
        if (!DyDxService.isReadyToServe) {
            await DyDxService.initialize(walletAddress, walletPrivateKey, web3ProviderURL);
        }
        // https://docs.dydx.exchange/#perpetual-get-balance-updates
        throw new Error('method is not implemented yet');
    }
    // https://docs.dydx.exchange/#deposit-withdraw-to-perpetual-account
    static async depositToPerpetualAccount(walletAddress, walletPrivateKey, web3ProviderURL) {
        if (!DyDxService.isReadyToServe) {
            await DyDxService.initialize(walletAddress, walletPrivateKey, web3ProviderURL);
        }
        throw new Error('method is not implemented yet');
        // const result = await DyDxService.dydxPerpetual.margin.deposit({
        //   account: walletAddress,
        //   amount: new BigNumber('1e6'),
        // });
        // return "result"
    }
    static async withdrawFromPerpetualAccount(walletAddress, walletPrivateKey, web3ProviderURL) {
        // if (!DyDxService.isReadyToServe) {
        //   await DyDxService.initialize(walletAddress, walletPrivateKey, web3ProviderURL)
        // }
        throw new Error('method is not implemented yet');
        // const result = await DyDxService.dydxPerpetual.margin.withdraw({
        //   account: '0x52bc44d5378309ee2abf1539bf71de1b7d7be3b5',
        //   destination: walletAddress,
        //   amount: new BigNumber('1e6'),
        // });
    }
}
exports.DyDxService = DyDxService;
DyDxService.isReadyToServe = false;
