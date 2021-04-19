

import { BinanceConnector } from "../../binance/binance-connector"
import { Player } from "../audio-success-indicators/player"

const intervalLengthInSeconds = Number(process.argv[2]) // e.g. 5
const pair = process.argv[3] // e.g. BTCUSDT 
const ratioToBuy = Number(process.argv[4]) // e.g. 0.6
const ratioToSell = Number(process.argv[5]) // e.g. 0.2
const binanceApiKey = process.argv[6]
const binanceApiSecret = process.argv[7]

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
    console.log(`totalPositionInitialMargin: ${accountData.totalPositionInitialMargin}`)
    console.log(`totalUnrealizedProfit: ${accountData.totalUnrealizedProfit}`)
    console.log(`positionAmount: ${positionAmount} ${pair}`)
    
    const currentPrices = await binanceConnector.getCurrentPrices()
    const currentPrice = currentPrices.filter((e: any) => e.coinSymbol === pair)[0].price

    if (liquidityRatio >= ratioToBuy) {

        const howMuchCouldIBuy = currentPrice / (totalWalletBalance * 125)
        console.log(`I could buy ${howMuchCouldIBuy} ${pair}`)
        const howMuchShouldIBuy = Number((howMuchCouldIBuy / 10).toFixed(3))
        console.log(`I should buy ${howMuchShouldIBuy} ${pair}`)
    
        console.log(`buying ${howMuchShouldIBuy} of ${pair} to get the party started.`)
        await binanceConnector.buyFuture(pair, howMuchShouldIBuy)
        Player.playMP3(`${__dirname}/../../../sounds/game-new-level.mp3`) // https://www.freesoundslibrary.com/cow-moo-sounds/ 
    }

    if (liquidityRatio <= ratioToSell) {
        const howMuchShouldISell = Number((positionAmount * 0.2).toFixed(3))
        await binanceConnector.sellFuture(pair, howMuchShouldISell)
        Player.playMP3(`${__dirname}/../../../sounds/cow-moo-sound.mp3`) // https://www.freesoundslibrary.com/cow-moo-sounds/ 
        console.log(`we are selling 80% of our ${pair} position as we want to stay in the game: -- selling ${howMuchShouldISell} ${pair}.`)
    } 
    
    if (liquidityRatio > ratioToSell && liquidityRatio < ratioToBuy) {
        console.log(`it seems we are reasonably invested with a liquidity ratio of ${liquidityRatio}.`)
    }
    
}, intervalLengthInSeconds * 1000)