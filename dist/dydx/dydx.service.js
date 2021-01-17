"use strict";
// // https://docs.instadapp.io/installation/ ??
// // https://docs.dydx.exchange/#introduction
// import { BigNumber } from '@dydxprotocol/solo';
// import { Perpetual, PerpetualMarket, Networks } from '@dydxprotocol/perpetual';
// const Web3 = require('web3');
// export class DyDxService {
//   private static isReadyToServe = false
//   private static dydxPerpetual: any
//   public static async initialize(walletAddress: string, walletPrivateKey: string, web3ProviderURL: string) {
//     const provider = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER_URL));
//     DyDxService.dydxPerpetual = new Perpetual(
//       provider,
//       PerpetualMarket.PBTC_USDC,
//       Networks.MAINNET, // Optional
//       {
//         defaultAccount: walletAddress,
//         accounts: [
//           {
//             address: walletAddress,
//             privateKey: walletPrivateKey,
//           },
//         ],
//       }, // Optional
//     );
//     DyDxService.isReadyToServe = true
//   }
//   public static async getPerpetualAccountBalances(walletAddress: string, walletPrivateKey: string, web3ProviderURL: string): Promise<any> {
//     if (!DyDxService.isReadyToServe) {
//       await DyDxService.initialize(walletAddress, walletPrivateKey, web3ProviderURL)
//     }
//     const result = await DyDxService.dydxPerpetual.api.getAccountBalances({
//       account: walletAddress,
//     });
//     return result
//   }
//   public static async getPerpetualBalanceUpdates(walletAddress: string, walletPrivateKey: string, web3ProviderURL: string) {
//     if (!DyDxService.isReadyToServe) {
//       await DyDxService.initialize(walletAddress, walletPrivateKey, web3ProviderURL)
//     }
//     // https://docs.dydx.exchange/#perpetual-get-balance-updates
//     throw new Error('method is not implemented yet')
//   }
//   // https://docs.dydx.exchange/#deposit-withdraw-to-perpetual-account
//   public static async depositToPerpetualAccount(walletAddress: string, walletPrivateKey: string, web3ProviderURL: string) {
//     if (!DyDxService.isReadyToServe) {
//       await DyDxService.initialize(walletAddress, walletPrivateKey, web3ProviderURL)
//     }
//     // const result = await DyDxService.dydxPerpetual.margin.deposit({
//     //   account: walletAddress,
//     //   amount: new BigNumber('1e6'),
//     // });
//     return "result"
//   }
//   public static async withdrawFromPerpetualAccount(walletAddress: string, walletPrivateKey: string, web3ProviderURL: string) {
//     if (!DyDxService.isReadyToServe) {
//       await DyDxService.initialize(walletAddress, walletPrivateKey, web3ProviderURL)
//     }
//     const result = await DyDxService.dydxPerpetual.margin.withdraw({
//       account: '0x52bc44d5378309ee2abf1539bf71de1b7d7be3b5',
//       destination: walletAddress,
//       amount: new BigNumber('1e6'),
//     });
//   }
// }
