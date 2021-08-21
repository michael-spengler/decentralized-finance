
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
    private currentPrices: any[] = []
    private currentBitcoinPrice = 0
    private previousBitcoinPrice = 0
    private closingAt = 0
    private addingAt = 0
    private iterationCounter = 0
    private startBalanceUnderRisk = 0
    private balanceUnderRisk = 0
    private usdtSpotAccount1 = 0
    private bnbSpotAccount1 = 0
    private prediction = 'stay'
    private readonly predictionStatistics: IPredictionStatistics
    private previousPrediction = 'stay'

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

        const profitsHaveBeenSaved = await this.saveProfits()

        if (!profitsHaveBeenSaved) {

            await this.optimizeAccount(this.accountData1, this.binanceConnector1)

            await FinancialService.sleep(Math.floor(Math.random() * (900 - 9 + 1) + 9)) // staying undercover

            await this.exploitMeanManipulation()

        }

    }

    private async exploitMeanManipulation() {

        const marginRatio = (Number(this.accountData1.totalMaintMargin) * 100) / Number(this.accountData1.totalMarginBalance)
        const i = FinancialService.investigateTheLeastSuccessfulPosition(this.accountData1)

        const pnlInPercent = (i.theLeastSuccessfulPosition.unrealizedProfit * 100) / i.theLeastSuccessfulPosition.initialMargin

        if (marginRatio > 0) {

            if (pnlInPercent < - 100) {

                if (i.leastSuccessfulPositionIsInAccount === 1) {
                    console.log(`the least successful position is in account 1`)
                    const accountMode = FinancialService.getAccountMode(this.accountData1)

                    if ((accountMode === 'balanced' || marginRatio < 18) && marginRatio < 45) {
                        await this.addToTheLeastSuccessfulPosition(this.binanceConnector1, i.theLeastSuccessfulPosition)
                    }

                }
            } else {
                console.log(`The least successful position has a PNL of ${pnlInPercent}. Know your enemy.`)
            }

        }
    }

    private async saveProfits(): Promise<boolean> {

        let updateRequiredForAccount1 = false

        updateRequiredForAccount1 = await FinancialService.closeAllPositionsWithAPNLOfHigherThan(this.closingAt, this.accountData1, this.binanceConnector1)

        if (updateRequiredForAccount1) {
            return true
        }

        return false

    }

    private async optimizeAccount(accountData: any, binanceConnector: any) {
        const marginRatio = (Number(accountData.totalMaintMargin) * 100) / Number(accountData.totalMarginBalance)
        if (Number(accountData.totalMaintMargin) === 0 || marginRatio < 9) {
            await binanceConnector.buyFuture('BTCUSDT', 0.009)
        }

        await FinancialService.ensureHedgesAreInShape(binanceConnector, this.currentPrices, accountData)

    }

    private async addToTheLeastSuccessfulPosition(binanceConnector: any, theLeastSuccessfulPosition: any) {

        const accountId = binanceConnector.getAccountId()
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

    private async cleanTheDeskIfNecessary(forceIt: boolean = false): Promise<void> {

        const marginRatio1 = (Number(this.accountData1.totalMaintMargin) * 100) / Number(this.accountData1.totalMarginBalance)

        if (marginRatio1 > 83 && this.bnbSpotAccount1 < 0.1 && this.usdtSpotAccount1 < 10) {
            console.log(`I close all positions of account 1 because the strategy did not work well this time - marginRatio1: ${marginRatio1}`)
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

        this.closingAt = Math.floor(Math.random() * (27 - 18 + 1) + 18)

        this.addingAt = Math.floor(Math.random() * (27 - 18 + 1) + 18) * -1

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

        console.log(`prediction: ${this.prediction} - predictionStatistics: ${JSON.stringify(this.predictionStatistics)} - startBalUnderRisk: ${this.startBalanceUnderRisk} - balUnderRisk: ${this.balanceUnderRisk} - addingAt: ${this.addingAt} - closingAt: ${this.closingAt}`)

    }

}

const binanceApiKey1 = process.argv[2]
const binanceApiSecret1 = process.argv[3]
const simulationMode = process.argv[4]

// let cryptometerConnector = new CryptoMeterConnector(cryptoMeterAPIKey)

let binanceConnectorAccount1
let binanceConnectorAccount2

if (simulationMode === "X") {
    console.log("injecting a test double via constructor injection in order to go to simulation mode")
    binanceConnectorAccount1 = new BinanceConnectorDouble(binanceApiKey1, binanceApiSecret1, "account1") as any
} else {
    binanceConnectorAccount1 = new BinanceConnector(binanceApiKey1, binanceApiSecret1, "account1")
}

const explorer = new Explorer(binanceConnectorAccount1)
explorer.explore()
