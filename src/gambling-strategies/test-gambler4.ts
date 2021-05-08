import { Gambler } from "./gambler4"

const binanceApiKey = process.argv[2] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[3] // check your profile on binance.com --> API Management
const targetBNBWallet = process.argv[4] 

Gambler.gamble(binanceApiKey, binanceApiSecret, targetBNBWallet)
