

import { BinanceConnector } from "../../binance/binance-connector"
import { Player } from "../audio-success-indicators/player"

const intervalLengthInSeconds = Number(process.argv[2]) // e.g. 5
const initialSize = Number(process.argv[3]) // e.g. 0.02
const pair = process.argv[4] // e.g. BTCUSDT 
const ratioToBuy = Number(process.argv[5]) // e.g. 0.6
const ratioToSell = Number(process.argv[6]) // e.g. 0.2
const binanceApiKey = process.argv[7]
const binanceApiSecret = process.argv[8]

const binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)

setInterval(async () => {
    const accountData = await binanceConnector.getFuturesAccountData()
    const xPosition = accountData.positions.filter((entry: any) => entry.symbol === pair)[0]
    const positionAmount = Number(xPosition.positionAmt)
    const totalWalletBalance = Number(accountData.totalWalletBalance)
    const maxWithdrawAmount = Number(accountData.maxWithdrawAmount) 
    const liquidityRatio = maxWithdrawAmount / totalWalletBalance
    
    console.log(`maxWithdrawAmount: ${maxWithdrawAmount} - totalWalletBalance: ${totalWalletBalance}`)
    
    console.log(`liquidityRatio: ${liquidityRatio}`)
    
    console.log(`positionAmount: ${positionAmount}`)
    
    if (liquidityRatio >= ratioToBuy) {
        console.log(`buying ${initialSize} of ${pair} to get the party started.`)
        await binanceConnector.buyFuture(pair, initialSize)
        Player.playMP3(`${__dirname}/../../../sounds/game-new-level.mp3`) // https://www.freesoundslibrary.com/cow-moo-sounds/ 
    }

    if (liquidityRatio <= ratioToSell) {
        const size = (positionAmount * 0.8).toFixed(2)
        await binanceConnector.sellFuture(pair, initialSize)
        Player.playMP3(`${__dirname}/../../../sounds/cow-moo-sound.mp3`) // https://www.freesoundslibrary.com/cow-moo-sounds/ 
        console.log(`we are selling 80% of our ${pair} position as we want to stay in the game: -- selling ${size} ${pair}.`)
    } 
    
    if (liquidityRatio > ratioToSell && liquidityRatio < ratioToBuy) {
        console.log(`it seems we are reasonably invested with a liquidity ratio of ${liquidityRatio}.`)
    }
    
}, intervalLengthInSeconds * 1000)