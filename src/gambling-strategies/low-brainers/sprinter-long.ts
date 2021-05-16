import { BinanceConnector } from "../../binance/binance-connector"
import { Player } from "../utilities/player"
import { PortfolioProvider } from "../utilities/portfolio-provider"

export class SprinterLong
 {

    private binanceConnector: BinanceConnector
    private historicData: any[] = []
    private portfolioProvider: PortfolioProvider
    private tradingUnit: number
    private pair: string
    private decimalPlacesOfPair: number

    public constructor(apiKey: string, apiSecret: string, tradingUnit: number, pair: string) {
        this.binanceConnector = new BinanceConnector(apiKey, apiSecret)
        this.portfolioProvider = new PortfolioProvider()
        this.tradingUnit = tradingUnit
        this.pair = pair
        this.decimalPlacesOfPair = new PortfolioProvider().getDecimalPlaces(this.pair)
    }

    public async investWisely(): Promise<void> {
        const currentPrices = await this.binanceConnector.getCurrentPrices()
        const currentPrice = this.portfolioProvider.getCurrentXPrice(currentPrices, this.pair)
        const accountData = await this.binanceConnector.getFuturesAccountData()
        const xPosition = accountData.positions.filter((entry: any) => entry.symbol === this.pair)[0]

        // const cPP = this.portfolioProvider.getCurrentPortfolioAveragePrice(currentPrices)

        console.log(`currentPrice: ${currentPrice}`)

        if (this.historicData.length === 500000) {
            this.historicData.splice(this.historicData.length - 1, 1)
        }

        this.historicData.unshift(currentPrice)

        const lowestPriceSince = this.getIsLowestSinceX(currentPrice)
        const highestPriceSince = this.getIsHighestSinceX(currentPrice)


        console.log(`lS: ${lowestPriceSince} - hS: ${highestPriceSince} - unrP: ${xPosition.unrealizedProfit} - avB: ${accountData.availableBalance} - posAmt: ${xPosition.positionAmt}`)

        const pricePerTradingUnit = currentPrice * this.tradingUnit

        console.log(pricePerTradingUnit)
        if (Number(accountData.availableBalance) < 2) {
            console.log(`time to sell some of the assets`)
            this.binanceConnector.sellFuture(pair, Number((Number(xPosition.positionAmt) * 0.8).toFixed(this.decimalPlacesOfPair)))
        } else {
            if ((lowestPriceSince >= 300 || this.historicData.length === 1) && Number(xPosition.positionAmt) > this.tradingUnit * 8 * -1 && Number(accountData.availableBalance) > pricePerTradingUnit / 5) {
                console.log(`time to go long`)
                this.binanceConnector.buyFuture(pair, this.tradingUnit)
            } else if (Number(accountData.availableBalance) > pricePerTradingUnit / 2) {
                console.log(`time to save something`)
                await this.binanceConnector.transferFromUSDTFuturesToSpotAccount(5)
            } else {
                console.log(`boring times`)
            }
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

// const pair = 'ETHUSDT'
// const tradingUnit = 0.007

const pair = 'BTCUSDT'
const tradingUnit = 0.01


const jumpStarter = new SprinterLong(binanceApiKey, binanceApiSecret, tradingUnit, pair)


setInterval(async () => {

    jumpStarter.investWisely()


}, 11 * 1000)