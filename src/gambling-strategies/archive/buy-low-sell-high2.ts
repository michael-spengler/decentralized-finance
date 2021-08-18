import { BinanceConnector } from "../../binance/binance-connector"

const pair = process.argv[2] // e.g. ETHUSDT or BTCUSDT
const binanceApiKey = process.argv[3] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[4] // check your profile on binance.com --> API Management

export class BuyLowSellHighGambler {

    private readonly binanceConnector: BinanceConnector
    private readonly historicData: any[] = []

    public constructor(apiKey: string, apiSecret: string) {
        this.binanceConnector = new BinanceConnector(apiKey, apiSecret)
    }

    public async investWisely(): Promise<void> {

        const currentPrices = await this.binanceConnector.getCurrentPrices()
        const price = Number(currentPrices.filter((e: any) => e.coinSymbol === pair)[0].price)

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

        if (Number(accountData.totalWalletBalance) > 850) {
            await this.binanceConnector.transferFromUSDTFuturesToSpotAccount(2)
        } else if (Number(accountData.totalWalletBalance) === 0) {
            await this.binanceConnector.transferFromSpotAccountToUSDTFutures(50)
        }

        let theBuyFactor = lowestSinceX / 100
        const theSellFactor = highestSinceX / 100

        theBuyFactor = (theBuyFactor > 0.2) ? 0.2 : theBuyFactor

        if (lowestSinceX >= 5) {
            const amountToBeInvested = Number((((Number(accountData.availableBalance)) / price) * theBuyFactor).toFixed(3))
            if (amountToBeInvested >= 0.001) {
                console.log(`amountToBeInvested: ${amountToBeInvested}`)
                await this.binanceConnector.buyFuture(pair, amountToBeInvested)
            } else {
                console.log(`${amountToBeInvested} is below minimum buy amount of 0.001 with theBuyFactor: ${theBuyFactor}`)
            }
        } else if (highestSinceX >= 5) {
            const xPosition = accountData.positions.filter((entry: any) => entry.symbol === pair)[0]
            let amountToBeSold = Number(((Number(xPosition.positionAmt)) * theSellFactor).toFixed(3))
            amountToBeSold = (amountToBeSold <= Number(xPosition.positionAmt)) ? amountToBeSold : Number(xPosition.positionAmt)
            if (amountToBeSold >= 0.001) {
                console.log(`amountToBeSold: ${amountToBeSold}`)
                const r = await this.binanceConnector.sellFuture(pair, amountToBeSold)
                console.log(r)
            } else {
                console.log(`below minimum buy amount of 0.001 with theSellFactor: ${theSellFactor}`)
            }
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

            counter += 1
        }

        return counter
    }

    private getIsHighestSinceX(price: number) {
        let counter = 0

        for (const e of this.historicData) {
            if (price < e) {
                return counter
            }

            counter += 1
        }

        return counter
    }
}

const instance = new BuyLowSellHighGambler(binanceApiKey, binanceApiSecret)

setInterval(() => {

    void instance.investWisely()

}, 11 * 1000)
