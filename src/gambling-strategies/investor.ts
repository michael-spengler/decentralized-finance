import { BinanceConnector } from "../binance/binance-connector"

export interface IList {
    pairName: string
    percentage: number
    decimalPlaces: number
}

export class Investor {

    private theList: IList[] = []
    private binanceConnector: BinanceConnector
    private totalUnrealizedProfits: number[] = []
    private pnlAverage: number = 0
    private pnlAverageCalcAllowsBuying = false

    public constructor(binanceApiKey: string, binanceApiSecret: string) {
        this.binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)
        this.prepareTheList()
    }

    public async invest() {
        const currentPrices = await this.binanceConnector.getCurrentPrices()
        const accountData = await this.binanceConnector.getFuturesAccountData()

        this.checkNoise(accountData)

        if (accountData.totalUnrealizedProfit > (accountData.totalWalletBalance / 10)) {
            console.log(`availableBalance: ${accountData.availableBalance}`)
            console.log(`${this.pnlAverage} vs. ${accountData.totalUnrealizedProfit}`)

            if (this.pnlAverageCalcAllowsBuying) {
                if (accountData.availableBalance > (accountData.totalWalletBalance / 10)) {
                    await this.buy(currentPrices, accountData)
                } else {
                    console.log(`The available balance seems to low to trigger a buy orgy.`)
                }
            } else if (this.totalUnrealizedProfits.length < 100) {
                console.log(`waiting until ready for pnl average calculation (${this.totalUnrealizedProfits.length} from 100)`)
            } else {
                console.log(`waiting for a little drop`)
            }

        } else if (accountData.totalUnrealizedProfit < ((accountData.totalWalletBalance / 10) * -1)) {
            await this.sell()
        }

        // console.log(JSON.stringify(accountData).substr(0, 300))
    }

    private async buy(currentPrices: any[], accountData: any) {

        for (const listEntry of this.theList) {
            const currentPrice = currentPrices.filter((e: any) => e.coinSymbol === listEntry.pairName)[0].price
            const xPosition = accountData.positions.filter((entry: any) => entry.symbol === listEntry.pairName)[0]
            const howMuchToBuy = await this.getHowMuchToBuy(listEntry.percentage, currentPrice, accountData.availableBalance, xPosition.leverage)
            console.log(`I'll buy ${howMuchToBuy} ${listEntry.pairName} as it has a portfolio percentage of ${listEntry.percentage}`)
            await this.binanceConnector.buyFuture(listEntry.pairName, Number(howMuchToBuy.toFixed(this.getDecimalPlaces(listEntry.pairName))))
        }

    }

    private async sell(positionSellFactor: number = 0.3) {

        const accountData = await this.binanceConnector.getFuturesAccountData()

        for (const position of accountData.positions) {
            if (position.positionAmt > 0) {
                const howMuchToSell = Number((position.positionAmt * positionSellFactor).toFixed(this.getDecimalPlaces(position.symbol)))
                console.log(`I'll sell ${howMuchToSell} ${position.symbol}`)
                await this.binanceConnector.sellFuture(position.symbol, howMuchToSell)
            }
        }

    }


    private getDecimalPlaces(pair: string): number {
        const e = this.theList.filter((e: IList) => e.pairName === pair)[0]
        if (e === undefined) {
            console.log(`error while getting decimal places for ${pair}`)
            return 0
        } else {
            return e.decimalPlaces
        }
    }

    private async getHowMuchToBuy(percentage: number, currentPrice: number, availableBalance: number, leverage: number, couldBuyWouldBuyFactor: number = 0.2): Promise<number> {

        const canBuy = ((availableBalance * leverage) / currentPrice) * (percentage / 100)

        return Number((canBuy * couldBuyWouldBuyFactor))
    }

    private prepareTheList() {
        if (this.theList.length === 0) {
            this.theList.push({ pairName: "BTCUSDT", percentage: 5, decimalPlaces: 3 })
            this.theList.push({ pairName: "ADAUSDT", percentage: 5, decimalPlaces: 0 })
            this.theList.push({ pairName: "BNBUSDT", percentage: 5, decimalPlaces: 2 })
            this.theList.push({ pairName: "XMRUSDT", percentage: 5, decimalPlaces: 2 })
            this.theList.push({ pairName: "ETHUSDT", percentage: 5, decimalPlaces: 2 })
            this.theList.push({ pairName: "BATUSDT", percentage: 5, decimalPlaces: 1 })
            this.theList.push({ pairName: "TRXUSDT", percentage: 5, decimalPlaces: 0 })
            this.theList.push({ pairName: "XLMUSDT", percentage: 5, decimalPlaces: 0 })
            this.theList.push({ pairName: "LINKUSDT", percentage: 5, decimalPlaces: 2 })
            this.theList.push({ pairName: "MANAUSDT", percentage: 5, decimalPlaces: 0 })
            this.theList.push({ pairName: "THETAUSDT", percentage: 5, decimalPlaces: 1 })
            this.theList.push({ pairName: "FILUSDT", percentage: 5, decimalPlaces: 1 })
            this.theList.push({ pairName: "COMPUSDT", percentage: 5, decimalPlaces: 2 })
            this.theList.push({ pairName: "AAVEUSDT", percentage: 5, decimalPlaces: 1 })
            this.theList.push({ pairName: "EGLDUSDT", percentage: 5, decimalPlaces: 1 })
            this.theList.push({ pairName: "DOTUSDT", percentage: 5, decimalPlaces: 1 })
            this.theList.push({ pairName: "LTCUSDT", percentage: 5, decimalPlaces: 2 })
            this.theList.push({ pairName: "MKRUSDT", percentage: 5, decimalPlaces: 2 })
            this.theList.push({ pairName: "SNXUSDT", percentage: 5, decimalPlaces: 1 })
            this.theList.push({ pairName: "AVAXUSDT", percentage: 5, decimalPlaces: 0 })
        }

    }

    private checkNoise(accountData: any): void {
        if (this.totalUnrealizedProfits.length === 100) {
            
            this.totalUnrealizedProfits.shift() // removing the oldest entry
            this.totalUnrealizedProfits.push(Number(accountData.totalUnrealizedProfit))
            
            console.log(this.totalUnrealizedProfits)

            let total = 0
            for (const e of this.totalUnrealizedProfits) {
                total = total + e
            }
            this.pnlAverage = total / this.totalUnrealizedProfits.length

            if (this.pnlAverage > accountData.totalUnrealizedProfit) {
                this.pnlAverageCalcAllowsBuying = true
            }
        } else {
            console.log(`not enough history to check average pnl`)

            this.totalUnrealizedProfits.push(Number(accountData.totalUnrealizedProfit))
        }
    }
}

const binanceApiKey = process.argv[2] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[3] // check your profile on binance.com --> API Management

const i = new Investor(binanceApiKey, binanceApiSecret)

setInterval(async () => {

    await i.invest()

}, 11 * 1000)