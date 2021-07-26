import { BinanceConnector } from "../../binance/binance-connector"

export class ShitcoinGambler {
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

            const shitCoinPosition = accountData.positions.filter((entry: any) => entry.symbol === 'DOGEUSDT')[0]
            const ethPosition = accountData.positions.filter((entry: any) => entry.symbol === 'ETHUSDT')[0]
            const btcPosition = accountData.positions.filter((entry: any) => entry.symbol === 'BTCUSDT')[0]
            const bnbPosition = accountData.positions.filter((entry: any) => entry.symbol === 'BNBUSDT')[0]
            const adaPosition = accountData.positions.filter((entry: any) => entry.symbol === 'ADAUSDT')[0]
            const dotPosition = accountData.positions.filter((entry: any) => entry.symbol === 'DOTUSDT')[0]

            const currentPrices = await this.binanceConnector.getCurrentPrices()
            const currentDogePrice: number = currentPrices.filter((e: any) => e.coinSymbol === 'DOGEUSDT')[0].price


            if (this.dogePrices.length === this.historicPricesLength) {
                this.dogePrices.splice(this.dogePrices.length - 1, 1)
            }
            this.dogePrices.unshift(currentDogePrice)


            if (this.dogePrices.length === this.historicPricesLength) {

                const averageDogePrice = this.getTheAverage(this.dogePrices)
                const calculatedDelta = (100 * currentDogePrice / averageDogePrice) - 100

                if (accountData.availableBalance > 0) {

                    if (calculatedDelta > this.delta) {
                        console.log('time to short the shitcoin')
                        await this.binanceConnector.sellFuture('DOGEUSDT', 100)
                    }

                } else {

                    console.log(`I buy back some of the shorted coin to minimize the liquidation risk`)
                    await this.binanceConnector.buyFuture('DOGEUSDT', 100)

                }


                if (shitCoinPosition.unrealizedProfit > 0) { // öfter die u.g. kaufen... - e.g. below average berechnung... 

                    console.log(`shorting the shitcoin pays off as the unrealized PNL is: ${shitCoinPosition.unrealizedProfit}`)

                    if (accountData.availableBalance > 100) {

                        await this.binanceConnector.buyFuture('ETHUSDT', 0.1)
                        await this.binanceConnector.buyFuture('BTCUSDT', 0.007)
                        await this.binanceConnector.buyFuture('BNBUSDT', 0.2)
                        await this.binanceConnector.buyFuture('ADAUSDT', 40)
                        await this.binanceConnector.buyFuture('DOTUSDT', 5)

                    } else {

                        console.log(`accountData.availableBalance: ${accountData.availableBalance}`)

                    }

                } else if (shitCoinPosition.unrealizedProfit < 0) {

                    console.log(`shorting the shitcoin awaits some profits as the unrealized PNL is: ${shitCoinPosition.unrealizedProfit}`)


                } else {

                    console.log(`shorting the shitcoin's unrealized PNL is: ${shitCoinPosition.unrealizedProfit}`)
                }

                if (ethPosition.positionAmt > 0) {

                    const ethProfitInPercent = (ethPosition.unrealizedProfit * 100) / ethPosition.initialMargin
                    const btcProfitInPercent = (btcPosition.unrealizedProfit * 100) / btcPosition.initialMargin
                    const bnbProfitInPercent = (bnbPosition.unrealizedProfit * 100) / bnbPosition.initialMargin
                    const adaProfitInPercent = (adaPosition.unrealizedProfit * 100) / adaPosition.initialMargin
                    const dotProfitInPercent = (dotPosition.unrealizedProfit * 100) / dotPosition.initialMargin

                    console.log(`ethProfit in percent: ${ethProfitInPercent}`)
                    console.log(`btcProfit in percent: ${btcProfitInPercent}`)
                    console.log(`bnbProfit in percent: ${bnbProfitInPercent}`)
                    console.log(`adaProfit in percent: ${adaProfitInPercent}`)
                    console.log(`dotProfit in percent: ${dotProfitInPercent}`)


                    if (ethProfitInPercent > 100) {
                        await this.binanceConnector.sellFuture('ETHUSDT', ethPosition.positionAmt)
                    }
                    if (btcProfitInPercent > 75) {
                        await this.binanceConnector.sellFuture('BTCUSDT', btcPosition.positionAmt)
                    }
                    if (bnbProfitInPercent > 50) {
                        await this.binanceConnector.sellFuture('BNBUSDT', bnbPosition.positionAmt)
                    }
                    if (adaProfitInPercent > 25) {
                        await this.binanceConnector.sellFuture('ADAUSDT', adaPosition.positionAmt)
                    }
                    if (dotProfitInPercent > 25) {
                        await this.binanceConnector.sellFuture('DOTUSDT', dotPosition.positionAmt)
                    }

                }


            } else {

                console.log('still collecting data')

            }

        }, this.intervalLengthInSeconds * 1000)
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

const shitcoinGambler = new ShitcoinGambler(historicPricesLength, intervalLengthInSeconds, delta, binanceApiKey, binanceApiSecret)

shitcoinGambler.gamble()