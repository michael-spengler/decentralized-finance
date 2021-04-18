

import { BinanceConnector } from "../../binance/binance-connector"
import { Player } from "../audio-success-indicators/player"

const intervalLengthInSeconds = Number(process.argv[2])
const pair = process.argv[3]
const minimumDipInUSD = Number(process.argv[4])
const amountToBeBought = Number(process.argv[5])
const minimumProfitInUSD = Number(process.argv[6])
const binanceApiKey = process.argv[7]
const binanceApiSecret = process.argv[8]


const binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)
let previousPrice: number

setInterval(async () => {

    const currentPrices = await binanceConnector.getCurrentPrices()
    const currentPrice = currentPrices.filter((e: any) => e.coinSymbol === pair)[0].price

    const accountData = await binanceConnector.getFuturesAccountData()
    const xPosition = accountData.positions.filter((entry: any) => entry.symbol === pair)[0]

    console.log(`positionAmt: ${xPosition.positionAmt}`)
    console.log(`unrealizedProfit: ${xPosition.unrealizedProfit}`)
    
    if (xPosition.positionAmt === 0 && previousPrice !== undefined) {
        console.log(`previousPrice: ${previousPrice}\ncurrentPrice: ${currentPrice}`)
        console.log(`dipSize: ${previousPrice - currentPrice}`)
            if (previousPrice < (currentPrice - minimumDipInUSD)) {
                console.log(`buying ${amountToBeBought} of ${pair} at ${currentPrice}`)
                Player.playMP3(`${__dirname}/../../../sounds/cow-moo-sound.mp3`) // https://www.freesoundslibrary.com/cow-moo-sounds/ 
            } else {
                console.log(`not enough dip yet`)
            }
    } else if (xPosition.unrealizedProfit >= minimumProfitInUSD) {
        Player.playMP3(`${__dirname}/../../../sounds/game-new-level.mp3`) // https://www.freesoundslibrary.com/cow-moo-sounds/ 
    } else {
        console.log("waiting for glittering prices")
    }

    previousPrice = currentPrice
}, 10 * 1000)