import { BinanceConnector } from "../../binance/binance-connector"

export class Harmony {

    private binanceConnector: BinanceConnector
    private intervalLengthInSeconds = 9
    private investmentPair = 'BTCUSDT'
    private hedgePair = 'DOGEUSDT'
    private counter = 0
    private targetInvestmentAmount = 0.003
    private beastMode = false
    private eskalationsStufe = 0
    private pause = false
    private previousPNL = 0
    private letTheBeastSleep = false

    public constructor(binanceApiKey: string, binanceApiSecret: string) {
        this.binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)
    }

    public flow() {

        setInterval(async () => {
            this.pause = false
            const randomDelayInSeconds = Math.floor(Math.random() * ((this.intervalLengthInSeconds - 5) - 2 + 1) + 2);

            console.log(`randomDelayInSeconds: ${randomDelayInSeconds}`)

            setTimeout(async () => {

                const accountData = await this.binanceConnector.getFuturesAccountData()

                if (Number(accountData.availableBalance) > 200) {
                    await this.binanceConnector.transferFromUSDTFuturesToSpotAccount(Number(accountData.availableBalance) - 200)
                } else if (Number(accountData.availableBalance) < 180) {
                    await this.binanceConnector.transferFromSpotAccountToUSDTFutures(200 - Number(accountData.availableBalance))
                }
                const unrealizedProfitInPercent = (Number(accountData.totalUnrealizedProfit) * 100) / Number(accountData.totalInitialMargin)
    
                const flowIndicator = this.previousPNL - unrealizedProfitInPercent
                if (this.previousPNL !== 0 && (flowIndicator < -1 * Math.PI || flowIndicator > Math.PI)) {
                    this.letTheBeastSleep = true
                    console.log(`The beast sleeps as the flow indicator is ${flowIndicator}`)
                } else {
                    this.letTheBeastSleep = false
                    console.log(`The beast would be ready as the flow indicator is ${flowIndicator}`)
                }
    
                this.counter++
                const bitcoinPosition = accountData.positions.filter((entry: any) => entry.symbol === this.investmentPair)[0]
                const hedgePosition = accountData.positions.filter((entry: any) => entry.symbol === this.hedgePair)[0]
                const currentPrices = await this.binanceConnector.getCurrentPrices()
                const currentBitcoinPrice: number = currentPrices.filter((e: any) => e.coinSymbol === 'BTCUSDT')[0].price
                const bitcoinProfitInPercent = (bitcoinPosition.unrealizedProfit * 100) / bitcoinPosition.initialMargin
                const sellingAt = (Math.floor(Math.random() * (27 - 18 + 1) + 18)) - this.eskalationsStufe * Math.PI + 9
                const bitcoinPositionValue = Number(bitcoinPosition.positionAmt) * currentBitcoinPrice
                const hedgeProfitInPercent = (hedgePosition.unrealizedProfit * 100) / hedgePosition.initialMargin

                console.log(`unrealizedProfitInPercent: ${unrealizedProfitInPercent}`)

                console.log(`I would sell at: ${sellingAt}% overall profit`)

                if (Number(accountData.availableBalance) > 200) {
                    await this.binanceConnector.transferFromUSDTFuturesToSpotAccount(Number(accountData.availableBalance) - 200)
                } else if (Number(accountData.availableBalance) < 50) {
                    await this.binanceConnector.transferFromSpotAccountToUSDTFutures(10 - Number(accountData.availableBalance))
                }


                if (unrealizedProfitInPercent > sellingAt) {
                    console.log(`closing the deal with an unrealizedProfitInPercent of ${unrealizedProfitInPercent}% - eskalationsStufe: ${this.eskalationsStufe}`)

                    const responseInvestment = await this.binanceConnector.sellFuture(this.investmentPair, Number(bitcoinPosition.positionAmt))
                    console.log(responseInvestment)

                    const responseHedge = await this.binanceConnector.buyFuture(this.hedgePair, Number(hedgePosition.positionAmt) * -1)
                    console.log(responseHedge)

                    switch (this.counter % 3) {
                        case 0: this.hedgePair = 'DOGEUSDT'
                        case 1: this.hedgePair = 'DOTUSDT'
                        case 2: this.hedgePair = 'XRPUSDT'
                    }

                    console.log(`going back to normal with this.hedgePair: ${this.hedgePair}`)
                    this.beastMode = false
                    this.eskalationsStufe = 0
                    this.pause = true

                } else if (unrealizedProfitInPercent < 0 && Number(hedgePosition.positionAmt) < 0) {
                    console.log(`beast mode`)
                    this.beastMode = true
                    const randomIndicator = ((Math.floor(Math.random() * (3 - 0 + 1) + 0) + this.eskalationsStufe) * -1)
                    console.log(`randomIndicator: ${randomIndicator}`)
                    if (this.letTheBeastSleep) {
                        console.log("sleeping seems especially cool in times of those overhyped pumps and dumps which do not work in our favour")
                    } else {

                        if (hedgeProfitInPercent < randomIndicator && hedgeProfitInPercent < bitcoinProfitInPercent) {
                            console.log(`short selling hedge in beast mode`)
                            const responseInvestment = await this.binanceConnector.sellFuture(this.hedgePair, Number(hedgePosition.positionAmt) * -1)
                            console.log(responseInvestment)
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

                if (this.pause) {
                    // relax
                } else {

                    if (Number(bitcoinPosition.positionAmt) < this.targetInvestmentAmount) {
                        const bitcoinDelta = this.targetInvestmentAmount - Number(bitcoinPosition.positionAmt)
                        console.log(`I would buy ${bitcoinDelta} BTC`)
                        await this.binanceConnector.buyFuture('BTCUSDT', bitcoinDelta)
                    }

                    if (this.beastMode) {
                        console.log(`I'm a motherfucking beast`)
                    } else if (Number(bitcoinPosition.positionAmt) > 0) {

                        console.log(`potentially adjusting the hedge`)
                        const currentHedgePrice: number = currentPrices.filter((e: any) => e.coinSymbol === this.hedgePair)[0].price
                        const targetHedgePositionAmount = (bitcoinPositionValue / currentHedgePrice) * -1

                        const hedgeDelta = Number(targetHedgePositionAmount.toFixed(0)) - Number(hedgePosition.positionAmt)
                        const hedgeDeltaValue = (targetHedgePositionAmount * currentHedgePrice) - (Number(hedgePosition.positionAmt) * currentHedgePrice)
                        console.log(`hedgeDeltaValue: ${hedgeDeltaValue}`)

                        if (hedgeDeltaValue > 153) {
                            console.log(`I would buy ${hedgeDelta} ${this.hedgePair}`)
                            const response = await this.binanceConnector.buyFuture(this.hedgePair, hedgeDelta)
                            console.log(response)
                        } else if (hedgeDelta <= -153) {
                            console.log(`I would sell ${hedgeDelta * -1} ${this.hedgePair}`)
                            const response = await this.binanceConnector.sellFuture(this.hedgePair, hedgeDelta * -1)
                            console.log(response)
                        }
                    }
                }
                this.previousPNL = unrealizedProfitInPercent
            }, 1000 * randomDelayInSeconds)
        }, 1000 * this.intervalLengthInSeconds)
    }

}


const binanceApiKey = process.argv[2] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[3] // check your profile on binance.com --> API Management


const harmonie = new Harmony(binanceApiKey, binanceApiSecret)
harmonie.flow()