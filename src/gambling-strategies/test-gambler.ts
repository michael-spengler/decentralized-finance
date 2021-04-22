import { Gambler } from "./gambler"

const lrToBuy = Number(process.argv[2]) // e.g. 0.45
const lrToSell = Number(process.argv[3]) // e.g. 0.01
const binanceApiKey = process.argv[4] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[5] // check your profile on binance.com --> API Management

Gambler.gamble(lrToBuy, lrToSell, binanceApiKey, binanceApiSecret)