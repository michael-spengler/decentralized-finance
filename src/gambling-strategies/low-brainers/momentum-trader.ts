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
        const position = accountData.positions.filter((entry: any) => entry.symbol === this.pair)[0]
        // console.log(`currentPrice: ${currentPrice}`)

        if (this.historicData.length === 500000) {
            this.historicData.splice(this.historicData.length - 1, 1)
        }

        this.historicData.unshift(currentPrice)

        const delta = this.historicData[1] - currentPrice

        const x = Math.abs(Number(((delta * 100) / this.historicData[1]).toFixed(2)))

        if (accountData.totalWalletBalance === 0) {
            await this.binanceConnector.transferFromSpotAccountToUSDTFutures(5)
        } else if (accountData.totalWalletBalance > 55) {
            await this.binanceConnector.transferFromUSDTFuturesToSpotAccount(5)
        }

        // console.log(x)
        if (x > 0.3) {
            let theFactor = Number((x * 30).toFixed(0))
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
            console.log('this time the magic did not go too well')
            const position = accountData.positions.filter((entry: any) => entry.symbol === this.pair)[0]
            if (Number(position.positionAmt) > 0) {
                const r = await this.binanceConnector.sellFuture(this.pair, Number(position.positionAmt))
                console.log(r)
            } else if (Number(position.positionAmt) < 0) {
                const r = await this.binanceConnector.buyFuture(this.pair, Number(position.positionAmt) * -1)
                console.log(r)
            }
        } else if (this.previousPNL > Math.abs(Number(position.unrealizedProfit)) * 2) {
            console.log('time to kate')
            if (position.positionAmt > 0) {
                await this.binanceConnector.sellFuture(this.pair, position.positionAmt)
            } else if (position.positionAmt < 0) {
                await this.binanceConnector.buyFuture(this.pair, Number(position.positionAmt) * -1)
            }
        } else {
            console.log(`boring times - avB: ${accountData.availableBalance}`)
        }

        this.previousPNL = Number(position.unrealizedProfit)

    }

}


const binanceApiKey = process.argv[2] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[3] // check your profile on binance.com --> API Management

const pair = 'DOGEUSDT'
const tradingUnit = 100


const jumpStarter = new MomentumTrader(binanceApiKey, binanceApiSecret, tradingUnit, pair)


setInterval(async () => {

    jumpStarter.investWisely()

}, 11 * 1000)