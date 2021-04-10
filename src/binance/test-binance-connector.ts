
import { BinanceConnector } from "./binance-connector"
// example buy order
setTimeout(async () => {
    const pair = "ETHUSDT"
    const amount = 0.005

    await BinanceConnector.placeBuyOrder(pair, amount)
})


// setTimeout(async () => {
//     const pair = "ETHUSDT"
//     const amount = 0.005
//     const maxPrice = 3000
//     const stopLossPrice = 2155
//     await BinanceConnector.placeStopLossOrder(pair, amount, maxPrice, stopLossPrice)
// })

