import { BinanceConnector } from "../../binance/binance-connector"
import { Player } from "../utilities/player"
import { PortfolioProvider } from "../utilities/portfolio-provider"

export class MomentumTrader {

    private binanceConnector: BinanceConnector
    private historicData: any[] = []
    private portfolioProvider: PortfolioProvider
    private tradingUnit: number
    private pair: string
    private previousPNL: number = 0
    private limit: number = 0

    public constructor(apiKey: string, apiSecret: string, tradingUnit: number, pair: string, limit: number) {
        this.binanceConnector = new BinanceConnector(apiKey, apiSecret)
        this.portfolioProvider = new PortfolioProvider()
        this.tradingUnit = tradingUnit
        this.pair = pair
        this.limit = limit
    }

    public async investWisely(): Promise<void> {
        const currentPrices = await this.binanceConnector.getCurrentPrices()
        const currentPrice = this.portfolioProvider.getCurrentXPrice(currentPrices, this.pair)
        const accountData = await this.binanceConnector.getFuturesAccountData()
        const position = accountData.positions.filter((entry: any) => entry.symbol === this.pair)[0]
        // console.log(`currentPrice: ${currentPrice}`)

        if (this.historicData.length === 500000) {
            this.historicData.splice(this.historicData.length - 1, 1)
        }

        this.historicData.unshift(currentPrice)

        const delta = this.historicData[1] - currentPrice

        const x = Math.abs(Number(((delta * 100) / this.historicData[1]).toFixed(2)))

        if (Number(accountData.totalWalletBalance) < 5) {
            await this.binanceConnector.transferFromSpotAccountToUSDTFutures(5)
        } else if (accountData.totalWalletBalance > 55) {
            await this.binanceConnector.transferFromUSDTFuturesToSpotAccount(5)
        }

        // console.log(x)
        if (x > this.limit) {

            let theFactor = Number((x * 10).toFixed(0))
            theFactor = (theFactor > 7) ? 7 : theFactor
            console.log(`theFactor: ${theFactor}`)
            if (delta > 0) {
                console.log(`the price decreased significantly by ${x} Percent`)
                await this.binanceConnector.sellFuture(pair, this.tradingUnit * theFactor)
            } else if (delta < 0) {
                console.log(`the price increased significantly by ${x} Percent`)
                await this.binanceConnector.buyFuture(pair, this.tradingUnit * theFactor)
            }

        } else if (Number(position.unrealizedProfit) > 1) {

            await this.binanceConnector.transferFromUSDTFuturesToSpotAccount(1)

        } else if (Number(position.unrealizedProfit) < -0.2) {

            console.log(`I should get out of that shit as the PNL is ${position.unrealizedProfit}`)

            if (Number(position.positionAmt) > 0) {
                const r = await this.binanceConnector.sellFuture(this.pair, Number(position.positionAmt))
                console.log(r)
            } else if (Number(position.positionAmt) < 0) {
                const r = await this.binanceConnector.buyFuture(this.pair, Number(position.positionAmt) * -1)
                console.log(r)
            }

        } else if (this.previousPNL > Math.abs(Number(position.unrealizedProfit)) * 2) {

            console.log(`the previous PNL ${this.previousPNL} was much better than the current ${position.unrealizedProfit}`)
            if (position.positionAmt > 0) {
                await this.binanceConnector.sellFuture(this.pair, position.positionAmt)
            } else if (position.positionAmt < 0) {
                await this.binanceConnector.buyFuture(this.pair, Number(position.positionAmt) * -1)
            }

        } else {

            console.log(`boring times (${x} is below ${limit}) - avB: ${accountData.availableBalance}`)

        }

        this.previousPNL = Number(position.unrealizedProfit)

    }

}


const binanceApiKey = process.argv[2] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[3] // check your profile on binance.com --> API Management
const limit = Number(process.argv[4]) // e.g. 0.4

const pair = 'DOGEUSDT'
const tradingUnit = 100


const momentumTrader = new MomentumTrader(binanceApiKey, binanceApiSecret, tradingUnit, pair, limit)


setInterval(async () => {

    momentumTrader.investWisely()

}, 11 * 1000)