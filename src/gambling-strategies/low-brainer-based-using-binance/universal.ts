import { BinanceConnector } from "../../binance/binance-connector"

const intervalLengthInSeconds = Number(process.argv[2])
const size = Number(process.argv[3])
const threshold = Number(process.argv[4])
const binanceApiKey = process.argv[5]
const binanceApiSecret = process.argv[6]
const pair = process.argv[7]
const limitRegardingBuyingTheDip = Number(process.argv[8])
const dipIndicator = Number(process.argv[9])

let dipCounter = 0

console.log(`intervalLengthInSeconds: ${intervalLengthInSeconds}`)
console.log(`size: ${size}`)
console.log(`threshold: ${threshold}`)
console.log(`binanceApiKey: ${binanceApiKey}`)
console.log(`binanceApiSecret: ${binanceApiSecret}`)
console.log(`pair: ${pair}`)

const binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)

setInterval(async () => {

    const accountData = await binanceConnector.getFuturesAccountData()
    const xPosition = accountData.positions.filter((entry: any) => entry.symbol === pair)[0]
    const liquidityRatio = Number(accountData.maxWithdrawAmount) / Number(accountData.totalWalletBalance)

    // console.log(liquidityRatio)
    // console.log(xPosition)

    const positionAmountAsNumber = Number(xPosition.positionAmt)
    const unrealizedProfitAsNumber = Number(xPosition.unrealizedProfit)

    if (positionAmountAsNumber === 0) {
        console.log(`buying ${size} ${pair}`)
        await binanceConnector.buyFuture(pair, size)
    } else {
        console.log(unrealizedProfitAsNumber)
        if (unrealizedProfitAsNumber >= threshold) {
            console.log(`selling ${size} ${pair}`)
            await binanceConnector.sellFuture(pair, Number(xPosition.positionAmt))
            // play sound
            dipCounter = 0
        } else if ((unrealizedProfitAsNumber < ((dipCounter + 1) * (((threshold / 2) * dipIndicator) * -1))) && liquidityRatio > limitRegardingBuyingTheDip) {
            console.log(`buying the dip`)
            dipCounter++
            await binanceConnector.buyFuture(pair, (size * dipCounter))
        } else {
            console.log(`waiting until I made ${threshold} USD in profit`)
        }
    }

}, intervalLengthInSeconds * 1000)
