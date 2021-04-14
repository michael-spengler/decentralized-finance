import { BinanceConnector } from "../../binance/binance-connector"

const intervalLengthInSeconds = Number(process.argv[2])
const pair = process.argv[7]
const size = Number(process.argv[3])
const threshold = Number(process.argv[4])
const binanceApiKey = process.argv[5]
const binanceApiSecret = process.argv[6]
let dipCounter = 0

console.log(`intervalLengthInSeconds: ${intervalLengthInSeconds}`)
console.log(`size: ${size}`)
console.log(`threshold: ${threshold}`)
console.log(`binanceApiKey: ${binanceApiKey}`)
console.log(`binanceApiSecret: ${binanceApiSecret}`)
console.log(`pair: ${pair}`)

const binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)

setInterval(async () => {

    const accountData = await binanceConnector.getFuturesAccountData()
    const xPosition = accountData.positions.filter((entry: any) => entry.symbol === pair)[0]

    const liquidityRatio = Number(accountData.maxWithdrawAmount) / Number(accountData.totalWalletBalance)
    console.log(liquidityRatio)

    const positionAmountAsNumber = Number(xPosition.positionAmt)
    const unrealizedProfitAsNumber = Number(xPosition.unrealizedProfit)

    if (positionAmountAsNumber === 0) {
        console.log(`buying ${size} ${pair}`)
        await binanceConnector.buyFuture(pair, size)
    } else {
        console.log(unrealizedProfitAsNumber)
        if (unrealizedProfitAsNumber > threshold) {
            console.log(`selling ${size} ${pair}`)
            await binanceConnector.sellFuture(pair, size)
            dipCounter = 0
        } else if ((unrealizedProfitAsNumber < ((dipCounter + 1) * (threshold * -1))) && liquidityRatio > 0.75) {
            console.log(`buying the dip`)
            dipCounter++
            await binanceConnector.buyFuture(pair, size)
        } else {
            console.log(`waiting until I made ${threshold} USD in profit`)
        }
    }
}, intervalLengthInSeconds * 1000)


// let currentPrices: any[] = []
// let previousPrices: any[] = []
// let previousPNL: number

// const intervalLengthInSeconds = Number(process.argv[2])
// const size = Number(process.argv[3])
// const threshold = Number(process.argv[4])
// const binanceApiKey = process.argv[5]
// const binanceApiSecret = process.argv[6]
// const pair = process.argv[7]

// console.log(`intervalLengthInSeconds: ${intervalLengthInSeconds}`)
// console.log(`size: ${size}`)
// console.log(`threshold: ${threshold}`)
// console.log(`binanceApiKey: ${binanceApiKey}`)
// console.log(`binanceApiSecret: ${binanceApiSecret}`)
// console.log(`pair: ${pair}`)

// const binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)

// setInterval(async () => {
//     currentPrices = await binanceConnector.getCurrentPrices()
//     const accountData = await binanceConnector.getFuturesAccountData()
//     const xPosition = accountData.positions.filter((entry: any) => entry.symbol === pair)[0]

//     console.log(xPosition)

//     if (previousPrices.length > 0) {
//         const previousPrice = Math.round(previousPrices.filter((e: any) => e.coinSymbol === "BTCUSDT")[0].price)
//         const currentPrice = Math.round(currentPrices.filter((e: any) => e.coinSymbol === "BTCUSDT")[0].price)
//         const increasedEnoughForBuy = (previousPrice + threshold < currentPrice) ? true : false
//         const decreasedEnoughForSale = (previousPrice > currentPrice + threshold) ? true : false

//         console.log(`previous: ${previousPrice} vs. current: ${currentPrice}`)
//         console.log(`increasedEnoughForBuy: ${increasedEnoughForBuy}`)
//         console.log(`decreasedEnoughForSale: ${decreasedEnoughForSale}`)

//         const positionAmountAsNumber = Number(xPosition.positionAmt)
//         let beingLong = (positionAmountAsNumber === size)
//         let beingShort = (positionAmountAsNumber === (size * -1))

//         if (increasedEnoughForBuy) {
//             if (positionAmountAsNumber === 0 || beingShort) {
//                 console.log("buying")
//                 await binanceConnector.buyFuture(pair, size)
//             } else {
//                 console.log("already long")
//             }
//         } else if (decreasedEnoughForSale) {
//             if (positionAmountAsNumber === 0 || beingLong) {
//                 console.log("selling")
//                 await binanceConnector.sellFuture(pair, size)
//             } else {
//                 console.log("already short")
//             }
//         } else {
//             if (Number(xPosition.unrealizedProfit) < -1) {
//                 if (beingLong) {
//                     console.log(`I'm selling due to a fucked up PNL of long position of ${xPosition.unrealizedProfit}`)
//                     await binanceConnector.sellFuture(pair, size)
//                 } else if (beingShort) {
//                     console.log(`I'm buying due to a fucked up PNL of short position of ${xPosition.unrealizedProfit}`)
//                     await binanceConnector.buyFuture(pair, size)
//                 } else {
//                     throw new Error('this would be strange')
//                 }
//             } else {
//                 console.log("sleep :)")
//             }
//         }
//     }

//     previousPrices = [...currentPrices]
//     previousPNL = Number(xPosition.unrealizedProfit)

// }, intervalLengthInSeconds * 1000)
