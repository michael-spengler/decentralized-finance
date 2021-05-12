import { BinanceConnector } from "../../binance/binance-connector"
import { PortfolioProvider } from "../utilities/portfolio-provider"


export class BuyLowSellHigh {

    private binanceConnector: BinanceConnector
    private historicData: any[] = []
    private portfolioProvider: PortfolioProvider
    private lowestSinceXLimit: number

    public constructor(apiKey: string, apiSecret: string, lowestSinceXLimit: number) {
        this.binanceConnector = new BinanceConnector(apiKey, apiSecret)
        this.portfolioProvider = new PortfolioProvider()
        this.lowestSinceXLimit = lowestSinceXLimit
    }

    public async investWisely(): Promise<void> {
        const currentPrices = await this.binanceConnector.getCurrentPrices()
        const currentPrice = this.portfolioProvider.getCurrentXPrice(currentPrices, 'BTCUSDT')
        const accountData = await this.binanceConnector.getFuturesAccountData()
        const xPosition = accountData.positions.filter((entry: any) => entry.symbol === 'BTCUSDT')[0]

        // const cPP = this.portfolioProvider.getCurrentPortfolioAveragePrice(currentPrices)

        console.log(currentPrice)

        if (this.historicData.length === 500000) {
            this.historicData.splice(this.historicData.length - 1, 1)
        }

        this.historicData.unshift(currentPrice)

        const lowestPriceSince = this.getIsLowestSinceX(currentPrice)
        const highestPriceSince = this.getIsHighestSinceX(currentPrice)


        console.log(`lowestPriceSince: ${lowestPriceSince}`)
        console.log(`highestPriceSince: ${highestPriceSince}`)
        console.log(`unrealizedProfit: ${xPosition.unrealizedProfit}`)
        // console.log(JSON.stringify(xPosition))


        if (lowestPriceSince > this.lowestSinceXLimit) {

            console.log(`time to start - buying at ${currentPrice}`)
            this.binanceConnector.buyFuture('BTCUSDT', 0.001)

            console.log(Math.pow(lowestSinceXLimit, 2))
        } else if (highestPriceSince > (Math.pow(lowestSinceXLimit, 2)) && Number(xPosition.positionAmt) >= 0.001) {
            console.log(`time to land - selling at ${currentPrice}`)
            this.binanceConnector.sellFuture('BTCUSDT', 0.001)

        }
    }

    private getIsLowestSinceX(price: number) {
        let counter = 0

        for (const e of this.historicData) {
            if (price > e) {
                return counter
            }
            counter++
        }
        return counter
    }

    private getIsHighestSinceX(price: number) {
        let counter = 0

        for (const e of this.historicData) {
            if (price < e) {
                return counter
            }
            counter++
        }
        return counter
    }
}


const binanceApiKey = process.argv[2] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[3] // check your profile on binance.com --> API Management
const lowestSinceXLimit = Number(process.argv[4]) // e.g. 3

const buyLowSellHigh = new BuyLowSellHigh(binanceApiKey, binanceApiSecret, lowestSinceXLimit)

setInterval(async () => {

    buyLowSellHigh.investWisely()


}, 11 * 1000)