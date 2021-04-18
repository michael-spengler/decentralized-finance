

import { BinanceConnector } from "../../binance/binance-connector"
import { Player } from "../audio-success-indicators/player"
import axios from "axios"

const intervalLengthInSeconds = Number(process.argv[2])
const pair = process.argv[3]
// const minimumDipInUSD = Number(process.argv[4])
// const amountToBeBought = Number(process.argv[5])
// const minimumProfitInUSD = Number(process.argv[6])
const binanceApiKey = process.argv[4]
const binanceApiSecret = process.argv[5]


const binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)
let previousPrice: number

setInterval(async () => {

    const currentPrices = await binanceConnector.getCurrentPrices()
    const currentPrice = currentPrices.filter((e: any) => e.coinSymbol === pair)[0].price

    const accountData = await binanceConnector.getFuturesAccountData()
    const xPosition = accountData.positions.filter((entry: any) => entry.symbol === pair)[0]

    console.log(`positionAmt: ${xPosition.positionAmt}`)
    console.log(`unrealizedProfit: ${xPosition.unrealizedProfit}`)

    const sentimentFactor = await getSentimentFactor()

    console.log(sentimentFactor)
    
}, 10 * 1000)


async function getSentimentFactor(): Promise<number> {
    const sentiment = (await axios.get('https://ml.aaronschweig.dev/sentiment/twitter')).data

    console.log(sentiment[0])

    const referenceDate24HoursAgo = new Date(new Date().getTime() - 24 * 3600 * 1000)
    console.log(`referenceDate: ${referenceDate24HoursAgo}`)

    let counter = 0
    let sumSMA = 0
    let sumValue = 0
    while (counter < sentiment.length) {
        sumSMA = sumSMA + sentiment[counter].sma
        sumValue = sumValue + sentiment[counter].value
        counter++
    }

    const averageSMA = sumSMA / sentiment.length
    const averageValue = sumValue / sentiment.length

    console.log(averageSMA)
    console.log(averageValue)

    let magicFactorSMA
    let magicFactorValue
    if (sentiment[0].date < referenceDate24HoursAgo) {
        console.log(`${sentiment[0].date} is before ${referenceDate24HoursAgo} - which means not so many quality accounts post about it`)
        magicFactorSMA = averageSMA - 0, 1
        magicFactorValue = averageValue - 0, 1
    } else {
        magicFactorSMA = averageSMA + 0, 1
        magicFactorValue = averageValue + 0, 1
    }

    console.log(`magic factor SMA: ${magicFactorSMA}`)
    console.log(`magic factor magicFactorValue: ${magicFactorValue}`)

    const sentimentFactor = (((5 + (5 * ((magicFactorSMA < 1) ? magicFactorSMA : 1))) + (5 + (5 * ((magicFactorValue < 1) ? magicFactorValue : 1)))) / 2) - 4

    console.log(`the sentimentFactor is ${sentimentFactor}`)

    return sentimentFactor
}