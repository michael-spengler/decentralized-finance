
// ts-node src/gambling-strategies/low-brainer-based-using-binance/universal-considering-predictions.ts <intervalLengthInSeconds> <size> <threshold> <binanceApiKey> <binanceApiSecret> <pairToBeTraded> <limitRegardingBuyingTheDip> <shortTermDipOrPumpIndicator> <basicTendency>
// ts-node src/gambling-strategies/low-brainer-based-using-binance/universal-considering-predictions.ts 5 0.02 1 apiKey apiSecret 0.75 1 l
// pm2 start -n "considering-predictions" src/gambling-strategies/low-brainer-based-using-binance/universal-considering-predictions.ts -- 60 0.02 5 apiKey apiSecret 0.85 5 l

import { BinanceConnector } from "../../binance/binance-connector"
import axios from "axios"
import { Player } from "../audio-success-indicators/player"

const intervalLengthInSeconds = Number(process.argv[2]) // e.g. 5
const size = Number(process.argv[3]) // e.g. 0.02
const threshold = Number(process.argv[4]) // e.g. 2
const binanceApiKey = process.argv[5]
const binanceApiSecret = process.argv[6]
const pair = process.argv[7] // e.g. BTCUSDT 
const limitRegardingBuyingTheDip = Number(process.argv[8]) // e.g. 0.85
const shortTermDipOrPumpIndicator = Number(process.argv[9]) // e.g. 1
const basicTendency = process.argv[10] // e.g. s (standing for short) or p (standing for considering predictions) l (standing for long)

console.log(`intervalLengthInSeconds: ${intervalLengthInSeconds} \nsize: ${size}\nthreshold: ${threshold}\npair: ${pair}\nshortTermDipOrPumpIndicator: ${shortTermDipOrPumpIndicator}\nbasicTendency: ${basicTendency}`)

const binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)

let mostNegativeUnrealizedPNLInCurrentPosition = 0

setInterval(async () => {

    let predictionLong = true // initialization

    const accountData = await binanceConnector.getFuturesAccountData()
    const xPosition = accountData.positions.filter((entry: any) => entry.symbol === pair)[0]
    const liquidityRatio = Number(accountData.maxWithdrawAmount) / Number(accountData.totalWalletBalance)
    const positionAmountAsNumber = Number(xPosition.positionAmt)
    const unrealizedProfitAsNumber = Number(xPosition.unrealizedProfit)

    if (basicTendency === 's') {
        predictionLong = false
    } else if (basicTendency === 'p') {
        predictionLong = await isPredictionLong() // due to this line I keep this in the interval 
        await correctTheInvestmentAccordingToPredictionIfNecessary(predictionLong, positionAmountAsNumber, xPosition, unrealizedProfitAsNumber)
    } else if (basicTendency === 'l') {
        predictionLong = true   
    } else {
        throw new Error('check your parameters')
    }

    if (predictionLong) {
        await utilizeLongPrediction(positionAmountAsNumber, unrealizedProfitAsNumber, liquidityRatio, xPosition)
    } else {
        await utilizeShortPrediction(positionAmountAsNumber, unrealizedProfitAsNumber, liquidityRatio, xPosition)
    }

}, intervalLengthInSeconds * 1000)


async function isPredictionLong() {

    const predictedBTCPrice = Number((await axios.get('https://ml.aaronschweig.dev/technical/BTC-USD')).data[1][0].value)
    const currentPrices = await binanceConnector.getCurrentPrices()
    const currentPrice = currentPrices.filter((e: any) => e.coinSymbol === pair)[0].price

    console.log(`predicted ${pair} price: ${predictedBTCPrice}`)
    console.log(`current ${pair} price: ${currentPrice}`)

    return (predictedBTCPrice >= currentPrice)
    
}
async function utilizeShortPrediction(positionAmountAsNumber: number, unrealizedProfitAsNumber: number, liquidityRatio: number, xPosition: any) {
    console.log(`assuming overall declining ${pair} price`)
    if (positionAmountAsNumber === 0) {
        console.log(`selling ${size} ${pair}`)
        await binanceConnector.sellFuture(pair, size)
    } else {
        console.log(`unrealizedProfitAsNumber: ${unrealizedProfitAsNumber}`)
        if (unrealizedProfitAsNumber >= threshold) {
            console.log(`buying ${xPosition.positionAmt * -1} ${pair}`)
            await binanceConnector.buyFuture(pair, Number(xPosition.positionAmt) * -1)
            mostNegativeUnrealizedPNLInCurrentPosition = 0
            Player.playMP3(`${__dirname}/../../../sounds/game-new-level.mp3`) // https://www.freesoundslibrary.com/cow-moo-sounds/ 
        } else if (shallIUseTheDipOrPump(liquidityRatio, unrealizedProfitAsNumber)) {
                console.log(`selling the pump`)
                Player.playMP3(`${__dirname}/../../../sounds/cow-moo-sound.mp3`) // https://www.freesoundslibrary.com/cow-moo-sounds/ 
                await binanceConnector.sellFuture(pair, (size))
        } else {
            console.log(`just waiting until I made ${threshold} USD in profit or until I use the dip or pump`)
        }
    }
    
}

async function utilizeLongPrediction(positionAmountAsNumber: number, unrealizedProfitAsNumber: number, liquidityRatio: number, xPosition: any) {
    console.log(`assuming overall rising ${pair} price`)
    if (positionAmountAsNumber === 0) {
        console.log(`buying ${size} ${pair}`)
        await binanceConnector.buyFuture(pair, size)
    } else {
        console.log(`unrealizedProfitAsNumber: ${unrealizedProfitAsNumber}`)
        if (unrealizedProfitAsNumber >= threshold) {
            console.log(`selling ${xPosition.positionAmt} ${pair}`)
            await binanceConnector.sellFuture(pair, Number(xPosition.positionAmt))
            mostNegativeUnrealizedPNLInCurrentPosition = 0
            Player.playMP3(`${__dirname}/../../../sounds/game-new-level.mp3`) // https://www.freesoundslibrary.com/cow-moo-sounds/ 
        } else if (shallIUseTheDipOrPump(liquidityRatio, unrealizedProfitAsNumber)) {
                console.log(`buying the dip`)
                Player.playMP3(`${__dirname}/../../../sounds/cow-moo-sound.mp3`) // https://www.freesoundslibrary.com/cow-moo-sounds/ 
                await binanceConnector.buyFuture(pair, (size))
        } else {
            console.log(`just waiting until I made ${threshold} USD in profit`)
        }
    }
}
async function correctTheInvestmentAccordingToPredictionIfNecessary(predictionLong: boolean, positionAmountAsNumber: number, xPosition: any, unrealizedProfitAsNumber: number) {
    if (positionAmountAsNumber > 0 && !predictionLong) {
        console.log(`selling ${xPosition.positionAmt} ${pair} due to changed direction in prediction - PNL: ${unrealizedProfitAsNumber}`)
        await binanceConnector.sellFuture(pair, Number(xPosition.positionAmt))
        mostNegativeUnrealizedPNLInCurrentPosition = 0
    } else if (positionAmountAsNumber < 0 && predictionLong) {
        console.log(`buying ${xPosition.positionAmt} ${pair} due to changed direction in prediction - PNL: ${unrealizedProfitAsNumber}`)
        await binanceConnector.buyFuture(pair, Number(xPosition.positionAmt) * -1)
        mostNegativeUnrealizedPNLInCurrentPosition = 0
    }
    
}

function shallIUseTheDipOrPump(liquidityRatio: number, unrealizedProfitAsNumber: number): boolean {
    if (liquidityRatio < limitRegardingBuyingTheDip) {
        console.log(`I won't use the dip or pump as my liquidity ratio (${liquidityRatio}) is below the limit (${limitRegardingBuyingTheDip})`)
        return false
    }

    if (unrealizedProfitAsNumber < Number((shortTermDipOrPumpIndicator * -1))) {
        console.log(`The unrealizedPNL (${unrealizedProfitAsNumber}) is below the shortTermDipOrPumpIndicator (${shortTermDipOrPumpIndicator})`)
        console.log(`unrealizedProfitAsNumber: (${unrealizedProfitAsNumber}) mostNegativeUnrealizedPNLInCurrentPosition: ${mostNegativeUnrealizedPNLInCurrentPosition}`)
        if (unrealizedProfitAsNumber < mostNegativeUnrealizedPNLInCurrentPosition - shortTermDipOrPumpIndicator) {
            console.log(`This is the worst PNL we ever observed in the current position: ${mostNegativeUnrealizedPNLInCurrentPosition}. Therefore I use it.`)
            mostNegativeUnrealizedPNLInCurrentPosition = unrealizedProfitAsNumber

            return true
        }
    }
    return false
}
