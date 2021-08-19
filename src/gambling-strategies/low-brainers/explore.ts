

import { BinanceConnector } from "../../binance/binance-connector"
import { BinanceConnectorDouble } from "../../binance/binance-connector-double"
import { FinancialService } from "../utilities/financial-service"

export interface IPredictionStatistics {
    right: number
    wrong: number
}

export class Explorer {

    private accountData1: any
    private accountData2: any
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
    private usdtSpotAccount2 = 0
    private bnbSpotAccount2 = 0
    private prediction = 'stay'
    private readonly predictionStatistics: IPredictionStatistics
    private previousPrediction = 'stay'


    public constructor(private readonly binanceConnector1: BinanceConnector, private readonly binanceConnector2: BinanceConnector) {
        this.binanceConnector1 = binanceConnector1
        this.binanceConnector2 = binanceConnector2
        FinancialService.initializePortfolio()

        this.predictionStatistics = { right: 0, wrong: 0 }
    }


    public explore() {
        setInterval(async () => {
            this.iterationCounter += 1

            console.log(`\n******************************* Iteration ${this.iterationCounter} *******************************`)

            await this.collectData()

            await this.playTheGame()

            this.previousPrediction = this.prediction
            this.previousBitcoinPrice = this.currentBitcoinPrice
        }, 9 * 999)
    }

    private async playTheGame(): Promise<void> {

        await this.cleanTheDeskIfNecessary()


        let updateRequiredForAccount1 = false
        let updateRequiredForAccount2 = false

        updateRequiredForAccount1 = await FinancialService.closeAllPositionsWithAPNLOfHigherThan(this.closingAt, this.accountData1, this.binanceConnector1)
        await FinancialService.sleep(Math.floor(Math.random() * (900 - 9 + 1) + 9)) // staying undercover
        updateRequiredForAccount2 = await FinancialService.closeAllPositionsWithAPNLOfHigherThan(this.closingAt, this.accountData2, this.binanceConnector2)

        if (updateRequiredForAccount1 || updateRequiredForAccount2) {

            console.log(`collecting data before moving any further `)

        } else {

            if (Number(this.accountData1.totalMaintMargin) === 0) {
                await this.binanceConnector1.buyFuture('BTCUSDT', 0.007)
            }

            await FinancialService.sleep(Math.floor(Math.random() * (900 - 9 + 1) + 9)) // staying undercover

            if (Number(this.accountData2.totalMaintMargin) === 0) {
                await this.binanceConnector2.buyFuture('BTCUSDT', 0.007)
            }

            await FinancialService.ensureHedgesAreInShape(this.binanceConnector1, this.currentPrices, this.accountData1)
            await FinancialService.sleep(Math.floor(Math.random() * (200 - 10 + 1) + 10)) // staying undercover
            await FinancialService.ensureHedgesAreInShape(this.binanceConnector2, this.currentPrices, this.accountData2)

        }
    }

    private async cleanTheDeskIfNecessary(forceIt: boolean = false): Promise<void> {

        const marginRatio1 = (Number(this.accountData1.totalMaintMargin) * 100) / Number(this.accountData1.totalMarginBalance)
        const marginRatio2 = (Number(this.accountData2.totalMaintMargin) * 100) / Number(this.accountData2.totalMarginBalance)

        if (marginRatio1 > 83 && this.bnbSpotAccount1 < 0.1 && this.usdtSpotAccount1 < 10) {
            console.log(`I close all positions of account 1 because the strategy did not work well this time - marginRatio1: ${marginRatio1}`)
            await FinancialService.closeAllOpenPositions(this.accountData1, this.binanceConnector1)
        }

        if (marginRatio2 > 83 && this.bnbSpotAccount2 < 0.1 && this.usdtSpotAccount2 < 10) {
            console.log(`I close all positions of account 2 because the strategy did not work well this time - marginRatio2: ${marginRatio2}`)
            await FinancialService.closeAllOpenPositions(this.accountData2, this.binanceConnector2)
        }

        if (forceIt) {

            console.log("I close all positions as I was forced to do so.")
            await FinancialService.closeAllOpenPositions(this.accountData1, this.binanceConnector1)

            await FinancialService.sleep(Math.floor(Math.random() * (200 - 10 + 1) + 10)) // staying undercover

            await FinancialService.closeAllOpenPositions(this.accountData2, this.binanceConnector2)

        }

    }

    private async collectData(): Promise<void> {
        // this.totalAccount1 = await this.binanceConnector1.getTotalAccount()
        // console.log(JSON.stringify(this.totalAccount1).substr(0, 250))
        this.accountData1 = await this.binanceConnector1.getFuturesAccountData()
        this.currentPrices = await this.binanceConnector1.getCurrentPrices()

        await FinancialService.sleep(Math.floor(Math.random() * (200 - 10 + 1) + 10)) // staying undercover
        this.accountData2 = await this.binanceConnector2.getFuturesAccountData()

        if (this.iterationCounter === 1) {
            this.startBalanceUnderRisk =
                Number(this.accountData1.totalWalletBalance) +
                Number(this.accountData2.totalWalletBalance) +
                Number(this.accountData1.totalUnrealizedProfit) +
                Number(this.accountData2.totalUnrealizedProfit)
        }

        this.balanceUnderRisk = Number(this.accountData1.totalWalletBalance) +
            Number(this.accountData2.totalWalletBalance) +
            Number(this.accountData1.totalUnrealizedProfit) +
            Number(this.accountData2.totalUnrealizedProfit)

        this.closingAt = Math.floor(Math.random() * (27 - 18 + 1) + 18)

        this.addingAt = Math.floor(Math.random() * (27 - 18 + 1) + 18) * -1

        this.usdtSpotAccount1 = Number(await this.binanceConnector1.getUSDTBalance())
        this.bnbSpotAccount1 = Number(await this.binanceConnector1.getSpotBalance("BNB"))

        this.usdtSpotAccount2 = Number(await this.binanceConnector2.getUSDTBalance())
        this.bnbSpotAccount2 = Number(await this.binanceConnector2.getSpotBalance("BNB"))

        FinancialService.updatePriceHistoryOfPortfolio(this.currentPrices)
        this.currentBitcoinPrice = Number(this.currentPrices.filter((e: any) => e.coinSymbol === 'BTCUSDT')[0].price)

        this.prediction = FinancialService.getPrediction(this.currentBitcoinPrice)

        console.log(`ha :${this.previousPrediction}`)
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
const binanceApiKey2 = process.argv[4]
const binanceApiSecret2 = process.argv[5]
const simulationMode = process.argv[6]

// let cryptometerConnector = new CryptoMeterConnector(cryptoMeterAPIKey)

let binanceConnectorAccount1
let binanceConnectorAccount2

if (simulationMode === "X") {
    console.log("injecting a test double via constructor injection in order to go to simulation mode")
    binanceConnectorAccount1 = new BinanceConnectorDouble(binanceApiKey1, binanceApiSecret1, "account1") as any
    binanceConnectorAccount2 = new BinanceConnectorDouble(binanceApiKey2, binanceApiSecret2, "account2") as any
} else {
    binanceConnectorAccount1 = new BinanceConnector(binanceApiKey1, binanceApiSecret1, "account1")
    binanceConnectorAccount2 = new BinanceConnector(binanceApiKey2, binanceApiSecret2, "account2")
}

const explorer = new Explorer(binanceConnectorAccount1, binanceConnectorAccount2)
explorer.explore()


