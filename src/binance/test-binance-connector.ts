
import { BinanceConnector } from "./binance-connector"
// example buy order
// setTimeout(async () => {
//     const pair = "ETHUSDT"
//     const amount = 0.005

//     await BinanceConnector.placeBuyOrder(pair, amount)
// })

// example futures buy order
setTimeout(async () => {
    const pair = "ETHUSDT"
    const amount = 0.005
    // const limitPrice = 2155
    const limitPrice = undefined

    await BinanceConnector.placeFuturesBuyOrder(pair, amount, limitPrice)
})


// example stop loss order
// setTimeout(async () => {
//     const pair = "ETHUSDT"
//     const amount = 0.005
//     const maxPrice = 2140
//     const stopLossPrice = 2140
//     await BinanceConnector.placeStopLossOrder(pair, amount, maxPrice, stopLossPrice)
// }, 1000)

