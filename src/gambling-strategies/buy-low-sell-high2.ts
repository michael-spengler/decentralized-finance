
const binanceApiKey = process.argv[2] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[3] // check your profile on binance.com --> API Management

import { BinanceConnector } from "../binance/binance-connector"

export class BuyLowSellHighGambler {

    private binanceConnector: BinanceConnector
    private historicData: any[] = []

    public constructor(apiKey: string, apiSecret: string) {
        this.binanceConnector = new BinanceConnector(apiKey, apiSecret)
    }

    public async investWisely(): Promise<void> {

        const currentPrices = await this.binanceConnector.getCurrentPrices()
        const price = Number(currentPrices.filter((e: any) => e.coinSymbol === 'ETHUSDT')[0].price)

        console.log(`Current Price: ${price}`)

        if (this.historicData.length === 500000) {
            this.historicData.splice(this.historicData.length - 1, 1)
        }
        this.historicData.unshift(price)

        const lowestSinceX = this.getIsLowestSinceX(price)
        const highestSinceX = this.getIsHighestSinceX(price)
        console.log(`This is the lowest Price since: ${lowestSinceX} intervals`)
        console.log(`This is the highest Price since: ${highestSinceX} intervals`)

        const accountData = await this.binanceConnector.getFuturesAccountData()

        if (Number(accountData.totalWalletBalance) > 240) {
            await this.binanceConnector.transferFromUSDTFuturesToSpotAccount(2)
        } else if(Number(accountData.totalWalletBalance) === 0) {
            await this.binanceConnector.transferFromSpotAccountToUSDTFutures(50)
        }

        const theBuyFactor = lowestSinceX / 100
        const theSellFactor = highestSinceX / 100

        if (lowestSinceX >= 5) {
            const amountToBeInvested = Number((((Number(accountData.availableBalance)) / price) * theBuyFactor).toFixed(3))
            console.log(`amountToBeInvested: ${amountToBeInvested}`)
            await this.binanceConnector.buyFuture('ETHUSDT', amountToBeInvested)
        } else if (highestSinceX >= 5 && Number(accountData.totalUnrealizedProfit) > 2) {
            const xPosition = accountData.positions.filter((entry: any) => entry.symbol === 'ETHUSDT')[0]
            let amountToBeSold = Number(((Number(xPosition.positionAmt)) * theSellFactor).toFixed(3))
            amountToBeSold = (amountToBeSold <= Number(xPosition.positionAmt)) ? amountToBeSold : Number(xPosition.positionAmt)
            console.log(`amountToBeSold: ${amountToBeSold}`)
            await this.binanceConnector.sellFuture('ETHUSDT', amountToBeSold)
        } else {
            console.log("relax")
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


const instance = new BuyLowSellHighGambler(binanceApiKey, binanceApiSecret)


setInterval(async () => {


    instance.investWisely()


}, 11 * 1000)