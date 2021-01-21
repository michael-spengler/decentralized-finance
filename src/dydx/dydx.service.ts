

// https://docs.dydx.exchange/#perpetual-place-order

// https://docs.instadapp.io/installation/ ??

// https://docs.dydx.exchange/#introduction

// import { BigNumber } from '@dydxprotocol/solo';
import { ApiSide, ApiMarketName, BigNumber, Perpetual, PerpetualMarket, Networks } from '@dydxprotocol/perpetual';
import axios from 'axios';

const Web3 = require('web3');
require('dotenv').config() // this ensures process.env. ... contains your .env file configuration values

export class DyDxService {

  private static isReadyToServe = false
  private static dydxPerpetual: any

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


  public static async placeOrder(walletAddress: string) {

    if (!DyDxService.isReadyToServe) {
      await DyDxService.initialize()
    }

    const orderbook = (await axios.get('https://api.dydx.exchange/v1/orderbook/WETH-DAI')).data
    console.log(orderbook.bids[0])
    console.log(orderbook.asks[0])

    // const orderIdFromActiveOrderBook = '0xd17ae8439b99c6c7637808be36d856c6f6f497ab132a7f394f611396b5594844'
    const orderIdFromActiveOrderBook = orderbook.bids[0].id
    const specificOrder = await DyDxService.dydxPerpetual.api.getOrderV2({ id: orderIdFromActiveOrderBook })
    console.log(specificOrder)

    // const orders = (await axios.get('https://api.dydx.exchange/v2/orders')).data.orders.filter((e: any) => e.market === 'WETH-USDC')
    // console.log(orders.length)

    // console.log(orders[0])

    // const order1 = (await axios.get(`https://api.dydx.exchange/v2/orders/${orderIdFromActiveOrderBook}`)).data




    // // order has type ApiOrder
    // const { order } = await DyDxService.dydxPerpetual.api.placePerpetualOrder({
    //   order: {
    //     side: ApiSide.BUY,
    //     amount: new BigNumber('1e8'),
    //     price: '72.00',
    //     maker: walletAddress,
    //     taker: '0x7a94831b66a7ae1948b1a94a9555a7efa99cb426',
    //     expiration: new BigNumber('1000'), // the order would expire after 1000 seconds
    //     limitFee: '0.0075',
    //   },
    //   fillOrKill: false,
    //   postOnly: false,
    //   clientId: 'foo',
    //   cancelId: '0x2c45cdcd3bce2dd0f2b40502e6bea7975f6daa642d12d28620deb18736619fa2',
    //   cancelAmountOnRevert: false,
    //   market: ApiMarketName.PBTC_USDC,
    // });
  }


  private static async initialize() {

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

}




// async function test() {

//   const walletAddress = process.env.SENDER_WALLET_ADDRESS

//   // const result = await DyDxService.getPerpetualAccountBalances(walletAddress as string)
//   // console.log(result.balances)
//   // // console.log(result.balances['WETH-PUSD'])

//   DyDxService.placeOrder(walletAddress as string)
// }

// test()


