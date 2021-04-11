import { BinanceConnector } from "./binance-connector"
import { exchangeData } from "./exchange-data"

export class Observer {

    private static previousStopLossPrice = 0
    private static currentInvestmentSymbol = ""
    private static currentlyInvestedUnits = 0
    private static availableBTCAmount = 0
    private static currentPrices: any[] = []
    private static previousPrices: any[] = []

    public static observe(intervalLengthInSeconds: number) {

        setInterval(async () => {

            Observer.availableBTCAmount = Number(await BinanceConnector.getBTCBalance())
            Observer.currentPrices = await BinanceConnector.getCurrentPrices()

            console.log(`I have ${Observer.availableBTCAmount} of BTC available.`)

            if (Observer.previousPrices.length > 0) {

                if (Observer.availableBTCAmount > 0.0005) {

                    console.log("I'm not invested, I'll buy the best performer")
                    await Observer.buyBestPerformer()

                } else {

                    console.log("I'm already invested, I'll update the stop loss")

                    const currentPriceOfCurrentInvestment = Observer.currentPrices.filter((e: any) => e.coinSymbol === Observer.currentInvestmentSymbol)[0].price
                    const stopLossPrice = Number((currentPriceOfCurrentInvestment * 0.95).toFixed(8))

                    if (Observer.previousStopLossPrice < stopLossPrice) {
                        console.log(`setting stop loss for ${Observer.currentlyInvestedUnits} units of ${Observer.currentInvestmentSymbol}`)
                        // if (Observer.orderIDOfCurrentStopLoss !== "") {
                        try {
                            await BinanceConnector.cancelAllOrders(Observer.currentInvestmentSymbol)
                        } catch (error) {
                            console.log('nothing deleted')
                        }
                        await BinanceConnector.placeStopLossOrder(Observer.currentInvestmentSymbol, Observer.currentlyInvestedUnits - 2, stopLossPrice.toString(), stopLossPrice.toString())
                        // await BinanceConnector.placeStopLossOrder("ONGBTC", Observer.currentlyInvestedUnits - 2, stopLossPrice.toString(), stopLossPrice.toString())
                        Observer.previousStopLossPrice = stopLossPrice
                    }

                }

            } 

            Observer.previousPrices = [...Observer.currentPrices]

        }, intervalLengthInSeconds * 1000)
    }

    private static async buyBestPerformer() {
        const bestPerformer = Observer.getBestPerformer()
        if (bestPerformer !== undefined) {
            console.log(`The best performer along the last 5 seconds was ${bestPerformer.coinSymbol} - ${bestPerformer.currentPrice} - ${bestPerformer.previousPrice} - ${bestPerformer.deltaInPercent}`)
            await Observer.buyAndSetStopLoss(bestPerformer.coinSymbol, bestPerformer.currentPrice)
            Observer.currentInvestmentSymbol = bestPerformer.coinSymbol

        }

    }

    private static getBestPerformer() {
        let theMagicalEntries: any[] = []
        for (const entry of Observer.currentPrices) {
            const previousPrice = Observer.previousPrices.filter((e: any) => e.coinSymbol === entry.coinSymbol)[0].price
            console.log(`calculating delta in percent: current: ${entry.price} previous: ${previousPrice}`)
            const deltaInPercent = (((entry.price * 100) / previousPrice) - 100).toFixed(4)

            const magicEntry = {
                coinSymbol: entry.coinSymbol,
                previousPrice: previousPrice,
                currentPrice: entry.price,
                deltaInPercent: deltaInPercent
            }

            if (entry.coinSymbol.includes('BTC')) {
                theMagicalEntries.push(magicEntry)
            }
        }

        theMagicalEntries.sort((a: any, b: any) => (a.deltaInPercent < b.deltaInPercent) ? 1 : -1)

        return theMagicalEntries[0]
        // adjust investments

        // let topXCounter = 0
        // for (const e of theMagicalEntries) {
        //     if (topXCounter === 0 && Observer.invested === false) {
        //         await Observer.buyAndSetStopLoss(e)
        //     }
        //     if (topXCounter < showTheTopX) {
        //         console.log(`${e.coinSymbol} - ${e.currentPrice} - ${e.previousPrice} - ${e.deltaInPercent}`)
        //     }
        //     topXCounter++
        // }
    }



    public static async buyAndSetStopLoss(coinSymbol: string, currentPriceOfBestPerformer: number): Promise<void> {
        // let amount = Math.round(((availableBTCAmount) / entry.currentPrice) * 100) / 100

        let amount = Math.round((Observer.availableBTCAmount - 0.0002) / currentPriceOfBestPerformer)

        console.log(amount)


        console.log(`I buy ${amount} of ${coinSymbol}`)
        await BinanceConnector.placeBuyOrder(coinSymbol, amount)
        Observer.currentlyInvestedUnits = amount

        // const stopLossPrice = currentPriceOfBestPerformer * 0.95
        // await BinanceConnector.placeStopLossOrder(coinSymbol, amount * 0.98, stopLossPrice.toString(), stopLossPrice.toString())

        // Observer.previousStopLossPrice = stopLossPrice

        // const newStopLossPrice = Observer.previousStopLossPrice * 1.005
        // console.log(`not buying as the money is performing already. I just update the stop loss to ${newStopLossPrice}`)

        // await BinanceConnector.placeStopLossOrder(coinSymbol, amount * 0.98, newStopLossPrice.toString(), newStopLossPrice.toString())
        // Observer.previousStopLossPrice = stopLossPrice

        // nachziehen - zeit + stets 5 % unterhalb des aktuelle Preises & > bisheriger stop loss
        // await BinanceConnector.placeStopLossOrder(entry.coinSymbol, amount * 0.98, stopLossPrice.toString(), stopLossPrice.toString())
    }

    // private static async increaseStopLoss() {
    //     const newStopLossPrice = Observer.previousStopLossPrice * 1.005
    //     console.log(`not buying as the money is performing already. I just update the stop loss to ${newStopLossPrice}`)

    //     await BinanceConnector.placeStopLossOrder(entry.coinSymbol, amount * 0.98, newStopLossPrice.toString(), newStopLossPrice.toString())

    // }

    private static getPrecisionForPair(pairName: string) {
        return exchangeData // needs to be implemented properly
    }
}