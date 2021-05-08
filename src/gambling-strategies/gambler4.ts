import { BinanceConnector } from "../binance/binance-connector"
import { Converter } from "./converter"
export class Gambler {

    private binanceConnector: BinanceConnector
    private converted: number = 0

    public constructor(binanceApiKey: string, binanceApiSecret: string) {
        this.binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)
    }

    public static gamble(binanceApiKey: string, binanceApiSecret: string, targetBNBWallet: string): void {

        const i = new Gambler(binanceApiKey, binanceApiSecret)
        if (binanceApiKey === undefined || binanceApiSecret === undefined) {
            throw new Error(`Strange Parameters`)
        }

        setInterval(async () => {

            try {
                const fut = await i.binanceConnector.getFuturesAccountData()
                const twb = Number(fut.totalWalletBalance)
                const usdtSpot = Number(await i.binanceConnector.getUSDTBalance())
                const bnbSpot = Number(await i.binanceConnector.getSpotBalance('BNB'))
                const valAtR = twb + Number(fut.totalUnrealizedProfit)
                // const ethSpot = await i.binanceConnector.getSpotBalance('ETH')

                console.log('*******************************************************************************************************')
                console.log(`bnbSpot: ${bnbSpot} - aB: ${fut.availableBalance} - valAtR: ${valAtR} - gains: ${valAtR + i.converted}`)

                if (fut.availableBalance > (valAtR * 0.2)) {

                    console.log(`I buy some fancy shit.`)
                    await i.binanceConnector.buyFuture('ETHUSDT', 0.1)
                    await i.binanceConnector.buyFuture('BTCUSDT', 0.005)
                    await i.binanceConnector.buyFuture('BNBUSDT', 0.1)
                    await i.binanceConnector.buyFuture('ADAUSDT', 1)
                    await i.binanceConnector.buyFuture('LINKUSDT', 0.1)
                    await i.binanceConnector.buyFuture('BATUSDT', 20)
                    await i.binanceConnector.buyFuture('DOTUSDT', 0.1)
                    await i.binanceConnector.buyFuture('UNIUSDT', 10)
                    await i.binanceConnector.buyFuture('FILUSDT', 0.1)
                    await i.binanceConnector.buyFuture('XMRUSDT', 1)
                    await i.binanceConnector.buyFuture('AAVEUSDT', 1)
                    await i.binanceConnector.buyFuture('COMPUSDT', 1)
                    await i.binanceConnector.buyFuture('MKRUSDT', 0.01)


                } else if (Number(fut.availableBalance) === 0) {

                    console.log(`I need to sell something to reduce the liquidation risk.`)
                    await i.binanceConnector.sellFuture('ETHUSDT', 0.1)
                    await i.binanceConnector.sellFuture('BTCUSDT', 0.01)
                    await i.binanceConnector.sellFuture('BNBUSDT', 0.1)
                    await i.binanceConnector.sellFuture('ADAUSDT', 1)
                    await i.binanceConnector.sellFuture('LINKUSDT', 0.1)
                    await i.binanceConnector.sellFuture('BATUSDT', 20)
                    await i.binanceConnector.sellFuture('DOTUSDT', 0.1)
                    await i.binanceConnector.sellFuture('UNIUSDT', 10)
                    await i.binanceConnector.sellFuture('FILUSDT', 1)
                    await i.binanceConnector.sellFuture('XMRUSDT', 1)
                    await i.binanceConnector.sellFuture('AAVEUSDT', 1)
                    await i.binanceConnector.sellFuture('COMPUSDT', 1)
                    await i.binanceConnector.sellFuture('MKRUSDT', 0.01)

                } else if (fut.availableBalance < (valAtR * 0.01) && fut.availableBalance > 10) {

                    console.log(`Saving something as I made some significant gains.`)
                    await i.binanceConnector.transferFromUSDTFuturesToSpotAccount(10)

                } else if (usdtSpot >= 70) {
                    const converter = new Converter(i.binanceConnector)
                    const currentPrices = await i.binanceConnector.getCurrentPrices()

                    console.log(`I convert 70 USDT to BNB.`)
                    await converter.convert(currentPrices, 70, 'BNBUSDT', 3)
                    i.converted = i.converted + 70

                } else if (bnbSpot >= 0.1) {
                    const converter = new Converter(i.binanceConnector)
                    await converter.withdraw('BNB', 0.1, targetBNBWallet)
                } else {
                    console.log('boring times')
                }
            } catch (error) {
                console.log(`you can improve something: ${error.message}`)
            }
        }, 11 * 1000)
    }
}
