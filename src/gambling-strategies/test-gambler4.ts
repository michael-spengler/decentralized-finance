import { Gambler } from "./gambler4"

const minValAtRisk = Number(process.argv[2]) // e.g. 100
const factor = Number(process.argv[3]) // e.g. 100
const buyPauseAfterSale = Number(process.argv[4]) // e.g. 500 intervals
const binanceApiKey = process.argv[5] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[6] // check your profile on binance.com --> API Management
const targetBNBWallet = process.argv[7]

const gambler = new Gambler(minValAtRisk, factor, buyPauseAfterSale, binanceApiKey, binanceApiSecret)
gambler.gamble()
