
const binanceApiKey = process.argv[2] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[3] // check your profile on binance.com --> API Management

import { BinanceConnector } from "../binance/binance-connector"
import { Player } from "./player"
import { IPortfolio, PortfolioProvider } from "./portfolio-provider"
import { getHighestPriceOfRecentXIntervals, getLowestPriceOfRecentXIntervals } from "./utils"


export class BuyLowSellHighGambler {

    private binanceConnector: BinanceConnector
    private portfolioProvider: PortfolioProvider

    private historicData: any[] = []
    private intervalIndexCounter: number = 0

    public constructor(apiKey: string, apiSecret: string) {
        this.binanceConnector = new BinanceConnector(apiKey, apiSecret)
        this.portfolioProvider = new PortfolioProvider()
    }


    public async investWisely(): Promise<void> {

        this.intervalIndexCounter++

        const currentPrices = await this.binanceConnector.getCurrentPrices()
        const btcPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === 'BTCUSDT')[0].price)

        console.log(`current BTC Price: ${btcPrice}`)

        if (this.historicData.length === 500000) {
            this.historicData.shift()
        }
        this.historicData.push(btcPrice)


        if (this.historicData.length > 0) {

            const lowestPrice = getLowestPriceOfRecentXIntervals(this.historicData, 3)
            const highestPrice = getHighestPriceOfRecentXIntervals(this.historicData, 3)

            console.log(lowestPrice)

            const accountData = await this.binanceConnector.getFuturesAccountData()
            console.log(`available amount: ${accountData.availableBalance}`)

            const amountToBeInvested = (Number(accountData.availableBalance) / 4) / btcPrice


            if (btcPrice === lowestPrice) {

                console.log(`kaufen zum preis von ${btcPrice} - investiere ${amountToBeInvested} USDT`)
                await this.binanceConnector.buyFuture('BTCUSDT', amountToBeInvested)

            } else if (btcPrice === highestPrice) {

                const xPosition = accountData.positions.filter((entry: any) => entry.symbol === 'BTCUSDT')[0]
                console.log(JSON.stringify(xPosition))
                // await this.binanceConnector.sellFuture('BTCUSDT', 20)
                console.log(`verkaufen zum preis von ${btcPrice} - nehme ${amountToBeInvested} USDT zurück`)

            } else {

                console.log('relax')
                
            }
        }

    }

}


const instance = new BuyLowSellHighGambler(binanceApiKey, binanceApiSecret)


setInterval(async () => {


    instance.investWisely()


}, 11 * 1000)