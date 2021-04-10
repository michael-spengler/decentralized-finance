import { BinanceConnector } from "./binance-connector"

export class Observer {

    public static observe() {

        let coinSymbols
        let theMagicalEntries: any[] = []
        let currentPrices: any[] = []
        let previousPrices: any[] = []
        let counter = 0
        let showTheTopX = 10

        setInterval(async () => {
            counter++

            const pricesResult = await BinanceConnector.getPrices()
            coinSymbols = Object.keys((pricesResult))

            for (const coinSymbol of coinSymbols) {
                const entry = {
                    coinSymbol: coinSymbol,
                    price: pricesResult[coinSymbol]
                }
                currentPrices.push(entry)
            }


            if (counter === 1) {
                previousPrices = currentPrices
            } else {

                for (const entry of previousPrices) {

                    const previousPrice = previousPrices.filter((e: any) => e.coinSymbol === entry.coinSymbol)[0].price

                    const deltaInPercent = ((entry.price * 100) / previousPrice) - 100

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

                previousPrices = currentPrices
            }

            theMagicalEntries.sort((a: any, b: any) => (a.deltaInPercent < b.deltaInPercent) ? 1 : -1)
            let topXCounter = 0
            for (const e of theMagicalEntries) {
                if (topXCounter === 0) {
                    console.log('geilo')
                    Observer.buy(e)
                }
                if (topXCounter < showTheTopX) {
                    console.log(`${e.coinSymbol} - ${e.currentPrice} - ${e.previousPrice} - ${e.deltaInPercent}`)
                }
                topXCounter++
            }
        }, 5 * 1000)
    }

    public static async buy(entry: any): Promise<void> {
        const availableBTCAmount = await BinanceConnector.getBTCBalance()
        console.log(`I have ${availableBTCAmount} of BTC available`)


        // let amount = Math.round(((availableBTCAmount) / entry.currentPrice) * 100) / 100

        console.log(`Bene: ${availableBTCAmount}`)
        console.log(`Dennis: ${entry.currentPrice}`)

        let amount = Math.round((availableBTCAmount - 0.0002) / entry.currentPrice)

        console.log(amount)

        if (amount > 0) {
            if (amount > 1000000000000) {
                amount = 1000000000000
            }


            const limitPrice = undefined

            console.log(`I buy ${amount} of ${entry.coinSymbol}`)
            await BinanceConnector.placeBuyOrder(entry.coinSymbol, amount)

            const stopLossPrice = entry.currentPrice * 0.95
            await BinanceConnector.placeStopLossOrder(entry.coinSymbol, amount * 0.98, stopLossPrice.toString(), stopLossPrice.toString())

        } else {
            console.log("not buying as the money is performing already")

            // nachziehen - zeit + stets 5 % unterhalb des höchsten Preises
            // await BinanceConnector.placeStopLossOrder(entry.coinSymbol, amount * 0.98, stopLossPrice.toString(), stopLossPrice.toString())

        }
    }

    private static getPrecisionForPair(pairName: string) {
        // const precisions = 
    }
}