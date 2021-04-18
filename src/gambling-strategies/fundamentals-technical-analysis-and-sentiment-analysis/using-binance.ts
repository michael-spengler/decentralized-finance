

import { BinanceConnector } from "../../binance/binance-connector"
import axios from "axios"
import { Player } from "../audio-success-indicators/player"

const intervalLengthInSeconds = Number(process.argv[2])
const pair = process.argv[3]
const size = Number(process.argv[4])
const takeProfitsFrom = Number(process.argv[5])
const binanceApiKey = process.argv[6]
const binanceApiSecret = process.argv[7]


const binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)

setInterval(async () => {

    const currentPrices = await binanceConnector.getCurrentPrices()
    const currentPrice = currentPrices.filter((e: any) => e.coinSymbol === pair)[0].price
    console.log(`the current ${pair} price is: ${currentPrice}`)

    const accountData = await binanceConnector.getFuturesAccountData()
    const xPosition = accountData.positions.filter((entry: any) => entry.symbol === pair)[0]

    console.log(`positionAmt: ${xPosition.positionAmt}`)
    console.log(`unrealizedProfit: ${xPosition.unrealizedProfit}`)

    const potential = (await calculateTargetPrice(pair, currentPrice)) - currentPrice
    console.log(`The potential for ${pair} is ${potential}`)

    if (potential > -30 && (Number(xPosition.positionAmt) <=0)) {
        console.log(`buying ${size}`)
        await binanceConnector.buyFuture(pair, size)
    } else if (potential < -32 && (Number(xPosition.positionAmt) >= 0)) {
        console.log(`selling ${size}`)
        await binanceConnector.sellFuture(pair, size)
    } else {
        console.log("just waiting")
    }


}, intervalLengthInSeconds * 1000)


async function calculateTargetPrice(pair: string, currentPrice: number): Promise<number> {
    let factor
    try {
        factor = ((await getSentimentFactor()) + await (getTechnicalAnalysisFactor(currentPrice)) + getFundamentalsFactor()) / 15
    } catch(error){
        console.log(`error: ${error.message}`)
        factor = 1
    }

    console.log(`the factor is ${factor}`)

    const targetPrice = currentPrice * factor
    console.log(`calculated the following targetPrice for ${pair}: ${targetPrice}`)

    return targetPrice
}

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

async function getTechnicalAnalysisFactor(currentPrice: number): Promise<number> {
    const taForecastEntry = (await axios.get('https://ml.aaronschweig.dev/technical')).data[1][0]
    const predictedETHPriceBasedOnTA = Number(taForecastEntry.value)
    console.log(`predicted ETH price based on TA for ${taForecastEntry.date} is: ${predictedETHPriceBasedOnTA}`)

    if (new Date() < new Date(taForecastEntry.date)) {
        const percentage = ((predictedETHPriceBasedOnTA - currentPrice) / currentPrice) * 100
        console.log(`percentage: ${percentage}`)

        const taFactor = 5 + (5 * percentage) / 100
        console.log(`taFactor: ${taFactor}`)

        return taFactor
    }

    return 5 // neutral
}

function getFundamentalsFactor(): number {
    return 5
}