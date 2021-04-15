
import { BinanceConnector } from "../../binance/binance-connector"
import axios from "axios"

const intervalLengthInSeconds = Number(process.argv[2]) // e.g. 5
const size = Number(process.argv[3]) // e.g. 0.02
const threshold = Number(process.argv[4]) // e.g. 2
const binanceApiKey = process.argv[5]
const binanceApiSecret = process.argv[6]
const pair = process.argv[7] // e.g. BTCUSDT 
const limitRegardingBuyingTheDip = Number(process.argv[8]) // e.g. 0.85

console.log(`intervalLengthInSeconds: ${intervalLengthInSeconds}`)
console.log(`size: ${size}`)
console.log(`threshold: ${threshold}`)
console.log(`binanceApiKey: ${binanceApiKey}`)
console.log(`binanceApiSecret: ${binanceApiSecret}`)
console.log(`pair: ${pair}`)

const binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)

setInterval(async () => {

    const predictedBTCPrice = Number((await axios.get('https://ml.aaronschweig.dev/technical/BTC-USD')).data[1][0].value)
    const currentPrices = await binanceConnector.getCurrentPrices()
    const currentPrice = currentPrices.filter((e: any) => e.coinSymbol === pair)[0].price

    console.log(`predictedBTCPrice: ${predictedBTCPrice}`)
    console.log(`currentPrice: ${currentPrice}`)

    const long = (predictedBTCPrice >= currentPrice)

    const accountData = await binanceConnector.getFuturesAccountData()
    const xPosition = accountData.positions.filter((entry: any) => entry.symbol === pair)[0]

    const liquidityRatio = Number(accountData.maxWithdrawAmount) / Number(accountData.totalWalletBalance)

    const positionAmountAsNumber = Number(xPosition.positionAmt)
    const unrealizedProfitAsNumber = Number(xPosition.unrealizedProfit)

    // potentially correct the investment
    if (positionAmountAsNumber > 0 && !long) {
        console.log(`selling ${xPosition.positionAmt} ${pair} due to changed direction in prediction - PNL: ${unrealizedProfitAsNumber}`)
        await binanceConnector.sellFuture(pair, Number(xPosition.positionAmt))
    } else if (positionAmountAsNumber < 0 && long) {
        console.log(`buying ${xPosition.positionAmt} ${pair} due to changed direction in prediction - PNL: ${unrealizedProfitAsNumber}`)
        await binanceConnector.buyFuture(pair, Number(xPosition.positionAmt))
    }

    if (long) {
        console.log(`assuming overall rising ${pair} price`)
        if (positionAmountAsNumber === 0) {
            console.log(`buying ${size} ${pair}`)
            await binanceConnector.buyFuture(pair, size)
        } else {
            console.log(unrealizedProfitAsNumber)
            if (unrealizedProfitAsNumber >= threshold) {
                console.log(`selling ${xPosition.positionAmt} ${pair}`)
                await binanceConnector.sellFuture(pair, Number(xPosition.positionAmt))
                // play sound - https://www.freesoundslibrary.com/cow-moo-sounds/ & https://www.npmjs.com/package/play-sound
            } else if ((unrealizedProfitAsNumber < 0) && liquidityRatio > limitRegardingBuyingTheDip) {
                let buyTheDipOrPumpFactor = Math.round(unrealizedProfitAsNumber)
                if (buyTheDipOrPumpFactor >= 1) {
                    console.log(`buying the dip with factor ${buyTheDipOrPumpFactor}`)
                    await binanceConnector.buyFuture(pair, ((size * buyTheDipOrPumpFactor)))
                } else {
                    console.log("waiting for the dip :)")
                }
            } else {
                console.log(`waiting until I made ${threshold} USD in profit`)
            }
        }
    } else { 
        console.log(`assuming overall declining ${pair} price`)
        if (positionAmountAsNumber === 0) {
            console.log(`selling ${size} ${pair}`)
            await binanceConnector.sellFuture(pair, size)
        } else {
            console.log(unrealizedProfitAsNumber)
            if (unrealizedProfitAsNumber >= threshold) {
                console.log(`buying ${xPosition.positionAmt} ${pair}`)
                await binanceConnector.buyFuture(pair, Number(xPosition.positionAmt))
                // play sound - https://www.freesoundslibrary.com/cow-moo-sounds/ & https://www.npmjs.com/package/play-sound
            } else if ((unrealizedProfitAsNumber < 0) && liquidityRatio > limitRegardingBuyingTheDip) {
                let buyTheDipOrPumpFactor = Math.round(unrealizedProfitAsNumber)
                if (buyTheDipOrPumpFactor >= 1) {
                    console.log(`selling the pump with factor ${buyTheDipOrPumpFactor}`)
                    await binanceConnector.sellFuture(pair, ((size * buyTheDipOrPumpFactor)))
                } else {
                    console.log("waiting for the dip :)")
                }
            } else {
                console.log(`waiting until I made ${threshold} USD in profit`)
            }
        }

    }
}, intervalLengthInSeconds * 1000)
