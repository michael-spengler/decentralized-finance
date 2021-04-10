

// https://www.npmjs.com/package/node-binance-api

require('dotenv').config() // this ensures process.env. ... contains your .env file configuration values

const Binance = require('node-binance-api');

const binance = new Binance().options({
    APIKEY: process.env.BINANCE_API_KEY,
    APISECRET: process.env.BINANCE_API_SECRET
});

export class BinanceConnector {

    public static async placeBuyOrder(pair: string, amount: number): Promise<void> {
        binance.marketBuy(pair, amount)
            .then((resp: any) => console.log(resp)).catch((err: any) => console.log(err.body))
    }

    public static async getBTCBalance(): Promise<number> {
        const balances = await binance.balance()
        const btcBalance = balances.BTC.available

        return btcBalance
    }

    public static async placeStopLossOrder(pair: string, amount: any, maxPrice: any, stopLossPrice: any): Promise<void> {
        binance.sell(pair, amount, maxPrice, { stopPrice: stopLossPrice, type: "STOP_LOSS_LIMIT" })
            .then((resp: any) => console.log(resp)).catch((err: any) => console.log(err.body))
    }

    public static async placeFuturesBuyOrder(pair: string, amount: number, limitPrice: number | undefined): Promise<void> {
        console.log(await binance.futuresBuy(pair, amount, limitPrice))
    }

    public static async getPrices(): Promise<any> {
        return binance.prices();
    }
}

