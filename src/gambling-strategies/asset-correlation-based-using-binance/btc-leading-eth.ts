import { BinanceConnector } from "../../binance/binance-connector"

let currentPrices: any[] = []
let previousPrices: any[] = []

const intervalLengthInSeconds = Number(process.argv[2])
const size = Number(process.argv[3])
const threshold = Number(process.argv[4])
const binanceApiKey = process.argv[5]
const binanceApiSecret = process.argv[6]

console.log(`intervalLengthInSeconds: ${intervalLengthInSeconds}`)
console.log(`size: ${size}`)
console.log(`threshold: ${threshold}`)
console.log(`binanceApiKey: ${binanceApiKey}`)
console.log(`binanceApiSecret: ${binanceApiSecret}`)

setInterval(async () => {
    currentPrices = await BinanceConnector.getCurrentPrices()
    const accountData = await BinanceConnector.getFuturesAccountData()
    const etherPosition = accountData.positions.filter((entry: any) => entry.symbol === "ETHUSDT")[0]
    
    console.log(etherPosition)

    if (previousPrices.length > 0) {
        const previousPrice = Math.round(previousPrices.filter((e: any) => e.coinSymbol === "BTCUSDT")[0].price)
        const currentPrice = Math.round(currentPrices.filter((e: any) => e.coinSymbol === "BTCUSDT")[0].price)
        const increasedEnoughForBuy = (previousPrice + threshold < currentPrice) ? true : false
        const decreasedEnoughForSale = (previousPrice > currentPrice + threshold) ? true : false
        
        console.log(`previous: ${previousPrice} vs. current: ${currentPrice}`)
        console.log(`increasedEnoughForBuy: ${increasedEnoughForBuy}`)
        console.log(`decreasedEnoughForSale: ${decreasedEnoughForSale}`)

        if (increasedEnoughForBuy && (etherPosition.positionAmt === '0.000' || etherPosition.positionAmt === `-${size}.000`) ) {
            console.log("buying")
            await BinanceConnector.buyFuture("ETHUSDT", size)
        } else if (decreasedEnoughForSale && (etherPosition.positionAmt === '0.000' || etherPosition.positionAmt === `${size}.000`)) {
            console.log("selling")
            await BinanceConnector.sellFuture("ETHUSDT", size)
        } else {
            console.log("sleep :)")
        }

    }

    previousPrices = [...currentPrices]

}, intervalLengthInSeconds * 1000)
