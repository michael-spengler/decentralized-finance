
const lowInterval = Number(process.argv[2]) // check your profile on binance.com --> API Management
const highInterval = Number(process.argv[3]) // check your profile on binance.com --> API Management
const binanceApiKey = process.argv[4] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[5] // check your profile on binance.com --> API Management

import { BinanceConnector } from "../../binance/binance-connector"
import { getHighestPriceOfRecentXIntervals, getLowestPriceOfRecentXIntervals } from "../utils"


export class BuyLowSellHighGambler {

    private binanceConnector: BinanceConnector

    private historicData: any[] = []
    private intervalIndexCounter: number = 0

    public constructor(apiKey: string, apiSecret: string) {
        this.binanceConnector = new BinanceConnector(apiKey, apiSecret)
    }


    public async investWisely(): Promise<void> {

        this.intervalIndexCounter++

        const currentPrices = await this.binanceConnector.getCurrentPrices()
        const price = Number(currentPrices.filter((e: any) => e.coinSymbol === 'ETHUSDT')[0].price)

        console.log(`Current Price: ${price}`)
        
        if (this.historicData.length === 500000) {
            this.historicData.shift()
        }
        this.historicData.push(price)
        
        
        const accountData = await this.binanceConnector.getFuturesAccountData()
        const liquidityRatio = accountData.availableBalance / accountData.totalWalletBalance
        
        console.log(`liquidityRatio: ${liquidityRatio}`)

        if (this.intervalIndexCounter > lowInterval) {
            const lowestPrice = getLowestPriceOfRecentXIntervals(this.historicData, lowInterval)
            const highestPrice = getHighestPriceOfRecentXIntervals(this.historicData, highInterval)
            console.log(lowestPrice)
            const accountData = await this.binanceConnector.getFuturesAccountData()
            console.log(`available amount: ${accountData.availableBalance}`)
            const amountToBeInvested = Number(((Number(accountData.availableBalance) / 4) / price).toFixed(3))

            if (price === lowestPrice && liquidityRatio > 0.6) {

                console.log(`kaufen zum preis von ${price}`)
                await this.binanceConnector.buyFuture('ETHUSDT', amountToBeInvested)

            } else if (price === highestPrice && this.intervalIndexCounter > highInterval) {

                const xPosition = accountData.positions.filter((entry: any) => entry.symbol === 'ETHUSDT')[0]
                console.log(JSON.stringify(xPosition))
                await this.binanceConnector.sellFuture('ETHUSDT', Number((Number(xPosition.positionAmt) / 2).toFixed(3)))
                console.log(`verkaufen zum preis von ${price}`)

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