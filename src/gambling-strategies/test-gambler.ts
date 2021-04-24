import { Gambler } from "./gambler"

const lrToBuy = Number(process.argv[2]) // e.g. 0.9
const lrToSell = Number(process.argv[3]) // e.g. 0.4
const reinvestAt = Number(process.argv[4]) // 10
const investmentAmount = Number(process.argv[5]) // e.g. 20
const binanceApiKey = process.argv[6] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[7] // check your profile on binance.com --> API Management

Gambler.gamble(lrToBuy, lrToSell, reinvestAt, investmentAmount, binanceApiKey, binanceApiSecret)
