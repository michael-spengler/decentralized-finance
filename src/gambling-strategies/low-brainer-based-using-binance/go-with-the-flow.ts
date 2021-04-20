

import { BinanceConnector } from "../../binance/binance-connector"
import { AIConnector } from "../ai-connector"
import { Player } from "../audio-success-indicators/player"


const intervalLengthInSeconds = Number(process.argv[2]) // e.g. 11
const couldBuyWouldBuyFactor = Number(process.argv[3]) // e.g. 0.1
const minimumBuySize = Number(process.argv[4]) // e.g. 0.5 
const sellPositionAmountFactor = Number(process.argv[5]) // e.g. 0.2 
const ratioToBuy = Number(process.argv[6]) // e.g. 0.5
const ratioToSell = Number(process.argv[7]) // e.g. 0.2
const binanceApiKey = process.argv[8] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[9] // check your profile on binance.com --> API Management

const binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)
let pairs = ['ETHUSDT', 'BTCUSDT', 'BNBUSDT', 'XMRUSDT', 'LINKUSDT', 'UNIUSDT', 'BATUSDT', 'AAVEUSDT', 'COMPUSDT', 'FILUSDT', 'LINKUSDT']

let pairIndex = 0

setInterval(async () => {

    const accountData = await binanceConnector.getFuturesAccountData()
    let xPosition = accountData.positions.filter((entry: any) => entry.symbol === pairs[pairIndex])[0]
    let positionAmount = Number(xPosition.positionAmt)

    const totalWalletBalance = Number(accountData.totalWalletBalance)
    const available = Number(accountData.availableBalance)
    const liquidityRatio = available / totalWalletBalance

    const currentPrices = await binanceConnector.getCurrentPrices()
    let currentPrice = currentPrices.filter((e: any) => e.coinSymbol === pairs[pairIndex])[0].price

    let leverageEffectWhichYouConfigured = Number(xPosition.leverage)
    let howMuchCouldIBuy = ((available * 0.96) * leverageEffectWhichYouConfigured) / currentPrice // 0.96 as the taker fee for futures is about 0.04
    let howMuchShouldIBuy = Number((howMuchCouldIBuy * couldBuyWouldBuyFactor).toFixed(3))

    while ((howMuchShouldIBuy * currentPrice) > (Number(xPosition.maxNotional) - Number(xPosition.notional)) && pairIndex < pairs.length - 1) {
        console.log(`hm: ${howMuchShouldIBuy} - mn: ${Number(xPosition.maxNotional)} - n: ${Number(xPosition.notional)}`)
        console.log(`I can't get more leverage on ${pairs[pairIndex]} - changing pair to ${pairs[pairIndex + 1]}`)
        pairIndex++
        currentPrice = currentPrices.filter((e: any) => e.coinSymbol === pairs[pairIndex])[0].price
        xPosition = accountData.positions.filter((entry: any) => entry.symbol === pairs[pairIndex])[0]
        positionAmount = Number(xPosition.positionAmt)
        leverageEffectWhichYouConfigured = xPosition.leverage
        howMuchCouldIBuy = ((available * 0.96) * leverageEffectWhichYouConfigured) / currentPrice // 0.96 as the taker fee for futures is about 0.04
        howMuchShouldIBuy = Number((howMuchCouldIBuy * couldBuyWouldBuyFactor).toFixed(3))
    }

    console.log(`balance: ${totalWalletBalance} - unrealizedPNL: ${accountData.totalUnrealizedProfit} - available: ${available} - positionAmount: ${positionAmount} ${pairs[pairIndex]} - lr: ${liquidityRatio}`)
    if ((await AIConnector.isThereASeriousVetoFromATAPerspective(currentPrice, pairs[pairIndex])))  {

        if (positionAmount > 0) {
            console.log(`I'm selling the long position as our automated technical analysis raised some concerns.`)
            await binanceConnector.sellFuture(pairs[pairIndex],(positionAmount))
            pairIndex = 0
        } else {
            console.log(`waiting until the technical analysis indicates going long again.`)
        }

    } else if (await AIConnector.isThereASeriousVetoFromASAPerspective()) {

        if (positionAmount > 0) {
            console.log(`I'm selling the long position as our automated sentiment analysis raised some concerns.`)
            await binanceConnector.sellFuture(pairs[pairIndex], (positionAmount))
            pairIndex = 0
        } else {
            console.log(`waiting until the sentiment analysis indicates going long again.`)
        }

    } else {

        // console.log(`technical analysis, sentiment analysis and personal fundamentals analysis combined indicate being long on ${pair} is a good idea.`)

        if (liquidityRatio >= ratioToBuy) {

            console.log(`I could buy ${howMuchCouldIBuy} ${pairs[pairIndex]} - as lr (${liquidityRatio}) > ratioToBuy (${ratioToBuy})`)

            if (howMuchShouldIBuy > minimumBuySize) {
                console.log(`I buy ${howMuchShouldIBuy} ${pairs[pairIndex]}`)

                await binanceConnector.buyFuture(pairs[pairIndex], howMuchShouldIBuy)
                Player.playMP3(`${__dirname}/../../../sounds/game-new-level.mp3`) // https://www.freesoundslibrary.com
            } else {
                console.log(`I wait until I reach the minimum buy size of ${minimumBuySize} ${pairs[pairIndex]}. Currently the howMuchShouldIBuy amount is: ${howMuchShouldIBuy}`)
            }
        }

        if (liquidityRatio <= ratioToSell) {

            const howMuchShouldISell = Number((positionAmount * sellPositionAmountFactor).toFixed(3))
            await binanceConnector.sellFuture(pairs[pairIndex], howMuchShouldISell)
            pairIndex = 0
            console.log(`selling ${howMuchShouldISell} ${pairs[pairIndex]}.`)
            Player.playMP3(`${__dirname}/../../../sounds/cow-moo-sound.mp3`) // https://www.freesoundslibrary.com/cow-moo-sounds/ 

        }

        if (liquidityRatio > ratioToSell && liquidityRatio < ratioToBuy) {

            console.log(`it seems we are reasonably invested with a liquidity ratio of ${liquidityRatio}.`)

        }
    }

}, intervalLengthInSeconds * 1000)

