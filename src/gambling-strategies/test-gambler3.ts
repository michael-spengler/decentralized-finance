import { Gambler } from "./gambler3"

const lrToSell = Number(process.argv[2]) // e.g. 0.01
const binanceApiKey = process.argv[3] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[4] // check your profile on binance.com --> API Management

Gambler.gamble(lrToSell, binanceApiKey, binanceApiSecret)
