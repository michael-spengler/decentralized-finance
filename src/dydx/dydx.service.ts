
// https://docs.instadapp.io/installation/ ??

// https://docs.dydx.exchange/#introduction

// import { BigNumber } from '@dydxprotocol/solo';
import { Perpetual, PerpetualMarket, Networks } from '@dydxprotocol/perpetual';

const Web3 = require('web3');

export class DyDxService {

  private static isReadyToServe = false
  private static dydxPerpetual: any

  public static async initialize() {

    const provider = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER_URL));

    DyDxService.dydxPerpetual = new Perpetual(
      provider,
      PerpetualMarket.PBTC_USDC,
      Networks.MAINNET, // Optional
      {
        defaultAccount: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
        accounts: [
          {
            address: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
            privateKey: '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d', // from the public documentation - seems uncritical
          },
        ],
      }, // Optional
    );

    DyDxService.isReadyToServe = true
  }

  public static async getPerpetualAccountBalances(walletAddress: string): Promise<any> {
    if (!DyDxService.isReadyToServe) {
      await DyDxService.initialize()
    }


    const result = await DyDxService.dydxPerpetual.api.getAccountBalances({
      accountOwner: walletAddress,
    });

    return result
  }

  public static async getPerpetualBalanceUpdates(walletAddress: string, walletPrivateKey: string, web3ProviderURL: string) {

    if (!DyDxService.isReadyToServe) {
      await DyDxService.initialize()
    }
    // https://docs.dydx.exchange/#perpetual-get-balance-updates
    throw new Error('method is not implemented yet')

  }

  // https://docs.dydx.exchange/#deposit-withdraw-to-perpetual-account
  public static async depositToPerpetualAccount(walletAddress: string, walletPrivateKey: string, web3ProviderURL: string) {

    if (!DyDxService.isReadyToServe) {
      await DyDxService.initialize()
    }

    throw new Error('method is not implemented yet')
    // const result = await DyDxService.dydxPerpetual.margin.deposit({
    //   account: walletAddress,
    //   amount: new BigNumber('1e6'),
    // });

    // return "result"
  }

  public static async withdrawFromPerpetualAccount(walletAddress: string, walletPrivateKey: string, web3ProviderURL: string) {
    // if (!DyDxService.isReadyToServe) {
    //   await DyDxService.initialize(walletAddress, walletPrivateKey, web3ProviderURL)
    // }

    throw new Error('method is not implemented yet')
    // const result = await DyDxService.dydxPerpetual.margin.withdraw({
    //   account: '0x52bc44d5378309ee2abf1539bf71de1b7d7be3b5',
    //   destination: walletAddress,
    //   amount: new BigNumber('1e6'),
    // });

  }
}