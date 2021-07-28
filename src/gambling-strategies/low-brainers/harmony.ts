import { BinanceConnector } from "../../binance/binance-connector"

export class Harmony {

    private binanceConnector: BinanceConnector
    private intervalLengthInSeconds = 9
    private investmentPair = 'BTCUSDT'
    private hedgePair = 'DOGEUSDT'
    private overallCounter = 0
    private investmentSpecificCounter = 0
    private targetInvestmentAmount = 0.003
    private targetHedgePositionAmount = 0
    private eskalationsStufe = 0
    private pauseAsTheDealHadJustBeenClosed = false
    private previousPNL = 0
    private letTheBeastSleep = false
    private historicBitcoinPrices: number[] = []
    private historicBitcoinPricesLength = 100
    private overallPNL = 0
    private initialBitcoinPrice = 0
    private initialHedgePrice = 0


    public constructor(binanceApiKey: string, binanceApiSecret: string) {
        this.binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)
    }

    public flow() {

        setInterval(async () => {


            this.pauseAsTheDealHadJustBeenClosed = false

            const randomDelayInSeconds = Math.floor(Math.random() * ((this.intervalLengthInSeconds - 5) - 2 + 1) + 2);

            setTimeout(async () => {

                console.log(`overallPNL: ${this.overallPNL}`)



                this.overallCounter++
                this.investmentSpecificCounter++


                // collect relevant data
                const accountData = await this.binanceConnector.getFuturesAccountData()
                const bitcoinPosition = accountData.positions.filter((entry: any) => entry.symbol === this.investmentPair)[0]
                const hedgePosition = accountData.positions.filter((entry: any) => entry.symbol === this.hedgePair)[0]
                const currentPrices = await this.binanceConnector.getCurrentPrices()
                const currentBitcoinPrice: number = currentPrices.filter((e: any) => e.coinSymbol === this.investmentPair)[0].price
                const currentHedgePrice: number = currentPrices.filter((e: any) => e.coinSymbol === this.hedgePair)[0].price
                const bitcoinProfitInPercent = (bitcoinPosition.unrealizedProfit * 100) / bitcoinPosition.initialMargin
                const sellingAt = (Math.floor(Math.random() * (27 - 18 + 1) + 18)) - this.eskalationsStufe * Math.PI + 9
                const bitcoinPositionValue = Number(bitcoinPosition.positionAmt) * currentBitcoinPrice
                const hedgePositionValue = Number(hedgePosition.positionAmt) * currentHedgePrice
                const hedgeProfitInPercent = (hedgePosition.unrealizedProfit * 100) / hedgePosition.initialMargin
                const unrealizedProfitInPercent = (Number(accountData.totalUnrealizedProfit) * 100) / Number(accountData.totalInitialMargin)
                const flowIndicator = this.previousPNL - unrealizedProfitInPercent

                if (this.historicBitcoinPrices.length === this.historicBitcoinPricesLength) {
                    this.historicBitcoinPrices.splice(this.historicBitcoinPrices.length - 1, 1)
                }
                this.historicBitcoinPrices.unshift(currentBitcoinPrice)

                const averageBitcoinPrice = this.getTheAverage(this.historicBitcoinPrices)
                const bitCoinAverageDeltaInPercent = (currentBitcoinPrice * 100 / averageBitcoinPrice) - 100


                // ensure proper USDT Futures and Fiat and Spot Supply
                if (Number(accountData.availableBalance) > 500) {
                    await this.binanceConnector.transferFromUSDTFuturesToSpotAccount(Number(accountData.availableBalance) - 500)
                }


                // inform observers
                // console.log(`averageBitcoinPrice: ${averageBitcoinPrice}`)
                // console.log(`currentBitcoinPrice: ${currentBitcoinPrice}`)
                // console.log(`bitCoinAverageDeltaInPercent: ${bitCoinAverageDeltaInPercent}`)
                // console.log(`overallCounter: ${this.overallCounter}`)
                console.log(`unrealizedProfitInPercent: ${unrealizedProfitInPercent} - would sell at ${sellingAt}%`)
                console.log(`investmentSpecificCounter: ${this.investmentSpecificCounter}`)
                // console.log(`bitcoinPositionValue: ${bitcoinPositionValue} vs. hedgePositionValue: ${hedgePositionValue}`)




                // check if I shall play my game
                if (this.previousPNL !== 0 && (flowIndicator < -1 * Math.PI || flowIndicator > Math.PI)) {
                    this.letTheBeastSleep = true
                    // console.log(`The beast sleeps as the flow indicator is ${flowIndicator}`)
                } else if (bitCoinAverageDeltaInPercent > 0.2 || bitCoinAverageDeltaInPercent < -0.2) {
                    this.letTheBeastSleep = true
                    // console.log(`The beast sleeps as the bitCoinAverageDeltaInPercent is ${bitCoinAverageDeltaInPercent}`)
                } else {
                    this.letTheBeastSleep = false
                    // console.log(`The beast would be ready as the flow indicator is ${flowIndicator} and the bitCoinAverageDeltaInPercent is ${bitCoinAverageDeltaInPercent}`)
                }


                // check if I should close the deal or potentially act in beast mode
                if ((unrealizedProfitInPercent > sellingAt ||
                    unrealizedProfitInPercent < - 54 ||
                    unrealizedProfitInPercent > 6 && this.investmentSpecificCounter % 9 === 0 ||
                    this.eskalationsStufe === 9) &&
                    Number(bitcoinPosition.positionAmt) > 0) {

                    console.log(`closing the deal with an unrealizedProfitInPercent of ${unrealizedProfitInPercent}% - eskalationsStufe: ${this.eskalationsStufe} - bitCoinAverageDeltaInPercent ${bitCoinAverageDeltaInPercent}`)
                    this.overallPNL = this.overallPNL + Number(accountData.totalUnrealizedProfit)
                    this.investmentSpecificCounter = 0
                    const responseInvestment = await this.binanceConnector.sellFuture(this.investmentPair, Number(bitcoinPosition.positionAmt))
                    console.log(responseInvestment)

                    const responseHedge = await this.binanceConnector.buyFuture(this.hedgePair, Number(hedgePosition.positionAmt) * -1)
                    console.log(responseHedge)

                    switch (this.overallCounter % 2) {
                        case 0: this.hedgePair = 'DOGEUSDT'
                        case 1: this.hedgePair = 'DOGEUSDT' // doges seem to be the best hedge
                        // case 1: this.hedgePair = 'DOTUSDT'
                        // case 2: this.hedgePair = 'XRPUSDT'
                    }

                    console.log(`going back to normal with this.hedgePair: ${this.hedgePair}`)
                    this.eskalationsStufe = 0
                    this.pauseAsTheDealHadJustBeenClosed = true

                } else if (unrealizedProfitInPercent < 0 && Number(hedgePosition.positionAmt) > 0) {

                    console.log(`beast mode`)
                    const randomIndicator = ((Math.floor(Math.random() * (2 - 0 + 1) + 0) + this.eskalationsStufe) * -1)
                    console.log(`randomIndicator: ${randomIndicator}`)

                    if (this.letTheBeastSleep) {

                        console.log("sleeping seems especially cool in times of those overhyped pumps and dumps which do not work in our favour")

                    } else {

                        if (hedgeProfitInPercent < randomIndicator && hedgeProfitInPercent < bitcoinProfitInPercent) {

                            console.log(`short selling hedge in beast mode`)
                            const responseHedge = await this.binanceConnector.sellFuture(this.hedgePair, Number(hedgePosition.positionAmt) * -1)
                            console.log(responseHedge)
                            this.eskalationsStufe++

                        } else if (bitcoinProfitInPercent < randomIndicator && bitcoinProfitInPercent < hedgeProfitInPercent) {

                            console.log(`buying btc in beast mode`)
                            const responseInvestment = await this.binanceConnector.buyFuture(this.investmentPair, Number(bitcoinPosition.positionAmt))
                            console.log(responseInvestment)
                            this.eskalationsStufe++

                        }
                    }

                    console.log(`eskalationsStufe: ${this.eskalationsStufe}`)
                }


                if (this.pauseAsTheDealHadJustBeenClosed) {
                    console.log(`waiting as a deal had just been closed successfully.`)
                } else {


                    // check if I shall initialize the Game
                    if (Number(bitcoinPosition.positionAmt) < this.targetInvestmentAmount) {
                        const bitcoinDelta = this.targetInvestmentAmount - Number(bitcoinPosition.positionAmt)
                        console.log(`I buy ${bitcoinDelta} BTC`)
                        await this.binanceConnector.buyFuture('BTCUSDT', bitcoinDelta)
                        this.initialBitcoinPrice = currentBitcoinPrice

                        this.targetHedgePositionAmount = Number(((this.targetInvestmentAmount / currentHedgePrice) * currentBitcoinPrice).toFixed(0))
                        console.log(`I sell ${this.targetHedgePositionAmount} ${this.hedgePair} to establish the hedge`)
                        const response = await this.binanceConnector.sellFuture(this.hedgePair, this.targetHedgePositionAmount)
                        console.log(response)
                        this.initialHedgePrice = currentHedgePrice
                    }


                    // check if I shall go to thug life mode
                    if (this.initialBitcoinPrice === 0) this.initialBitcoinPrice = currentBitcoinPrice
                    if (this.initialHedgePrice === 0) this.initialHedgePrice = currentHedgePrice

                    const bitcoinPriceDeltaInPercent = ((currentBitcoinPrice * 100) / this.initialBitcoinPrice) - 100
                    const hedgePriceDeltaInPercent = ((currentHedgePrice * 100) / this.initialHedgePrice) - 100

                    console.log(`initialBitcoinPrice: ${this.initialBitcoinPrice} vs. initialHedgePrice: ${this.initialHedgePrice}`)
                    console.log(`currentBitcoinPrice: ${currentBitcoinPrice} vs. currentHedgePrice: ${currentHedgePrice}`)
                    console.log(`thug life :) --> bitcoinPriceDeltaInPercent: ${bitcoinPriceDeltaInPercent} vs. hedgePriceDeltaInPercent: ${hedgePriceDeltaInPercent}`)

                    if ((bitcoinPriceDeltaInPercent < hedgePriceDeltaInPercent) || (hedgeProfitInPercent < 0 && bitcoinProfitInPercent < 0)) {
                        console.log(`thug life :) --> pimping the bitcoin position`)

                        const responseInvestment = await this.binanceConnector.buyFuture(this.investmentPair, this.targetInvestmentAmount)
                        console.log(responseInvestment)

                        const responseHedge = await this.binanceConnector.sellFuture(this.hedgePair, this.targetHedgePositionAmount)
                        console.log(responseHedge)

                    }

                }

                this.previousPNL = unrealizedProfitInPercent

            }, 1000 * randomDelayInSeconds)

        }, 1000 * this.intervalLengthInSeconds)
    }



    public getTheAverage(list: number[]): number {

        let sum = 0
        for (const e of list) {
            sum = sum + Number(e)
        }

        return sum / list.length
    }
}


const binanceApiKey = process.argv[2] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[3] // check your profile on binance.com --> API Management


const harmonie = new Harmony(binanceApiKey, binanceApiSecret)
harmonie.flow()