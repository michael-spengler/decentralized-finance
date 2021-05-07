import { BinanceConnector } from "../binance/binance-connector"
export class Gambler {

    private binanceConnector: BinanceConnector

    public constructor(binanceApiKey: string, binanceApiSecret: string) {
        this.binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)
    }

    public static gamble(minAvailableOnFuturesAccount: number, binanceApiKey: string, binanceApiSecret: string): void {

        const i = new Gambler(binanceApiKey, binanceApiSecret)
        if (binanceApiKey === undefined || binanceApiSecret === undefined) {
            throw new Error(`Strange Parameters`)
        }
        setInterval(async () => {

            try {
                const accountData = await i.binanceConnector.getFuturesAccountData()
                const twb = Number(accountData.totalWalletBalance)
                const availableUSDTBalanceInSpotAccount = Number(await i.binanceConnector.getUSDTBalance())
                const value = twb + Number(availableUSDTBalanceInSpotAccount) + Number(accountData.totalUnrealizedProfit)
                console.log(`availableUSDTBalSpot: ${availableUSDTBalanceInSpotAccount} - availableBalFut: ${accountData.availableBalance} - TVL: ${value}`)

                if (accountData.availableBalance > minAvailableOnFuturesAccount) {
                    console.log(`Saving something as I made some significant gains.`)
                    await i.binanceConnector.transferFromUSDTFuturesToSpotAccount(10)
                } else if (accountData.availableBalance < 2) { // this shall never happen
                    console.log(`I need to sell something to reduce the liquidation risk.`)
                    await i.binanceConnector.sellFuture('ETHUSDT', 0.005)
                    await i.binanceConnector.sellFuture('BTCUSDT', 0.1)
                    await i.binanceConnector.sellFuture('BNBUSDT', 0.1)
                }

            } catch (error) {
                console.log(`you can improve something: ${error.message}`)
            }
        }, 11 * 1000)
    }
}
