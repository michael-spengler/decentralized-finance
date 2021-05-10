import { BinanceConnector } from "../../binance/binance-connector"

export class Converter {

    private binanceConnector: BinanceConnector

    public constructor(binanceConnector: BinanceConnector) {
        this.binanceConnector = binanceConnector
    }

    public async withdraw(symbol: string, amountToBeWithdrawn: number, targetWallet: string) {

        await this.binanceConnector.withdraw(symbol, targetWallet, amountToBeWithdrawn)

    
    }
    public async convert(currentPrices: any[], amountToBeConverted: number, pair: string, decimalPlaces: number) {
        const currentPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === pair)[0].price)
        const amountOfTargetToBeBought = Number(((Number((amountToBeConverted / 2).toFixed(decimalPlaces))) / currentPrice).toFixed(decimalPlaces))
        console.log(`I'll buy ${amountOfTargetToBeBought}. Pair: ${pair}`)
        try {
            await this.binanceConnector.placeBuyOrder(pair, amountOfTargetToBeBought)
        } catch (error) {
            console.log(`error from placeBuyOrder: ${error.message}`)
        }
    }
}