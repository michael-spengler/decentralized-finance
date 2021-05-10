
import { BinanceConnector } from "../../binance/binance-connector"
import { Player } from "../utilities/player"

export interface IList {
    pairName: string
    percentage: number
    decimalPlaces: number
}

export class Investor {

    private theList: IList[] = []
    private binanceConnector: BinanceConnector
    private lrToBuy: number
    private lrToSell: number


    public constructor(lrToBuy: number, lrToSell: number, binanceApiKey: string, binanceApiSecret: string) {
        this.lrToBuy = lrToBuy
        this.lrToSell = lrToSell
        this.binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)
        this.prepareTheList()
    }

    public async invest() {
        const currentPrices = await this.binanceConnector.getCurrentPrices()
        const accountData = await this.binanceConnector.getFuturesAccountData()
        const liquidityRatio = accountData.availableBalance / accountData.totalWalletBalance


        console.log(`liquidityRatio: ${liquidityRatio}`)

        if (liquidityRatio >= this.lrToBuy) {
            console.log(`lr indicates buying: ${accountData.availableBalance}`)

            if (accountData.availableBalance > (accountData.totalWalletBalance / 10)) {
                await this.buy(currentPrices, accountData)
            } else {
                console.log(`The available balance seems to low to trigger a buy orgy.`)
            }

        } else if (liquidityRatio <= this.lrToSell) {
            await this.sell()
        } else {
            console.log(`reasonably invested with a liquidity ratio of ${liquidityRatio}.`)
        }

        // console.log(JSON.stringify(accountData).substr(0, 300))
    }

    private async buy(currentPrices: any[], accountData: any) {
        for (const listEntry of this.theList) {
            const currentPrice = currentPrices.filter((e: any) => e.coinSymbol === listEntry.pairName)[0].price
            const xPosition = accountData.positions.filter((entry: any) => entry.symbol === listEntry.pairName)[0]
            const canBuy = ((accountData.availableBalance * xPosition.leverage) / currentPrice) * (listEntry.percentage / 100)
            const couldBuyWouldBuyFactor = 0.7
            const howMuchToBuy = Number((canBuy * couldBuyWouldBuyFactor))
            console.log(`I'll buy ${howMuchToBuy} ${listEntry.pairName} as it has a portfolio percentage of ${listEntry.percentage}`)
            await this.binanceConnector.buyFuture(listEntry.pairName, Number(howMuchToBuy.toFixed(this.getDecimalPlaces(listEntry.pairName))))
        }
        Player.playMP3(`${__dirname}/../../sounds/game-new-level.mp3`) // https://www.freesoundslibrary.com/cow-moo-sounds/ 
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
        Player.playMP3(`${__dirname}/../../sounds/cow-moo-sound.mp3`) // https://www.freesoundslibrary.com/cow-moo-sounds/ 
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

}

const lrToBuy = Number(process.argv[2]) // e.g. 0.45
const lrToSell = Number(process.argv[3]) // e.g. 0.01
const binanceApiKey = process.argv[4] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[5] // check your profile on binance.com --> API Management

const i = new Investor(lrToBuy, lrToSell, binanceApiKey, binanceApiSecret)

setInterval(async () => {

    await i.invest()

}, 11 * 1000)