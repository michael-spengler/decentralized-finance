import { Gambler } from "./gambler3"

const minAvailableOnFuturesAccount = Number(process.argv[2]) // e.g. 100
const binanceApiKey = process.argv[3] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[4] // check your profile on binance.com --> API Management
const targetETHWallet = process.argv[5] // check your profile on binance.com --> API Management

Gambler.gamble(minAvailableOnFuturesAccount, binanceApiKey, binanceApiSecret, targetETHWallet)
