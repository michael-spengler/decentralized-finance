

import { BinanceConnector } from "../../binance/binance-connector"
import { Player } from "../audio-success-indicators/player"

const intervalLengthInSeconds = Number(process.argv[2]) // e.g. 11
const pair = process.argv[3] // e.g. ETHUSDT 
const ratioToBuy = Number(process.argv[4]) // e.g. 0.5
const ratioToSell = Number(process.argv[5]) // e.g. 0.04
const binanceApiKey = process.argv[6] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[7] // check your profile on binance.com --> API Management

const binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)

setInterval(async () => {
    const accountData = await binanceConnector.getFuturesAccountData()
    const xPosition = accountData.positions.filter((entry: any) => entry.symbol === pair)[0]
    const positionAmount = Number(xPosition.positionAmt)
    const totalWalletBalance = Number(accountData.totalWalletBalance)
    const maxWithdrawAmount = Number(accountData.maxWithdrawAmount) 
    const liquidityRatio = maxWithdrawAmount / totalWalletBalance

    // console.log(`positionAmount: ${positionAmount} ${pair}`)
    // console.log(`totalPositionInitialMargin: ${accountData.totalPositionInitialMargin}`)
    console.log(`walletBalance: ${totalWalletBalance} - unrealizedPNL: ${accountData.totalUnrealizedProfit} - maxWithdrawAmount: ${maxWithdrawAmount}`)
    
    const currentPrices = await binanceConnector.getCurrentPrices()
    const currentPrice = currentPrices.filter((e: any) => e.coinSymbol === pair)[0].price

    if (liquidityRatio >= ratioToBuy) {

        const howMuchCouldIBuy = currentPrice / (totalWalletBalance * 125)
        const howMuchShouldIBuy = Number((howMuchCouldIBuy / 10).toFixed(3))
        console.log(`I could buy ${howMuchCouldIBuy} ${pair} - I buy ${howMuchShouldIBuy} ${pair}`)
    
        await binanceConnector.buyFuture(pair, howMuchShouldIBuy)
        Player.playMP3(`${__dirname}/../../../sounds/game-new-level.mp3`) // https://www.freesoundslibrary.com/cow-moo-sounds/ 
    }

    if (liquidityRatio <= ratioToSell) {
        const howMuchShouldISell = Number((positionAmount * 0.2).toFixed(3))
        await binanceConnector.sellFuture(pair, howMuchShouldISell)
        console.log(`selling ${howMuchShouldISell} ${pair}.`)
        Player.playMP3(`${__dirname}/../../../sounds/cow-moo-sound.mp3`) // https://www.freesoundslibrary.com/cow-moo-sounds/ 
    } 
    
    if (liquidityRatio > ratioToSell && liquidityRatio < ratioToBuy) {
        console.log(`it seems we are reasonably invested with a liquidity ratio of ${liquidityRatio}.`)
    }
    
}, intervalLengthInSeconds * 1000)