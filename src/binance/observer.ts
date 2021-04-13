import { BinanceConnector } from "./binance-connector"
import { exchangeData } from "./exchange-data"

export class Observer {

    private static intervalCounterPerInvestment = 0
    private static currentPriceOfCurrentInvestment = 0
    private static amountToBeSold = 0
    private static previousStopLossPrice = 0
    private static currentInvestmentSymbol = ""
    private static currentlyInvestedUnits = 0
    private static availableBTCAmount = 0
    private static currentPrices: any[] = []
    private static previousPrices: any[] = []

    public static observe(intervalLengthInSeconds: number, maxNumberOfPatienceIntervals: number, currentInvestmentSymbol?: string, currentlyInvestedUnits?: number) {
        setInterval(async () => {
            Observer.currentPrices = await BinanceConnector.getCurrentPrices()

    
            // await Observer.applyPumpExploitStrategy(maxNumberOfPatienceIntervals, currentInvestmentSymbol, currentlyInvestedUnits)
            await Observer.applyBTCLeadExploitStrategy(maxNumberOfPatienceIntervals, currentInvestmentSymbol, currentlyInvestedUnits)
            // await Observer.applyBenesBTCLeadExploitStrategy(maxNumberOfPatienceIntervals, currentInvestmentSymbol, currentlyInvestedUnits)


            Observer.previousPrices = [...Observer.currentPrices]
        }, intervalLengthInSeconds * 1000)
    }

    private static async applyBenesBTCLeadExploitStrategy(maxNumberOfPatienceIntervals: number, currentInvestmentSymbol?: string, currentlyInvestedUnits?: number) {
        console.log("do it Bene")
    }

    private static async applyBTCLeadExploitStrategy(maxNumberOfPatienceIntervals: number, currentInvestmentSymbol?: string, currentlyInvestedUnits?: number) {

        const accountData = await BinanceConnector.getFuturesAccountData()


        // console.log(accountData.assets.filter((entry: any) => entry.asset === "USDT")[0])
        // console.log(accountData.positions.filter((entry: any) => entry.symbol === "BTCUSDT")[0])
        const etherPosition = accountData.positions.filter((entry: any) => entry.symbol === "ETHUSDT")[0]
        console.log(etherPosition)


        if (Observer.previousPrices.length > 0) {
            const previousPrice = Math.round(Observer.previousPrices.filter((e: any) => e.coinSymbol === "BTCUSDT")[0].price)
            const currentPrice = Math.round(Observer.currentPrices.filter((e: any) => e.coinSymbol === "BTCUSDT")[0].price)
            console.log(`previous: ${previousPrice} vs. current: ${currentPrice}`)
            const increasedEnoughForBuy = (previousPrice + 4 < currentPrice) ? true : false
            const decreasedEnoughForSale = (previousPrice > currentPrice + 4) ? true : false
            console.log(`increasedEnoughForBuy: ${increasedEnoughForBuy}`)
            console.log(`decreasedEnoughForSale: ${decreasedEnoughForSale}`)

            if (increasedEnoughForBuy && (etherPosition.positionAmt === '0.000' || etherPosition.positionAmt === '-3.000') ) {
                console.log("buying")
                await BinanceConnector.buyFuture("ETHUSDT", 3.0)
            } else if (decreasedEnoughForSale && (etherPosition.positionAmt === '0.000' || etherPosition.positionAmount === '3.000')) {
                console.log("selling")
                await BinanceConnector.sellFuture("ETHUSDT", 3.0)
                // await BinanceConnector.cancelPosition("ETHUSDT")
            } else {
                console.log("sleep :)")
            }

        }
    }

    private static async applyPumpExploitStrategy(maxNumberOfPatienceIntervals: number, currentInvestmentSymbol?: string, currentlyInvestedUnits?: number) {
        if (currentInvestmentSymbol !== undefined) {
            Observer.currentInvestmentSymbol = currentInvestmentSymbol
            Observer.currentlyInvestedUnits = currentlyInvestedUnits as number
        }


        Observer.intervalCounterPerInvestment = Observer.intervalCounterPerInvestment + 1

        console.log(`intervalCounterPerInvestment: ${Observer.intervalCounterPerInvestment}`)

        Observer.availableBTCAmount = Number(await BinanceConnector.getBTCBalance())
        console.log(`I have ${Observer.availableBTCAmount} of BTC available.`)

        if (Observer.previousPrices.length > 0) {

            if (Observer.availableBTCAmount > 0.0005) {

                console.log("I'm not invested, I'll buy the best performer")
                await Observer.buyBestPerformer()

            } else if (Observer.intervalCounterPerInvestment < maxNumberOfPatienceIntervals) {

                console.log("I'm already invested.")
                Observer.currentPriceOfCurrentInvestment = Observer.currentPrices.filter((e: any) => e.coinSymbol === Observer.currentInvestmentSymbol)[0].price

                console.log(`currentPriceOfCurrentInvestment: ${Observer.currentPriceOfCurrentInvestment}`)

                // const stopLossPrice = Number((Observer.currentPriceOfCurrentInvestment * 0.95).toFixed(8))
                const stopLossPrice = Number((Observer.currentPriceOfCurrentInvestment * 0.95).toFixed(8))
                console.log(`stopLossPrice: ${stopLossPrice}`)

                if (Observer.previousStopLossPrice < stopLossPrice) {
                    try {
                        await BinanceConnector.cancelAllOrders(Observer.currentInvestmentSymbol)
                    } catch (error) {
                        console.log('nothing deleted')
                    }
                    Observer.amountToBeSold = Observer.currentlyInvestedUnits * 0.98
                    console.log(`setting stop loss for ${Observer.amountToBeSold} units of ${Observer.currentInvestmentSymbol}`)
                    console.log("I'll update the stop loss")

                    try {
                        await BinanceConnector.placeStopLossOrder(Observer.currentInvestmentSymbol, Observer.amountToBeSold, stopLossPrice, stopLossPrice)
                    } catch (error) {
                        try {
                            console.log('wir sind hier')
                            await BinanceConnector.placeStopLossOrder(Observer.currentInvestmentSymbol, Math.round(Observer.amountToBeSold), stopLossPrice, stopLossPrice)
                        } catch (error) {
                            console.log('wir sind da')
                            try {
                                await BinanceConnector.placeStopLossOrder(Observer.currentInvestmentSymbol, (Math.round(Observer.amountToBeSold) - 1), stopLossPrice, stopLossPrice)
                            } catch (error) {
                                console.log(error.message)
                            }
                        }
                    }


                    Observer.previousStopLossPrice = stopLossPrice
                    Observer.intervalCounterPerInvestment = 0
                }
            } else {
                console.log(`It took too long. We want to get rich quick.`)
                try {
                    await BinanceConnector.cancelAllOrders(Observer.currentInvestmentSymbol)
                } catch (error) {
                    console.log("Scheiß drauf. Malle ist nur einmal im Jahr.")
                }

                console.log(`we want to sell ${Observer.amountToBeSold} ${Observer.currentInvestmentSymbol} as we bought ${Observer.currentlyInvestedUnits} of it earlier.`)
                try {
                    await BinanceConnector.placeSellOrder(Observer.currentInvestmentSymbol, Observer.amountToBeSold)
                } catch (error) {
                    console.log("schief 1")
                    try {
                        await BinanceConnector.placeSellOrder(Observer.currentInvestmentSymbol, Math.round(Observer.amountToBeSold))
                    } catch (error) {
                        console.log("schief 2")
                        await BinanceConnector.placeSellOrder(Observer.currentInvestmentSymbol, (Math.round(Observer.amountToBeSold) - 1))

                    }

                }
                Observer.previousStopLossPrice = 0

            }

        }

    }
    private static async buyBestPerformer() {
        const bestPerformer = Observer.getBestPerformer()
        if (bestPerformer !== undefined) {
            console.log(`The best performer along the last 5 seconds was ${bestPerformer.coinSymbol} - ${bestPerformer.currentPrice} - ${bestPerformer.previousPrice} - ${bestPerformer.deltaInPercent}`)
            await Observer.buyAndSetStopLoss(bestPerformer.coinSymbol, bestPerformer.currentPrice)
            Observer.currentInvestmentSymbol = bestPerformer.coinSymbol
            Observer.intervalCounterPerInvestment = 0

        }

    }

    private static getBestPerformer() {
        let theMagicalEntries: any[] = []
        for (const entry of Observer.currentPrices) {
            const previousPrice = Observer.previousPrices.filter((e: any) => e.coinSymbol === entry.coinSymbol)[0].price
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

    }
}