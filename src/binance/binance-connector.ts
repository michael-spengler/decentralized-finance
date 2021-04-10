require('dotenv').config() // this ensures process.env. ... contains your .env file configuration values

const Binance = require('node-binance-api');

const binance = new Binance().options({
    APIKEY: process.env.BINANCE_API_KEY,
    APISECRET: process.env.BINANCE_API_SECRET
});

export class BinanceConnector {
    
    public static async placeStopLossOrder(pair: string, amount: number, maxPrice: number, stopLossPrice: number): Promise<void> {
        // binance.marketBuy("ETHUSDT", 0.001);
        binance.sell(pair, amount, maxPrice, { stopPrice: stopLossPrice, type: "STOP_LOSS" })
        .then((resp: any) => console.log(resp)).catch((err: any) => console.log(err.body))
    }
    
    public static async placeBuyOrder(pair: string, amount: number): Promise<void> {
        binance.marketBuy(pair, amount)
            .then((resp: any) => console.log(resp)).catch((err: any) => console.log(err.body))
    }
}

