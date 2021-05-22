import { BinanceConnector } from "../../binance/binance-connector"
import { Player } from "../utilities/player"
import { PortfolioProvider } from "../utilities/portfolio-provider"

export class Sprinter2 {

    private binanceConnector: BinanceConnector
    private historicData: any[] = []
    private portfolioProvider: PortfolioProvider
    private tradingUnit: number
    private pair: string
    private previousPNL: number = 0

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
        
        // console.log(`currentPrice: ${currentPrice}`)

        if (this.historicData.length === 500000) {
            this.historicData.splice(this.historicData.length - 1, 1)
        }

        this.historicData.unshift(currentPrice)

        const lowestPriceSince = this.getIsLowestSinceX(currentPrice)
        const highestPriceSince = this.getIsHighestSinceX(currentPrice)

        const delta = this.historicData[1] - currentPrice
        
        const x = Math.abs(Number(((delta * 100) / this.historicData[1]).toFixed(2)))
        
        if (accountData.totalWalletBalance < 20) {
            await this.binanceConnector.transferFromSpotAccountToUSDTFutures(5)
        } else if (accountData.totalWalletBalance > 55) {
            await this.binanceConnector.transferFromUSDTFuturesToSpotAccount(5)
        }
        
        console.log(x)
        if (x > 0.1) {
            const theFactor = Number((x * 30).toFixed(0))
            console.log(theFactor)
            if (delta > 0) {
                console.log(`the price decreased significantly by ${x} Percent`)
                await this.binanceConnector.sellFuture(pair, this.tradingUnit * theFactor)
            } else if (delta < 0) {
                console.log(`the price increased significantly by ${x} Percent`)
                await this.binanceConnector.buyFuture(pair, this.tradingUnit * theFactor)
            }
        } else if (Number(accountData.totalUnrealizedProfit) > 1) {
            await this.binanceConnector.transferFromUSDTFuturesToSpotAccount(1)
        } else if (Number(accountData.totalUnrealizedProfit) < -0.2) {
            console.log('this time the magic did not go too well')
            const position = accountData.positions.filter((entry: any) => entry.symbol === this.pair)[0]
            if (Number(position.positionAmt) > 0) {
                const r = await this.binanceConnector.sellFuture(this.pair, Number(position.positionAmt))
                console.log(r)
            } else if (Number(position.positionAmt) < 0) {
                const r =  await this.binanceConnector.buyFuture(this.pair, Number(position.positionAmt) * -1)
                console.log(r)
            }
        } else if (this.previousPNL > Number(accountData.totalUnrealizedProfit) * 1.5){
            console.log('time to kate')
            const position = accountData.positions.filter((entry: any) => entry.symbol === this.pair)[0]
            if (position.positionAmt > 0) {
                await this.binanceConnector.sellFuture(this.pair, position.positionAmt)
            } else if (position.positionAmt < 0) {
                await this.binanceConnector.buyFuture(this.pair, position.positionAmt)
            }
        } else {
            // console.log(`pricePerTradingUnit: ${pricePerTradingUnit} - previousPrice: ${this.historicData[1]} - currentPrice: ${currentPrice}`)
            // console.log('boring times')
            // console.log(`lS: ${lowestPriceSince} - hS: ${highestPriceSince} - unrP: ${xPosition.unrealizedProfit} - avB: ${accountData.availableBalance} - posAmt: ${xPosition.positionAmt}`)
            // const pricePerTradingUnit = currentPrice * this.tradingUnit
            // console.log(pricePerTradingUnit)
        }

        // console.log(x)
        // if (Number(accountData.availableBalance) < 2) {
        //     console.log(`time to sell some of the assets`)
        //     this.binanceConnector.sellFuture(pair, Number((Number(xPosition.positionAmt) * 0.8).toFixed(this.decimalPlacesOfPair)))
        // } else {
        //     if ((lowestPriceSince >= 300 || this.historicData.length === 1) && Number(xPosition.positionAmt) > this.tradingUnit * 8 * -1 && Number(accountData.availableBalance) > pricePerTradingUnit / 5) {
        //         console.log(`time to go long`)
        //         this.binanceConnector.buyFuture(pair, this.tradingUnit)
        //     } else if (Number(accountData.availableBalance) > pricePerTradingUnit / 2) {
        //         console.log(`time to save something`)
        //         await this.binanceConnector.transferFromUSDTFuturesToSpotAccount(5)
        //     } else {
        //         console.log(`boring times`)
        //     }
        // }

        this.previousPNL = Number(accountData.totalUnrealizedProfit)

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
const tradingUnit = 0.001


const jumpStarter = new Sprinter2(binanceApiKey, binanceApiSecret, tradingUnit, pair)


setInterval(async () => {

    jumpStarter.investWisely()


}, 11 * 1000)