import { BinanceConnector } from "../../binance/binance-connector"
import { Player } from "../utilities/player"
import { PortfolioProvider } from "../utilities/portfolio-provider"


export class JumpStarter {

    private binanceConnector: BinanceConnector
    private historicData: any[] = []
    private portfolioProvider: PortfolioProvider
    private tradingUnit: number
    private pair: string
    private transferLimit: number = 0
    private limit: number = 0

    public constructor(apiKey: string, apiSecret: string, tradingUnit: number, pair: string, limit = 40, transferLimit = 1000) {
        this.binanceConnector = new BinanceConnector(apiKey, apiSecret)
        this.portfolioProvider = new PortfolioProvider()
        this.tradingUnit = tradingUnit
        this.pair = pair
        this.transferLimit = transferLimit
        this.limit = limit
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


        console.log(`lowestSince: ${lowestPriceSince} - highestSince: ${highestPriceSince} - unrP: ${xPosition.unrealizedProfit} - availableBalance: ${accountData.availableBalance}`)

        if (Number(accountData.availableBalance) < 1) {

            console.log(`emergency selling 10 Percent`)
            await this.sell(0.1)

        } else {

            if (lowestPriceSince >= this.limit && Number(xPosition.positionAmt) >= this.tradingUnit) {
                
                console.log(`time to follow the severe downwards momentum - selling 70 percent at ${currentPrice}`)
                this.sell(0.7)

            } else if (lowestPriceSince > this.limit * 0.3) {

                console.log(`time to start the jump - buying at ${currentPrice}`)
                this.binanceConnector.buyFuture(this.pair, this.tradingUnit)

            } else if (highestPriceSince >= this.limit) {

                console.log(`time to follow the severe upwards momentum - buying at ${currentPrice}`)
                this.binanceConnector.buyFuture(this.pair, this.tradingUnit)

            } else if (highestPriceSince > this.limit * 0.5 && Number(xPosition.unrealizedProfit) > 5 && Number(xPosition.positionAmt) >= this.tradingUnit) {

                console.log(`time to sell at ${currentPrice}`)
                await this.sell(0.1)

            }


            if (Number(accountData.availableBalance) > this.transferLimit) {

                await this.binanceConnector.transferFromUSDTFuturesToSpotAccount(this.transferLimit * 0.1)

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

const tradingUnit = Number(process.argv[4]) // e.g. 0.007
const pair = process.argv[5] // e.g. 'ETHUSDT'
const limit = Number(process.argv[6]) // e.g. 50
const transferLimit = Number(process.argv[7]) // e.g. 1000

const jumpStarter = new JumpStarter(binanceApiKey, binanceApiSecret, tradingUnit, pair, limit, transferLimit)


setInterval(async () => {

    jumpStarter.investWisely()


}, 11 * 1000)