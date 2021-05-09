import { BinanceConnector } from "../binance/binance-connector"
import { Converter } from "./converter"

let intervalCounter: number = 0
let intervalCounterLastSell: number = -1

export class GoWithTheFlow {

    private binanceConnector: BinanceConnector
    private minValAtRisk: number = 0
    private factor: number = 0
    private buyPauseAfterSale: number = 0
    private pair: string
    private tradeUnitSize: number = 0
    private startTotal: number = 0

    public constructor(pair: string, tradeUnitSize: number, minValAtRisk: number, factor: number, buyPauseAfterSale: number, binanceApiKey: string, binanceApiSecret: string) {

        if (binanceApiKey === undefined || binanceApiSecret === undefined) {
            throw new Error(`Strange Parameters`)
        }

        this.binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)
        this.minValAtRisk = minValAtRisk
        this.factor = factor
        this.buyPauseAfterSale = buyPauseAfterSale
        this.pair = pair
        this.tradeUnitSize = tradeUnitSize
    }


    public gamble(): void {
        setInterval(async () => {
            intervalCounter++
            try {
                const fut = await this.binanceConnector.getFuturesAccountData()
                const twb = Number(fut.totalWalletBalance)
                const usdtSpot = Number(await this.binanceConnector.getUSDTBalance())
                const bnbSpot = Number(await this.binanceConnector.getSpotBalance('BNB'))
                const valAtR = twb + Number(fut.totalUnrealizedProfit)
                // const ethSpot = await this.binanceConnector.getSpotBalance('ETH')

                if (intervalCounter === 1) {
                    this.startTotal = valAtR + usdtSpot + bnbSpot
                }
                console.log('*******************************************************************************************************')
                console.log(`usdt: ${usdtSpot} - bnb: ${bnbSpot} - aB: ${fut.availableBalance} - vaR: ${valAtR} - start: ${this.startTotal} - total: ${valAtR + usdtSpot + bnbSpot}`)

                if (fut.availableBalance > twb && fut.availableBalance > Number(fut.totalUnrealizedProfit)) {

                    console.log(`Saving something as I made some significant gains.`)
                    await this.binanceConnector.transferFromUSDTFuturesToSpotAccount(fut.availableBalance * 0.7)

                } else if (usdtSpot >= 5000) { // it seems unreasonable to hold so much fiat atm

                    const converter = new Converter(this.binanceConnector)
                    const currentPrices = await this.binanceConnector.getCurrentPrices()

                    console.log(`I convert 1000 USDT to BNB.`)
                    await converter.convert(currentPrices, 1000, 'BNBUSDT', 3)

                } else if (valAtR < this.minValAtRisk && usdtSpot >= 10) {

                    console.log(`Reinvesting after a significant drop.`)
                    await this.transferUSDTFromSpotAccountToFuturesAccount(this.minValAtRisk - valAtR)

                } else if (fut.availableBalance > (valAtR * this.factor)) {

                    if ((intervalCounter - intervalCounterLastSell) > this.buyPauseAfterSale || intervalCounterLastSell === -1) {
                        console.log(`I buy some fancy shit.`)
                        const r = await this.binanceConnector.buyFuture(this.pair, this.tradeUnitSize) // there is a margin limit per position per account from binance 
                        // console.log(r)
                    } else {
                        console.log(`hmm - intervalCounter: ${intervalCounter} - intervalCounterLastSell: ${intervalCounterLastSell}`)
                    }

                } else if (Number(fut.availableBalance) === 0) {

                    console.log(`I need to sell something to reduce the liquidation risk.`)
                    await this.checkAndSell(fut, this.pair, this.tradeUnitSize * 2)

                    intervalCounterLastSell = intervalCounter

                } else if (fut.availableBalance < (valAtR * this.factor * 0.2) && fut.availableBalance > 10) {

                    console.log(`Create the Trend`)
                    await this.binanceConnector.transferFromUSDTFuturesToSpotAccount(10)

                } else {

                    console.log('boring times')

                }
            } catch (error) {
                console.log(`you can improve something: ${error.message}`)
            }
        }, 11 * 1000)
    }

    private async checkAndSell(fut: any, pair: string, amount: number) {
        const xPosition = fut.positions.filter((entry: any) => entry.symbol === pair)[0]

        if (Number(xPosition.positionAmt) > 0.01) {
            await this.binanceConnector.sellFuture(pair, amount)
        }
    }

    private async transferUSDTFromSpotAccountToFuturesAccount(investmentAmount: number) {

        try {
            const availableUSDTBalanceInSpotAccount = Number(await this.binanceConnector.getUSDTBalance())
            const transferAmount = (availableUSDTBalanceInSpotAccount < investmentAmount) ? availableUSDTBalanceInSpotAccount : investmentAmount

            await this.binanceConnector.transferFromSpotAccountToUSDTFutures(transferAmount)
        } catch (error) {
            console.log(`you might take a look into this: ${error.message}`)
        }
    }

}
