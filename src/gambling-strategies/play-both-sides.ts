import { BinanceConnector } from "../binance/binance-connector"

const pair = process.argv[6] // e.g. ETHUSDT or BTCUSDT
const takeProfitLimit = Number(process.argv[7]) // e.g. 3
const unexpectedLossLimit = Number(process.argv[8]) // e.g. -15
const investmentAmount = Number(process.argv[9]) // e.g. 0.1


export class PlayBothSides {

    private binanceConnectorLong: BinanceConnector
    private binanceConnectorShort: BinanceConnector

    private successCounter = 0
    private failureCounter = 0

    private totalRealizedProfits = 0
    private totalRealizedLosses = 0

    public constructor(apiKeyLong: string, apiSecretLong: string, apiKeyShort: string, apiSecretShort: string) {
        this.binanceConnectorLong = new BinanceConnector(apiKeyLong, apiSecretLong)
        this.binanceConnectorShort = new BinanceConnector(apiKeyShort, apiSecretShort)
    }


    public async investWisely(): Promise<void> {

        const currentPrices = await this.binanceConnectorLong.getCurrentPrices()
        const price = Number(currentPrices.filter((e: any) => e.coinSymbol === pair)[0].price)

        const accountDataLong = await this.binanceConnectorLong.getFuturesAccountData()
        const accountDataShort = await this.binanceConnectorShort.getFuturesAccountData()

        const xPositionLong = accountDataLong.positions.filter((entry: any) => entry.symbol === pair)[0]
        const xPositionShort = accountDataShort.positions.filter((entry: any) => entry.symbol === pair)[0]

        const posAmtLong = Number(xPositionLong.positionAmt)
        const posAmtShort = Number(xPositionShort.positionAmt)

        console.log(`************************************************************************************`)
        console.log(`posAmtLong: ${posAmtLong} - posAmtShort: ${posAmtShort}`)


        const pnlLong = Number(accountDataLong.totalUnrealizedProfit)
        const pnlShort = Number(accountDataShort.totalUnrealizedProfit)

        console.log(`pnlLong: ${pnlLong} - pnlShort: ${pnlShort}`)

        if (posAmtLong === 0 && posAmtShort === 0) {

            console.log(`start the party`)
            await this.binanceConnectorLong.buyFuture(pair, investmentAmount)
            await this.binanceConnectorShort.sellFuture(pair, investmentAmount)

        } else if (posAmtLong === 0) {
            console.log('long profits had beed taken')
            if (pnlShort > 0) {
                console.log('no longer negative in short position - time to build up long position again')
                await this.binanceConnectorLong.buyFuture(pair, investmentAmount)
                this.successCounter++
            } else if (pnlShort < unexpectedLossLimit) {
                console.log(`this time the game went wrong - emergency reducing the short position`)
                this.totalRealizedLosses = this.totalRealizedLosses + pnlShort
                await this.binanceConnectorShort.buyFuture(pair, Number(((posAmtShort / 2) * -1).toFixed(3)))
                this.failureCounter++
            } else {
                console.log(`waiting until pnlShort gets 0 - currently it is ${pnlShort}`)
            }

        } else if (posAmtShort === 0) {
            console.log('short profits had beed taken')
            if (pnlLong > 0) {
                console.log('no longer negative in long position - time to build up short position again')
                await this.binanceConnectorShort.sellFuture(pair, investmentAmount)
                this.successCounter++
            } else if (pnlLong < unexpectedLossLimit) {
                console.log(`this time the game went wrong - emergency reducing the long position`)
                this.totalRealizedLosses = this.totalRealizedLosses + pnlLong
                const r = await this.binanceConnectorLong.sellFuture(pair, Number((posAmtLong / 2).toFixed(3)))
                console.log(r)
                this.failureCounter++
            } else {
                console.log(`waiting until pnlLong gets 0 - currently it is ${pnlLong}`)
            }

        } else if (pnlLong > takeProfitLimit) {
            console.log('taking profits by closing the long position')
            this.totalRealizedProfits = this.totalRealizedProfits + pnlLong
            await this.binanceConnectorLong.sellFuture(pair, investmentAmount)
        } else if (pnlShort > takeProfitLimit) {
            console.log('taking profits by closing the short position')
            this.totalRealizedProfits = this.totalRealizedProfits + pnlShort
            await this.binanceConnectorShort.buyFuture(pair, investmentAmount)
        }

        console.log(`successCounter: ${this.successCounter} vs. failureCounter: ${this.failureCounter} `)
        console.log(`totalRealizedProfits: ${this.totalRealizedProfits} vs. totalRealizedLosses: ${this.totalRealizedLosses} `)
    }

}

const binanceApiKeyLong = process.argv[2] // check your profile on binance.com --> API Management
const binanceApiSecretLong = process.argv[3] // check your profile on binance.com --> API Management
const binanceApiKeyShort = process.argv[4] // check your profile on binance.com --> API Management
const binanceApiSecretShort = process.argv[5] // check your profile on binance.com --> API Management


const instance = new PlayBothSides(binanceApiKeyLong, binanceApiSecretLong, binanceApiKeyShort, binanceApiSecretShort)

setInterval(async () => {


    instance.investWisely()


}, 11 * 1000)