import { GoWithTheFlow } from "./go-with-the-flow"

const pair = process.argv[2] // e.g. BTCUSDT
const tradeUnitSize = Number(process.argv[3]) // e.g. 0.01
const minValAtRisk = Number(process.argv[4]) // e.g. 100
const factor = Number(process.argv[5]) // e.g. 100
const buyPauseAfterSale = Number(process.argv[6]) // e.g. 500 intervals
const binanceApiKey = process.argv[7] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[8] // check your profile on binance.com --> API Management
const targetBNBWallet = process.argv[9]

const goWithTheFlow = new GoWithTheFlow(pair, tradeUnitSize, minValAtRisk, factor, buyPauseAfterSale, binanceApiKey, binanceApiSecret)
goWithTheFlow.gamble()
