import { BinanceConnector } from "../../binance/binance-connector"
import { PortfolioProvider } from "../utilities/portfolio-provider"


export class JumpStarter {

    private binanceConnector: BinanceConnector
    private historicData: any[] = []
    private portfolioProvider: PortfolioProvider

    public constructor(apiKey: string, apiSecret: string) {
        this.binanceConnector = new BinanceConnector(apiKey, apiSecret)
        this.portfolioProvider = new PortfolioProvider()
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
        console.log(`availableBalance: ${accountData.availableBalance}`)
        // console.log(JSON.stringify(xPosition))

        if (Number(accountData.availableBalance) < 1) {
            console.log(`emergency selling 10 Percent`)
            await this.sell(0.1)
        }
        if (Number(xPosition.positionAmt) >= 0) {

            if (lowestPriceSince > 3){ 
                
                console.log(`time to start the jump - buying at ${currentPrice}`)
                this.binanceConnector.buyFuture('BTCUSDT', 0.001)
                
            } else if (highestPriceSince >= 3) { 
                console.log(`time to follow the momentum - buying at ${currentPrice}`)
                this.binanceConnector.buyFuture('BTCUSDT', 0.001)
                
            } else if (Number(xPosition.positionAmt) >= 0.001 && lowestPriceSince < highestPriceSince) {
                console.log(`time to land - selling at ${currentPrice}`)
                this.binanceConnector.sellFuture('BTCUSDT', 0.001)
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
const jumpStarter = new JumpStarter(binanceApiKey, binanceApiSecret)

setInterval(async () => {

    jumpStarter.investWisely()


}, 11 * 1000)