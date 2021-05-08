import { Gambler } from "./gambler4"

const minValAtRisk = Number(process.argv[2]) // e.g. 100
const binanceApiKey = process.argv[3] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[4] // check your profile on binance.com --> API Management
const targetBNBWallet = process.argv[5]

const gambler = new Gambler(minValAtRisk, binanceApiKey, binanceApiSecret)
gambler.gamble()
