import { BinanceConnector } from "../../binance/binance-connector"
import { Player } from "../utilities/player"
import { PortfolioProvider } from "../utilities/portfolio-provider"

export class SchleicherShort {

    private binanceConnector: BinanceConnector
    private historicData: any[] = []
    private portfolioProvider: PortfolioProvider
    private tradingUnit: number
    private pair: string

    public constructor(apiKey: string, apiSecret: string, tradingUnit: number, pair: string) {
        this.binanceConnector = new BinanceConnector(apiKey, apiSecret)
        this.portfolioProvider = new PortfolioProvider()
        this.tradingUnit = tradingUnit
        this.pair = pair
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

        if (Number(xPosition.unrealizedProfit) > 10) {
            console.log(`time to buy back some of the shit`)
            this.binanceConnector.buyFuture(pair, Number((Number(xPosition.positionAmt) * 0.4).toFixed(0)))
        } else if (Number(xPosition.unrealizedProfit) < -1) {
            console.log(`this time you fucked it up - time to buy back most of the shit`)
            this.binanceConnector.buyFuture(pair, Number((Number(xPosition.positionAmt) * 0.9).toFixed(0)))
        } else {
            if (highestPriceSince >= 300 && Number(xPosition.positionAmt) > this.tradingUnit * 8 * -1) {
                console.log(`time to go short`)
                this.binanceConnector.sellFuture(pair, this.tradingUnit)
            } else if (Number(accountData.availableBalance) > 65) {
                console.log(`time to save something`)
                await this.binanceConnector.transferFromUSDTFuturesToSpotAccount(5)
            } else {
                console.log(`boring times`)
            }
        }
        // if (Number(accountData.availableBalance) < 1) {

        //     console.log(`emergency buying`)
        //     await this.binanceConnector.buyFuture(this.pair, this.tradingUnit)
        //     Player.playMP3(`${__dirname}/../../sounds/single-bell-two-strikes.mp3`)

        // } else if (Number(xPosition.positionAmt) <= 0) {


        // } else if (Number(accountData.availableBalance) > 1000) {

        //     await this.binanceConnector.transferFromUSDTFuturesToSpotAccount(100)

        // }

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


    private async sell(positionSellFactor: number = 0.3) {
        try {
            const accountData = await this.binanceConnector.getFuturesAccountData()
            for (const position of accountData.positions) {
                if (position.positionAmt > 0) {
                    const howMuchToSell = Number((position.positionAmt * positionSellFactor).toFixed(this.portfolioProvider.getDecimalPlaces(position.symbol)))
                    console.log(`I'll sell ${howMuchToSell} ${position.symbol}`)
                    await this.binanceConnector.sellFuture(position.symbol, howMuchToSell)
                }
            }

        } catch (error) {
            console.log(`shit happened: ${error.message}`)
        }
    }

}


const binanceApiKey = process.argv[2] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[3] // check your profile on binance.com --> API Management

// const pair = 'ETHUSDT'
// const tradingUnit = 0.007

const pair = 'DOGEUSDT'
const tradingUnit = 100


const jumpStarter = new SchleicherShort(binanceApiKey, binanceApiSecret, tradingUnit, pair)


setInterval(async () => {

    jumpStarter.investWisely()


}, 11 * 1000)