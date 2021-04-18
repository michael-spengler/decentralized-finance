import { BinanceConnector } from "../../binance/binance-connector"
import { Player } from "../audio-success-indicators/player"

const intervalLengthInSeconds = Number(process.argv[2])
const amountOfBTCToBePlayedWith = Number(process.argv[3])
const minimumProfitInUSD = Number(process.argv[4])
const binanceApiKey = process.argv[5]
const binanceApiSecret = process.argv[6]

const binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)


setInterval(async () => {

    const currentPrices = await binanceConnector.getCurrentPrices()
    const currentBitcoinPrice = currentPrices.filter((e: any) => e.coinSymbol === 'BTCUSDT')[0].price
    const currentEtherPrice = currentPrices.filter((e: any) => e.coinSymbol === 'ETHUSDT')[0].price

    const etherFactor = Math.round(currentBitcoinPrice / currentEtherPrice)

    console.log(`1 Bitcoin costs about ${etherFactor} times more than 1 Ether.`)

    const amountOfEtherToBePlayedWith = amountOfBTCToBePlayedWith * etherFactor

    const accountData = await binanceConnector.getFuturesAccountData()

    const btcPosition = accountData.positions.filter((entry: any) => entry.symbol === 'BTCUSDT')[0]
    const ethPosition = accountData.positions.filter((entry: any) => entry.symbol === 'ETHUSDT')[0]

    console.log(`btcPosition: ${btcPosition.positionAmt}`)
    console.log(`ethPosition: ${ethPosition.positionAmt}`)
    console.log(`unrealizedProfitBTC: ${btcPosition.unrealizedProfit}`)
    console.log(`unrealizedProfitETH: ${ethPosition.unrealizedProfit}`)

    if (Number(btcPosition.positionAmt) === 0 && Number(ethPosition.positionAmt) === 0) {

        console.log(`establish the going in positions by buying ${amountOfEtherToBePlayedWith} Ether and short selling ${amountOfBTCToBePlayedWith} Bitcoins.`)
        await binanceConnector.sellFuture('BTCUSDT', amountOfBTCToBePlayedWith)
        await binanceConnector.buyFuture('ETHUSDT', amountOfEtherToBePlayedWith)

    } else if (Number(btcPosition.positionAmt) < 0 && Number(ethPosition.positionAmt) > 0) {

        console.log("take the profit of the performer or wait")
        if (Number(btcPosition.unrealizedProfit) > minimumProfitInUSD) {

            console.log("take profit by cancelling BTC short position")
            await binanceConnector.buyFuture('BTCUSDT', amountOfBTCToBePlayedWith)
            Player.playMP3(`${__dirname}/../../../sounds/game-new-level.mp3`) // https://www.freesoundslibrary.com/cow-moo-sounds/ 

        } else if (Number(ethPosition.unrealizedProfit) > minimumProfitInUSD) {

            console.log("take profit by cancelling ETH long position")
            await binanceConnector.sellFuture('ETHUSDT', amountOfEtherToBePlayedWith)
            Player.playMP3(`${__dirname}/../../../sounds/game-new-level.mp3`) // https://www.freesoundslibrary.com/cow-moo-sounds/ 

        } else {
            console.log(`just waiting as PNL on BTC is ${btcPosition.unrealizedProfit} and PNL on ETH is ${ethPosition.unrealizedProfit} which is both below ${minimumProfitInUSD}.`)
        }

    } else if (Number(btcPosition.positionAmt) < 0) {
        const tolerance = minimumProfitInUSD * 3
        if (Number(btcPosition.unrealizedProfit) > 0) {
            console.log("roughly reestablish going in positions by buying Ether")
            await binanceConnector.buyFuture('ETHUSDT', amountOfEtherToBePlayedWith)
        } else if (Number(btcPosition.unrealizedProfit) < (minimumProfitInUSD * -1) - tolerance) {
            console.log(`this time it did not work as the btc short position generated a loss of ${Number(btcPosition.unrealizedProfit)}`)
            await binanceConnector.buyFuture('BTCUSDT', amountOfBTCToBePlayedWith)
            Player.playMP3(`${__dirname}/../../../sounds/single-bell-two-strikes.mp3`) // https://www.freesoundslibrary.com/cow-moo-sounds/ 
        }

    } else if (Number(ethPosition.positionAmt) > 0) {

        const tolerance = minimumProfitInUSD * 3
        if (Number(ethPosition.unrealizedProfit) > 0) {

            console.log("roughly reestablish going in positions by shorting BTC")
            await binanceConnector.sellFuture('BTCUSDT', amountOfBTCToBePlayedWith)

        } else if (Number(ethPosition.unrealizedProfit) < minimumProfitInUSD + tolerance) {
            console.log(`this time it did not work as the ether long position generated a loss of ${Number(ethPosition.unrealizedProfit)}`)
            await binanceConnector.sellFuture('ETHUSDT', amountOfEtherToBePlayedWith)
            Player.playMP3(`${__dirname}/../../../sounds/single-bell-two-strikes.mp3`) // https://www.freesoundslibrary.com/cow-moo-sounds/ 
        }
    }


}, intervalLengthInSeconds * 1000)
