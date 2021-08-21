
// https://medium.com/dydxderivatives/programatic-trading-on-dydx-4c74b8e86d88

import { BinanceConnector } from "../../binance/binance-connector"
import { BinanceConnectorDouble } from "../../binance/binance-connector-double"
import { FinancialService } from "../utilities/financial-service"

export interface IPredictionStatistics {
    right: number
    wrong: number
}

export class Explorer {

    private accountData1: any
    private accountMode = ""
    private marginRatio: any
    private currentPrices: any[] = []
    private currentBitcoinPrice = 0
    private previousBitcoinPrice = 0
    private reducingAt = 0
    private addingAt = 0
    private iterationCounter = 0
    private startBalanceUnderRisk = 0
    private balanceUnderRisk = 0
    private usdtSpotAccount1 = 0
    private bnbSpotAccount1 = 0
    private prediction = 'stay'
    private readonly predictionStatistics: IPredictionStatistics
    private previousPrediction = 'stay'
    private thingsWentWrongCounter = 0

    public constructor(private readonly binanceConnector1: BinanceConnector) {
        this.binanceConnector1 = binanceConnector1
        FinancialService.initializePortfolio()

        this.predictionStatistics = { right: 0, wrong: 0 }
    }

    public explore() {

        setInterval(async () => {
            this.iterationCounter += 1

            console.log(`\n******************************* Iteration ${this.iterationCounter} *******************************`)

            await this.collectData()

            await this.cleanTheDeskIfNecessary()

            await this.playTheGame()

            this.previousPrediction = this.prediction
            this.previousBitcoinPrice = this.currentBitcoinPrice

        }, 9 * 999)
    }

    private async playTheGame(): Promise<void> {

        if (Number(this.accountData1.totalMaintMargin) === 0 || this.marginRatio < 18) {

            await this.binanceConnector1.buyFuture('BTCUSDT', 0.009) // replace this by portfolio ...

        } else if (this.marginRatio > 54 && this.accountMode !== 'balanced') {

            console.log(`special situation requires risk reduction`)
            this.thingsWentWrongCounter += 1
            await FinancialService.reducePositionsByTradingAmount(this.accountData1, this.binanceConnector1, this.currentPrices)

        } else if (this.marginRatio > 63) {

            console.log(`very special situation requires risk reduction`)
            this.thingsWentWrongCounter += 1
            await FinancialService.reducePositionsByTradingAmount(this.accountData1, this.binanceConnector1, this.currentPrices)

        } else {

            await FinancialService.ensureHedgesAreInShape(this.binanceConnector1, this.currentPrices, this.accountData1)

            await FinancialService.sleep(Math.floor(Math.random() * (900 - 9 + 1) + 9)) // staying undercover

            await this.exploitMeanManipulation()

        }



    }

    private async exploitMeanManipulation() {

        const investigationResultLS = FinancialService.investigateTheLeastSuccessfulPosition(this.accountData1)
        const investigationResultMS = FinancialService.investigateTheMostSuccessfulPosition(this.accountData1)

        const pnlInPercentLS = (investigationResultLS.theLeastSuccessfulPosition.unrealizedProfit * 100) / investigationResultLS.theLeastSuccessfulPosition.initialMargin
        const pnlInPercentMS = (investigationResultMS.theMostSuccessfulPosition.unrealizedProfit * 100) / investigationResultMS.theMostSuccessfulPosition.initialMargin

        if (this.marginRatio > 0 && (this.accountMode === 'balanced' || this.marginRatio < 18)) {

            if (pnlInPercentLS < this.addingAt && this.marginRatio < 45) {
                console.log(`adding to the least successful position`)
                await this.addToTheLeastSuccessfulPosition(this.binanceConnector1, investigationResultLS.theLeastSuccessfulPosition)
            }

            if (pnlInPercentMS > this.reducingAt) {
                console.log(`reducing the most successful position`)
                await this.reduceTheMostSuccessfulPosition(this.binanceConnector1, investigationResultMS.theMostSuccessfulPosition)
            }

        }
    }

    // private async saveProfits(): Promise<boolean> {

    //     let updateRequiredForAccount1 = false

    //     updateRequiredForAccount1 = await FinancialService.closeAllPositionsWithAPNLOfHigherThan(this.reducingAt, this.accountData1, this.binanceConnector1)

    //     if (updateRequiredForAccount1) {
    //         return true
    //     }

    //     return false

    // }

    private async addToTheLeastSuccessfulPosition(binanceConnector: any, theLeastSuccessfulPosition: any) {

        const currentPrice = Number(this.currentPrices.filter((e: any) => e.coinSymbol === theLeastSuccessfulPosition.symbol)[0].price)
        const maxiAmount = FinancialService.getMaxiAmountFromPrice(currentPrice)
        const tradingAmount = FinancialService.getTradingAmountFromPrice(currentPrice)

        if (Number(theLeastSuccessfulPosition.positionAmt) > 0 && Number(theLeastSuccessfulPosition.positionAmt) < maxiAmount) {
            console.log(`I buy ${tradingAmount} of ${theLeastSuccessfulPosition.symbol} as it is the least successful position so far.`)
            await binanceConnector.buyFuture(theLeastSuccessfulPosition.symbol, tradingAmount)
        } else if (Number(theLeastSuccessfulPosition.positionAmt) < 0 && Number(theLeastSuccessfulPosition.positionAmt) * -1 < maxiAmount) {
            console.log(`I short sell ${tradingAmount} of ${theLeastSuccessfulPosition.symbol} as it is the least successful position so far.`)
            await binanceConnector.sellFuture(theLeastSuccessfulPosition.symbol, tradingAmount)
        }

    }

    private async reduceTheMostSuccessfulPosition(binanceConnector: any, theMostSuccessfulPosition: any) {

        const currentPrice = Number(this.currentPrices.filter((e: any) => e.coinSymbol === theMostSuccessfulPosition.symbol)[0].price)
        const maxiAmount = FinancialService.getMaxiAmountFromPrice(currentPrice)
        const tradingAmount = FinancialService.getTradingAmountFromPrice(currentPrice)

        if (Number(theMostSuccessfulPosition.positionAmt) > 0 && Number(theMostSuccessfulPosition.positionAmt) < maxiAmount) {
            console.log(`I sell ${tradingAmount} of ${theMostSuccessfulPosition.symbol} as it is the least successful position so far.`)
            await binanceConnector.sellFuture(theMostSuccessfulPosition.symbol, tradingAmount)
        } else if (Number(theMostSuccessfulPosition.positionAmt) < 0 && Number(theMostSuccessfulPosition.positionAmt) * -1 < maxiAmount) {
            console.log(`I buy back short sold ${tradingAmount} of ${theMostSuccessfulPosition.symbol} as it is the most successful position so far.`)
            await binanceConnector.buyFuture(theMostSuccessfulPosition.symbol, tradingAmount)
        }

    }
    private async cleanTheDeskIfNecessary(forceIt: boolean = false): Promise<void> {

        if (this.marginRatio > 83 && this.bnbSpotAccount1 < 0.1 && this.usdtSpotAccount1 < 10) {
            console.log(`I close all positions of account 1 because the strategy did not work well this time - marginRatio1: ${this.marginRatio}`)
            await FinancialService.closeAllOpenPositions(this.accountData1, this.binanceConnector1)
        }

        if (forceIt) {

            console.log("I close all positions as I was forced to do so.")
            await FinancialService.closeAllOpenPositions(this.accountData1, this.binanceConnector1)

            await FinancialService.sleep(Math.floor(Math.random() * (900 - 10 + 1) + 10)) // staying undercover
        }

    }

    private async collectData(): Promise<void> {

        // this.totalAccount1 = await this.binanceConnector1.getTotalAccount()
        // console.log(JSON.stringify(this.totalAccount1).substr(0, 250))
        this.accountData1 = await this.binanceConnector1.getFuturesAccountData()
        this.currentPrices = await this.binanceConnector1.getCurrentPrices()

        await FinancialService.sleep(Math.floor(Math.random() * (200 - 10 + 1) + 10)) // staying undercover

        if (this.iterationCounter === 1) {
            this.startBalanceUnderRisk = Number(this.accountData1.totalWalletBalance) + Number(this.accountData1.totalUnrealizedProfit)
        }

        this.balanceUnderRisk = Number(this.accountData1.totalWalletBalance) + Number(this.accountData1.totalUnrealizedProfit)

        this.reducingAt = Math.floor(Math.random() * (81 - 18 + 1) + 18)

        this.addingAt = Math.floor(Math.random() * (81 - 18 + 1) + 18) * -1

        this.usdtSpotAccount1 = Number(await this.binanceConnector1.getUSDTBalance())
        this.bnbSpotAccount1 = Number(await this.binanceConnector1.getSpotBalance("BNB"))

        FinancialService.updatePriceHistoryOfPortfolio(this.currentPrices)
        this.currentBitcoinPrice = Number(this.currentPrices.filter((e: any) => e.coinSymbol === 'BTCUSDT')[0].price)

        this.prediction = FinancialService.getPrediction(this.currentBitcoinPrice)

        if (this.previousPrediction === 'up') {

            if (this.currentBitcoinPrice >= this.previousBitcoinPrice) {
                this.predictionStatistics.right += 1
            } else {
                this.predictionStatistics.wrong += 1
            }
        } else if (this.previousPrediction === 'down') {
            if (this.currentBitcoinPrice <= this.previousBitcoinPrice) {
                this.predictionStatistics.right += 1
            } else {
                this.predictionStatistics.wrong += 1
            }
        }

        this.marginRatio = (Number(this.accountData1.totalMaintMargin) * 100) / Number(this.accountData1.totalMarginBalance)

        this.accountMode = FinancialService.getAccountMode(this.accountData1)

        console.log(`thingsWentWrongCounter: ${this.thingsWentWrongCounter} - predictionStatistics: ${JSON.stringify(this.predictionStatistics)} - startBalUnderRisk: ${this.startBalanceUnderRisk} - balUnderRisk: ${this.balanceUnderRisk} - addingAt: ${this.addingAt} - reducingAt: ${this.reducingAt}`)

    }

}

const binanceApiKey1 = process.argv[2]
const binanceApiSecret1 = process.argv[3]
const simulationMode = process.argv[4]

// let cryptometerConnector = new CryptoMeterConnector(cryptoMeterAPIKey)

let binanceConnectorAccount1

if (simulationMode === "X") {
    console.log("injecting a test double via constructor injection in order to go to simulation mode")
    binanceConnectorAccount1 = new BinanceConnectorDouble(binanceApiKey1, binanceApiSecret1, "account1") as any
} else {
    binanceConnectorAccount1 = new BinanceConnector(binanceApiKey1, binanceApiSecret1, "account1")
}

const explorer = new Explorer(binanceConnectorAccount1)
explorer.explore()
