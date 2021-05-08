import { BinanceConnector } from "../binance/binance-connector"
import { Converter } from "./converter"

let intervalCounter: number = 0
let intervalCounterLastSell: number = -1
export class Gambler {

    private binanceConnector: BinanceConnector
    private converted: number = 0
    private spenglersListe: string[] = ['BNB', 'XMR', 'ETH', 'BAT', 'AAVE', 'MKR', 'UNI', 'FIL', 'COMP', 'BTC', 'ADA', 'LINK', 'DOT']

    public constructor(binanceApiKey: string, binanceApiSecret: string) {
        this.binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)
    }

    public static gamble(binanceApiKey: string, binanceApiSecret: string, targetBNBWallet: string): void {

        const i = new Gambler(binanceApiKey, binanceApiSecret)
        if (binanceApiKey === undefined || binanceApiSecret === undefined) {
            throw new Error(`Strange Parameters`)
        }

        setInterval(async () => {
            intervalCounter++
            try {
                const fut = await i.binanceConnector.getFuturesAccountData()
                const twb = Number(fut.totalWalletBalance)
                const usdtSpot = Number(await i.binanceConnector.getUSDTBalance())
                const bnbSpot = Number(await i.binanceConnector.getSpotBalance('BNB'))
                const valAtR = twb + Number(fut.totalUnrealizedProfit)
                // const ethSpot = await i.binanceConnector.getSpotBalance('ETH')

                console.log('*******************************************************************************************************')
                console.log(`usdtSpot: ${usdtSpot} - bnbSpot: ${bnbSpot} - aB: ${fut.availableBalance} - valAtR: ${valAtR} - gains: ${valAtR + i.converted}`)

                if (valAtR < 500 && usdtSpot > 100) {

                    console.log(`Reinvesting after a significant drop.`)
                    await i.transferUSDTFromSpotAccountToFuturesAccount(500)

                } else if (fut.availableBalance > (valAtR * 0.15) ) {

                    if ((intervalCounter - intervalCounterLastSell) > 10 || intervalCounterLastSell === -1) {
                        console.log(`I buy some fancy shit.`)
                        await i.binanceConnector.buyFuture('BNBUSDT', 0.1)
                        await i.binanceConnector.buyFuture('XMRUSDT', 1)
                        await i.binanceConnector.buyFuture('ETHUSDT', 0.1)
                        await i.binanceConnector.buyFuture('BATUSDT', 20)
                        await i.binanceConnector.buyFuture('AAVEUSDT', 1)
                        await i.binanceConnector.buyFuture('MKRUSDT', 0.01)
                        await i.binanceConnector.buyFuture('UNIUSDT', 10)
                        await i.binanceConnector.buyFuture('FILUSDT', 0.1)
                        await i.binanceConnector.buyFuture('COMPUSDT', 1)
                        await i.binanceConnector.buyFuture('BTCUSDT', 0.01)
                        await i.binanceConnector.buyFuture('ADAUSDT', 5)
                        await i.binanceConnector.buyFuture('LINKUSDT', 5)
                        await i.binanceConnector.buyFuture('DOTUSDT', 2)
                    } else {
                        console.log(`hmm - intervalCounter: ${intervalCounter} - intervalCounterLastSell: ${intervalCounterLastSell}`)
                    }


                } else if (Number(fut.availableBalance) === 0) {
                    console.log(`I need to sell something to reduce the liquidation risk.`)
                    await i.checkAndSell(fut, 'BNBUSDT', 0.1)
                    await i.checkAndSell(fut, 'XMRUSDT', 1)
                    await i.checkAndSell(fut, 'ETHUSDT', 0.1)
                    await i.checkAndSell(fut, 'BATUSDT', 20)
                    await i.checkAndSell(fut, 'AAVEUSDT', 1)
                    await i.checkAndSell(fut, 'MKRUSDT', 0.01)
                    await i.checkAndSell(fut, 'UNIUSDT', 10)
                    await i.checkAndSell(fut, 'FILUSDT', 0.1)
                    await i.checkAndSell(fut, 'COMPUSDT', 1)
                    await i.checkAndSell(fut, 'BTCUSDT', 0.05)
                    await i.checkAndSell(fut, 'ADAUSDT', 5)
                    await i.checkAndSell(fut, 'LINKUSDT', 5)
                    await i.checkAndSell(fut, 'DOTUSDT', 2)
                    
                    intervalCounterLastSell = intervalCounter
                } else if (fut.availableBalance < (valAtR * 0.05) && fut.availableBalance > 10) {

                    console.log(`Saving something as I made some significant gains.`)
                    await i.binanceConnector.transferFromUSDTFuturesToSpotAccount(10)

                } else if (usdtSpot >= 5000) {
                    const converter = new Converter(i.binanceConnector)
                    const currentPrices = await i.binanceConnector.getCurrentPrices()

                    console.log(`I convert 1000 USDT to BNB.`)
                    await converter.convert(currentPrices, 1000, 'BNBUSDT', 3)
                    i.converted = i.converted + 1000
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
