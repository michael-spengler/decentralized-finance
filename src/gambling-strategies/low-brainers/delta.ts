import { BinanceConnector } from "../../binance/binance-connector"

export class DeltaGambler {

    private binanceConnector: BinanceConnector
    private dogePrices: number[] = []
    private historicPricesLength = 0
    private intervalLengthInSeconds = 0
    private delta = 0

    public constructor(historicPricesLength: number, intervalLengthInSeconds: number, delta: number, binanceApiKey: string, binanceApiSecret: string) {
        this.binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)
        this.historicPricesLength = historicPricesLength
        this.intervalLengthInSeconds = intervalLengthInSeconds
        this.delta = delta
    }

    public gamble() {
        setInterval(async () => {
            const accountData = await this.binanceConnector.getFuturesAccountData()
            // console.log(accountData)
            // console.log(accountData.totalWalletBalance)
            // console.log(accountData.totalUnrealizedProfit)
            // console.log(accountData.availableBalance)
            const xPosition = accountData.positions.filter((entry: any) => entry.symbol === 'DOGEUSDT')[0]
            // console.log(JSON.stringify(xPosition))

            const currentPrices = await this.binanceConnector.getCurrentPrices()
            const currentDogePrice: number = currentPrices.filter((e: any) => e.coinSymbol === 'DOGEUSDT')[0].price
            if (this.dogePrices.length === this.historicPricesLength) {
                this.dogePrices.splice(this.dogePrices.length - 1, 1)
            }
            this.dogePrices.unshift(currentDogePrice)

            console.log(`doge price: ${currentDogePrice}`)

            if (this.dogePrices.length === this.historicPricesLength) {
                const averageDogePrice = this.getTheAverage(this.dogePrices)
                console.log(`average doge price: ${averageDogePrice}`)

                const calculatedDelta = (100 * currentDogePrice / averageDogePrice) - 100

                console.log(`calculatedDelta: ${calculatedDelta}`)

                console.log(`unrealizedDogeProfit: ${xPosition.unrealizedProfit}`)

                if (calculatedDelta < this.delta) {
                    console.log('time to buy')
                    await this.binanceConnector.buyFuture('DOGEUSDT', 100)
                } else if (calculatedDelta > this.delta) {
                    console.log('time to sell')
                    await this.binanceConnector.sellFuture('DOGEUSDT', 100)
                } else {
                    console.log(`boring times as the calculatedDelta is ${calculatedDelta}`)

                }
                console.log(`calculatedDogePrice: ${averageDogePrice + (averageDogePrice * calculatedDelta / 100)}`)
            } else {
                console.log(`historicogePrices Length: ${this.dogePrices.length}`)
            }
            // console.log(`doge prices: ${this.hundredDogePrices}`)

        }, 1000 * this.intervalLengthInSeconds)
    }

    public getTheAverage(list: number[]): number {

        let sum = 0
        for (const e of list) {
            sum = sum + Number(e)
        }

        return sum / list.length
    }
}

const historicPricesLength = Number(process.argv[2])
const intervalLengthInSeconds = Number(process.argv[3])
const delta = Number(process.argv[4])
const binanceApiKey = process.argv[5] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[6] // check your profile on binance.com --> API Management

const deltaGambler = new DeltaGambler(historicPricesLength, intervalLengthInSeconds, delta, binanceApiKey, binanceApiSecret)

deltaGambler.gamble()