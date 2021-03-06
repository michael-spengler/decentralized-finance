import { BinanceConnector } from "../../binance/binance-connector"
import { Converter } from "../utilities/converter"

let intervalCounter: number = 0
let intervalCounterLastSell: number = -1
export class Gambler {

    private binanceConnector: BinanceConnector
    private minValAtRisk: number = 0
    private factor: number = 0
    private buyPauseAfterSale: number = 0
    // private spenglersListe: string[] = ['BNB', 'XMR', 'ETH', 'BAT', 'AAVE', 'MKR', 'UNI', 'FIL', 'COMP', 'BTC', 'ADA', 'LINK', 'DOT']

    public constructor(minValAtRisk: number, factor: number, buyPauseAfterSale: number, binanceApiKey: string, binanceApiSecret: string) {

        if (binanceApiKey === undefined || binanceApiSecret === undefined) {
            throw new Error(`Strange Parameters`)
        }

        this.binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)
        this.minValAtRisk = minValAtRisk
        this.factor = factor
        this.buyPauseAfterSale = buyPauseAfterSale
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

                console.log('*******************************************************************************************************')
                console.log(`usdtSpot: ${usdtSpot} - bnbSpot: ${bnbSpot} - aB: ${fut.availableBalance} - valAtR: ${valAtR} - total: ${valAtR + usdtSpot + bnbSpot}`)

                if (valAtR < this.minValAtRisk && usdtSpot >= 10) {

                    console.log(`Reinvesting after a significant drop.`)
                    await this.transferUSDTFromSpotAccountToFuturesAccount(this.minValAtRisk - valAtR)

                } else if (fut.availableBalance > (valAtR * this.factor) ) {

                    if ((intervalCounter - intervalCounterLastSell) > this.buyPauseAfterSale || intervalCounterLastSell === -1) {
                        console.log(`I buy some fancy shit.`)
                        await this.binanceConnector.buyFuture('BNBUSDT', 0.1)
                        await this.binanceConnector.buyFuture('XMRUSDT', 1)
                        await this.binanceConnector.buyFuture('ETHUSDT', 0.1)
                        await this.binanceConnector.buyFuture('BATUSDT', 20)
                        await this.binanceConnector.buyFuture('AAVEUSDT', 1)
                        await this.binanceConnector.buyFuture('MKRUSDT', 0.01)
                        await this.binanceConnector.buyFuture('UNIUSDT', 10)
                        await this.binanceConnector.buyFuture('FILUSDT', 0.1)
                        await this.binanceConnector.buyFuture('COMPUSDT', 1)
                        await this.binanceConnector.buyFuture('BTCUSDT', 0.01)
                        await this.binanceConnector.buyFuture('ADAUSDT', 5)
                        await this.binanceConnector.buyFuture('LINKUSDT', 5)
                        await this.binanceConnector.buyFuture('DOTUSDT', 2)
                    } else {
                        console.log(`hmm - intervalCounter: ${intervalCounter} - intervalCounterLastSell: ${intervalCounterLastSell}`)
                    }


                } else if (Number(fut.availableBalance) === 0) {
                    console.log(`I need to sell something to reduce the liquidation risk.`)
                    await this.checkAndSell(fut, 'BNBUSDT', 0.1)
                    await this.checkAndSell(fut, 'XMRUSDT', 1)
                    await this.checkAndSell(fut, 'ETHUSDT', 0.1)
                    await this.checkAndSell(fut, 'BATUSDT', 20)
                    await this.checkAndSell(fut, 'AAVEUSDT', 1)
                    await this.checkAndSell(fut, 'MKRUSDT', 0.01)
                    await this.checkAndSell(fut, 'UNIUSDT', 10)
                    await this.checkAndSell(fut, 'FILUSDT', 0.1)
                    await this.checkAndSell(fut, 'COMPUSDT', 1)
                    await this.checkAndSell(fut, 'BTCUSDT', 0.05)
                    await this.checkAndSell(fut, 'ADAUSDT', 5)
                    await this.checkAndSell(fut, 'LINKUSDT', 5)
                    await this.checkAndSell(fut, 'DOTUSDT', 2)
                    
                    intervalCounterLastSell = intervalCounter

                } else if (fut.availableBalance < (valAtR * 0.05) && fut.availableBalance > 10) {

                    console.log(`Saving something as I made some significant gains.`)
                    await this.binanceConnector.transferFromUSDTFuturesToSpotAccount(10)

                } else if (usdtSpot >= 5000) { // it seems unreasonable to hold so much fiat atm
                    const converter = new Converter(this.binanceConnector)
                    const currentPrices = await this.binanceConnector.getCurrentPrices()

                    console.log(`I convert 1000 USDT to BNB.`)
                    await converter.convert(currentPrices, 1000, 'BNBUSDT', 3)
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
