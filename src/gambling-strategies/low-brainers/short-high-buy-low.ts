import { BinanceConnector } from "../../binance/binance-connector"
import { PortfolioProvider } from "../utilities/portfolio-provider"


export class ShortHighBuyLow {

    private binanceConnector: BinanceConnector
    private historicData: any[] = []
    private portfolioProvider: PortfolioProvider
    private highestSinceXLimit: number

    public constructor(apiKey: string, apiSecret: string, highestSinceXLimit: number) {
        this.binanceConnector = new BinanceConnector(apiKey, apiSecret)
        this.portfolioProvider = new PortfolioProvider()
        this.highestSinceXLimit = highestSinceXLimit
    }

    public async investWisely(): Promise<void> {
        const currentPrices = await this.binanceConnector.getCurrentPrices()
        const currentPrice = this.portfolioProvider.getCurrentXPrice(currentPrices, 'DOGEUSDT')
        const accountData = await this.binanceConnector.getFuturesAccountData()
        const xPosition = accountData.positions.filter((entry: any) => entry.symbol === 'DOGEUSDT')[0]
        const liquidityRatio = accountData.availableBalance / accountData.totalWalletBalance

        // const cPP = this.portfolioProvider.getCurrentPortfolioAveragePrice(currentPrices)

        if (this.historicData.length === 500000) {
            this.historicData.splice(this.historicData.length - 1, 1)
        }

        this.historicData.unshift(currentPrice)

        const lowestPriceSince = this.getIsLowestSinceX(currentPrice)
        const highestPriceSince = this.getIsHighestSinceX(currentPrice)


        console.log(`price: ${currentPrice} = lowestSince: ${lowestPriceSince} - highestSince: ${highestPriceSince} - uPNL: ${xPosition.unrealizedProfit} - wB: ${accountData.totalWalletBalance} - lr: ${liquidityRatio}`)
        // console.log(JSON.stringify(xPosition))

        if (Number(accountData.totalWalletBalance) === 0) {
            const availableUSDTBalanceInSpotAccount = Number(await this.binanceConnector.getUSDTBalance())
            const transferAmount = availableUSDTBalanceInSpotAccount / 2
            await this.binanceConnector.transferFromSpotAccountToUSDTFutures(transferAmount)
        }

        if (highestPriceSince > this.highestSinceXLimit && liquidityRatio > 0.9) {

            console.log(`time to start - shorting at ${currentPrice}`)
            this.binanceConnector.sellFuture('DOGEUSDT', 100)
            await this.binanceConnector.transferFromUSDTFuturesToSpotAccount(1)

        } else if (highestPriceSince > (highestSinceXLimit * 2) && Number(xPosition.positionAmt) <= -100) {

            console.log(`time to land - buying back the dogshit at ${currentPrice}`)
            this.binanceConnector.buyFuture('DOGEUSDT', 100)


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
const highestSinceXLimit = Number(process.argv[4]) // e.g. 3

const buyLowSellHigh = new ShortHighBuyLow(binanceApiKey, binanceApiSecret, highestSinceXLimit)

setInterval(async () => {

    buyLowSellHigh.investWisely()


}, 11 * 1000)