

import { BinanceConnector } from "../../binance/binance-connector"
import { AIConnector } from "../ai-connector"
import { Player } from "../audio-success-indicators/player"


const intervalLengthInSeconds = Number(process.argv[2]) // e.g. 11
const pair = process.argv[3] // e.g. ETHUSDT 
const leverageEffectWhichYouConfigured = Number(process.argv[4]) // e.g. 100 
const couldBuyWouldBuyFactor = Number(process.argv[5]) // e.g. 0.1
const minimumBuySize = Number(process.argv[6]) // e.g. 0.5 
const sellPositionAmountFactor = Number(process.argv[7]) // e.g. 0.2 
const ratioToBuy = Number(process.argv[8]) // e.g. 0.5
const ratioToSell = Number(process.argv[9]) // e.g. 0.2
const binanceApiKey = process.argv[10] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[11] // check your profile on binance.com --> API Management

const binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)


setInterval(async () => {

    const accountData = await binanceConnector.getFuturesAccountData()
    const xPosition = accountData.positions.filter((entry: any) => entry.symbol === pair)[0]
    const positionAmount = Number(xPosition.positionAmt)
    const totalWalletBalance = Number(accountData.totalWalletBalance)
    const available = Number(accountData.availableBalance)
    const liquidityRatio = available / totalWalletBalance

    console.log(`balance: ${totalWalletBalance} - unrealizedPNL: ${accountData.totalUnrealizedProfit} - available: ${available} - positionAmount: ${positionAmount} ${pair} - lr: ${liquidityRatio}`)

    const currentPrices = await binanceConnector.getCurrentPrices()
    const currentPrice = currentPrices.filter((e: any) => e.coinSymbol === pair)[0].price
    
    const howMuchCouldIBuy = currentPrice / (available * leverageEffectWhichYouConfigured)
    
    if ((await AIConnector.isThereASeriousVetoFromATAPerspective(currentPrice, pair)))  {

        if (positionAmount > 0) {
            console.log(`I'm selling the long position as our the automated technical analysis raised some concerns.`)
            await binanceConnector.sellFuture(pair,(positionAmount))
        } else {
            console.log(`waiting until the technical analysis indicates going long again.`)
        }

    } else if (await AIConnector.isThereASeriousVetoFromASAPerspective()) {

        if (positionAmount > 0) {
            console.log(`I'm selling the long position as our the automated sentiment analysis raised some concerns.`)
            await binanceConnector.sellFuture(pair, (positionAmount))
        } else {
            console.log(`waiting until the sentiment analysis indicates going long again.`)
        }

    } else {
        
        console.log(`technical analysis, sentiment analysis and personal fundamentals analysis combined indicate being long on ${pair}.`)

        if (liquidityRatio >= ratioToBuy) {

            console.log(`I could buy ${howMuchCouldIBuy} ${pair}`)

            const howMuchShouldIBuy = Number((howMuchCouldIBuy * couldBuyWouldBuyFactor).toFixed(3))

            if (howMuchShouldIBuy > minimumBuySize) {
                console.log(`I buy ${howMuchShouldIBuy} ${pair}`)

                await binanceConnector.buyFuture(pair, howMuchShouldIBuy)
                Player.playMP3(`${__dirname}/../../../sounds/game-new-level.mp3`) // https://www.freesoundslibrary.com
            } else {
                console.log(`I wait until I reach the minimum buy size of ${minimumBuySize} ${pair}. Currently the howMuchShouldIBuy amount is: ${howMuchShouldIBuy}`)
            }
        }

        if (liquidityRatio <= ratioToSell) {

            const howMuchShouldISell = Number((positionAmount * sellPositionAmountFactor).toFixed(3))
            await binanceConnector.sellFuture(pair, howMuchShouldISell)
            console.log(`selling ${howMuchShouldISell} ${pair}.`)
            Player.playMP3(`${__dirname}/../../../sounds/cow-moo-sound.mp3`) // https://www.freesoundslibrary.com/cow-moo-sounds/ 

        }

        if (liquidityRatio > ratioToSell && liquidityRatio < ratioToBuy) {

            console.log(`it seems we are reasonably invested with a liquidity ratio of ${liquidityRatio}.`)

        }
    }

}, intervalLengthInSeconds * 1000)

