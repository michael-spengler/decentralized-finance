// import { exit } from "process"

import { BinanceConnector } from "../../binance/binance-connector"
import { BinanceConnectorDouble } from "../../binance/binance-connector-double"
import { FinancialService } from "../utilities/financial-service"

export class TwoAccountsExploit {

  private readonly tradingUnit = 0.001
  private readonly minimumBTCAtRisk = 0.009

  private accountData1: any
  private accountData2: any
  private bitcoinPosition1: any
  private bitcoinPosition2: any
  private etherPosition1: any
  private etherPosition2: any
  private pnlBTC1 = 0
  private pnlBTC2 = 0
  private previousAddpnlBTC1 = 0
  private previousAddpnlBTC2 = 0
  private previousReducepnlBTC1 = 0
  private previousReducepnlBTC2 = 0
  private closingAt = 0
  private addingAt = 0
  private iterationCounter = 0
  private startBalanceUnderRisk = 0
  private balanceUnderRisk = 0
  private totalUnrealizedProfitInPercent1 = 0
  private totalUnrealizedProfitInPercent2 = 0
  private totalUnrealizedProfitInPercent = 0
  private usdtSpotAccount1 = 0
  private bnbSpotAccount1 = 0
  private usdtSpotAccount2 = 0
  private bnbSpotAccount2 = 0

  public constructor(private readonly binanceConnector1: BinanceConnector, private readonly binanceConnector2: BinanceConnector) {
    this.binanceConnector1 = binanceConnector1
    this.binanceConnector2 = binanceConnector2
    FinancialService.initializeBuyLowSellHighLongPortfolio()
    FinancialService.initializeBuyLowSellHighShortPortfolio()
    FinancialService.initializePortfolio()
  }

  public playWithTheForce(): void {

    setInterval(async () => {
      this.iterationCounter += 1

      console.log(`\n******************************* Iteration ${this.iterationCounter} *******************************`)

      await this.collectData()

      // const r = await this.binanceConnector1.futuresLeverage('SOLUSDT', 50)
      // console.log(r)
      await this.playTheGame()

    }, 9 * 999)
  }

  private async playTheGame(): Promise<void> {

    if (this.iterationCounter === 1) {

      await this.startTheGame()

    } else {

      await this.cleanTheDeskIfNecessary()

      await FinancialService.optimizeValueAtRiskOnAccount(this.binanceConnector1, this.bnbSpotAccount1, this.usdtSpotAccount1, this.accountData1)

      await FinancialService.optimizeValueAtRiskOnAccount(this.binanceConnector2, this.bnbSpotAccount2, this.usdtSpotAccount2, this.accountData2)

      await this.optimizeBTC1()

      await FinancialService.sleep(Math.floor(Math.random() * (900 - 90 + 1) + 90)) // staying undercover

      await this.optimizeBTC2()

      await this.enjoyThePerfectHedges()


      if (this.iterationCounter % 9 === 0) {
        const currentPrices = await this.binanceConnector1.getCurrentPrices()
        await FinancialService.buyLowSellHigh(this.closingAt, this.binanceConnector1, currentPrices, this.accountData1)
        // await FinancialService.getThingsGoingWhenStuckInAnUnRewardingBalance(this.closingAt, this.binanceConnector1, currentPrices, this.accountData1)
        await FinancialService.sleep(Math.floor(Math.random() * (900 - 90 + 1) + 90)) // staying undercover
        await FinancialService.buyLowSellHigh(this.closingAt, this.binanceConnector2, currentPrices, this.accountData2)
        // await FinancialService.getThingsGoingWhenStuckInAnUnRewardingBalance(this.closingAt, this.binanceConnector2, currentPrices, this.accountData2)
      }
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
      await FinancialService.closeAllOpenPositions(
        this.accountData2,
        this.binanceConnector2,
      )
    }

    if (forceIt) {

      console.log("I close all positions as I was forced to do so.")
      await FinancialService.closeAllOpenPositions(this.accountData1, this.binanceConnector1)

      await FinancialService.sleep(Math.floor(Math.random() * (200 - 10 + 1) + 10)) // staying undercover

      await FinancialService.closeAllOpenPositions(this.accountData2, this.binanceConnector2)

    }
  }

  private async adjustTheEtherHedge(etherPosition: any, binanceConnector: any, accountData: any): Promise<void> {
    const accountId = binanceConnector.getAccountId()
    const accountMode = FinancialService.getAccountMode(accountData)
    const marginRatio = (Number(accountData.totalMaintMargin) * 100) / Number(accountData.totalMarginBalance)
    let pnlInPercent = (etherPosition.unrealizedProfit * 100) / etherPosition.initialMargin

    if (pnlInPercent > 1000000000) {
      pnlInPercent = 0
    }

    if (pnlInPercent > this.closingAt) {
      if (Number(etherPosition.positionAmt) > 0.1) {
        console.log(`${accountId}: I sell 0.01 Ether to realize some profits`)
        await binanceConnector.sellFuture("ETHUSDT", 0.01)
      } else if (Number(etherPosition.positionAmt) < -0.1) {
        console.log(
          `${accountId}: I buy back 0.01 Ether to realize some profits`,
        )
        await binanceConnector.buyFuture("ETHUSDT", 0.01)
      }
    } else {
      if (marginRatio < 45 && accountMode === "long" && Number(etherPosition.positionAmt) > -2) {
        console.log(`${accountId}: I sell 0.01 Ether to protect the  account`)
        await binanceConnector.sellFuture("ETHUSDT", 0.01)
      } else if (marginRatio < 45 && accountMode === "short" && Number(etherPosition.positionAmt) < 2) {
        console.log(`${accountId}: I buy 0.01 Ether to protect the account`)
        await binanceConnector.buyFuture("ETHUSDT", 0.01)
      }
    }
  }

  private async adjustTheAltHedge(accountData: any, binanceConnector: any, position: any, pair: string): Promise<void> {
    const accountId = binanceConnector.getAccountId()

    const accountMode = FinancialService.getAccountMode(accountData)
    const marginRatio = (Number(accountData.totalMaintMargin) * 100) /
      Number(accountData.totalMarginBalance)

    let pnlInPercent = (position.unrealizedProfit * 100) /
      position.initialMargin

    if (pnlInPercent > 1000000000) {
      pnlInPercent = 0
    }

    let limit = 100
    let hedgeUnit = 3
    switch (pair) {
      case "LINKUSDT": {
        limit = 200
        hedgeUnit = 3
        break
      }
      case "BATUSDT": {
        limit = 1200
        hedgeUnit = 9
        break
      }
      default: {
        limit = 100
        hedgeUnit = 6
      }
    }

    if (pnlInPercent > this.closingAt) {
      if (Number(position.positionAmt) >= hedgeUnit) {
        console.log(
          `${accountId}: selling some ${pair} to realize some of the profits (${position.unrealizedProfit})`,
        )
        await binanceConnector.sellFuture(pair, hedgeUnit)
      }

      if (pnlInPercent > this.closingAt && Number(position.positionAmt) <= -hedgeUnit) {
        console.log(
          `${accountId}: buying back some short sold ${pair} to realize some of the profits (${position.unrealizedProfit})`,
        )
        await binanceConnector.buyFuture(pair, hedgeUnit)
      }
    } else {
      if (accountMode === "long") {
        if (marginRatio < 45 && Number(position.positionAmt) > limit * -1) {
          console.log(
            `${accountId}: short selling ${pair} to protect a long account - limit would be: ${limit}`,
          )
          await binanceConnector.sellFuture(pair, hedgeUnit)
        }
      } else if (accountMode === "short") {
        if (marginRatio < 45 && Number(position.positionAmt) < limit) {
          console.log(
            `${accountId}: buying ${pair} to protect a short account - limit would be: ${limit}`,
          )
          await binanceConnector.buyFuture(pair, hedgeUnit)
        }
      }
    }
  }

  private async enjoyThePerfectHedges(): Promise<void> {
    const batPosition1 = this.accountData1.positions.filter((entry: any) => entry.symbol === "BATUSDT")[0]
    const batPosition2 = this.accountData2.positions.filter((entry: any) => entry.symbol === "BATUSDT")[0]
    const linkPosition1 = this.accountData1.positions.filter((entry: any) => entry.symbol === "LINKUSDT")[0]
    const linkPosition2 = this.accountData2.positions.filter((entry: any) => entry.symbol === "LINKUSDT")[0]

    await this.adjustTheAltHedge(this.accountData1, this.binanceConnector1, batPosition1, "BATUSDT")
    await this.adjustTheAltHedge(this.accountData1, this.binanceConnector1, linkPosition1, "LINKUSDT")

    await this.adjustTheEtherHedge(this.etherPosition1, this.binanceConnector1, this.accountData1)

    await FinancialService.sleep(Math.floor(Math.random() * (200 - 10 + 1) + 10)) // staying undercover

    await this.adjustTheAltHedge(this.accountData2, this.binanceConnector2, batPosition2, "BATUSDT")
    await this.adjustTheAltHedge(this.accountData2, this.binanceConnector2, linkPosition2, "LINKUSDT")
    await this.adjustTheEtherHedge(this.etherPosition2, this.binanceConnector2, this.accountData2)
  }

  private async optimizeBTC1(): Promise<void> {
    if (this.isItAGoodTimeToAddToBTC1()) {
      await this.addToBTC1()
      this.previousAddpnlBTC1 = this.pnlBTC1
    } else if (this.isItAGoodTimeToReduceBTC1()) {
      await this.reduceBTC1()
      this.previousReducepnlBTC1 = this.pnlBTC1
    } else {
      // console.log(`BTC 1 seems to be in a good shape`)
    }
  }

  private async optimizeBTC2(): Promise<void> {
    if (this.isItAGoodTimeToAddToBTC2()) {
      await this.addToBTC2()
      this.previousAddpnlBTC2 = this.pnlBTC2
    } else if (this.isItAGoodTimeToReduceBTC2()) {
      await this.reduceBTC2()
      this.previousReducepnlBTC2 = this.pnlBTC2
    } else {
      // console.log(`BTC 2 seems to be in a good shape`)
    }
  }

  private async openBTC1(): Promise<void> {
    if (Number(this.bitcoinPosition1.positionAmt) === 0) {
      await this.binanceConnector1.buyFuture("BTCUSDT", this.minimumBTCAtRisk)
    }
  }

  private async openBTC2(): Promise<void> {
    if (Number(this.bitcoinPosition2.positionAmt) === 0) {
      await this.binanceConnector2.sellFuture("BTCUSDT", this.minimumBTCAtRisk)
    }
  }

  private async addToBTC1(): Promise<void> {
    console.log("Adding to BTC1.")
    await this.binanceConnector1.buyFuture("BTCUSDT", this.minimumBTCAtRisk)
  }

  private async addToBTC2(): Promise<void> {
    console.log("Adding to BTC2.")
    await this.binanceConnector2.sellFuture("BTCUSDT", this.minimumBTCAtRisk)
  }

  private async reduceBTC1(): Promise<void> {
    console.log(
      `Yay you just realized some of the ${this.pnlBTC1}% profit from BTC1 --> reducing BTC1.`,
    )
    await this.binanceConnector1.sellFuture("BTCUSDT", this.tradingUnit)
  }

  private async reduceBTC2(): Promise<void> {
    console.log(
      `Yay you just realized some of the ${this.pnlBTC2}% profit from BTC2 --> reducing BTC2.`,
    )
    await this.binanceConnector2.buyFuture("BTCUSDT", this.tradingUnit)
  }

  private async startTheGame(): Promise<void> {
    console.log("starting the game")

    await this.openBTC1()
    await FinancialService.sleep(Math.floor(Math.random() * (200 - 10 + 1) + 10)) // staying undercover
    await this.openBTC2()
  }

  private async collectData(): Promise<void> {
    // this.totalAccount1 = await this.binanceConnector1.getTotalAccount()
    // console.log(JSON.stringify(this.totalAccount1).substr(0, 250))
    this.accountData1 = await this.binanceConnector1.getFuturesAccountData()
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

    this.bitcoinPosition1 = this.accountData1.positions.filter((entry: any) => entry.symbol === "BTCUSDT")[0]
    this.bitcoinPosition2 = this.accountData2.positions.filter((entry: any) => entry.symbol === "BTCUSDT")[0]

    this.pnlBTC1 = (Number(this.bitcoinPosition1.unrealizedProfit) * 100) / Number(this.bitcoinPosition1.initialMargin)
    this.pnlBTC2 = (Number(this.bitcoinPosition2.unrealizedProfit) * 100) / Number(this.bitcoinPosition2.initialMargin)

    if (!(this.pnlBTC1 < 1000000000)) { this.pnlBTC1 = 0 }
    if (!(this.pnlBTC2 < 1000000000)) { this.pnlBTC2 = 0 }

    this.closingAt = Math.floor(Math.random() * (27 - 18 + 1) + 18)

    this.addingAt = Math.floor(Math.random() * (27 - 18 + 1) + 18) * -1

    this.totalUnrealizedProfitInPercent1 = (Number(this.accountData1.totalUnrealizedProfit) * 100) / Number(this.accountData2.totalWalletBalance)
    this.totalUnrealizedProfitInPercent2 = (Number(this.accountData2.totalUnrealizedProfit) * 100) / Number(this.accountData2.totalWalletBalance)
    this.totalUnrealizedProfitInPercent = this.totalUnrealizedProfitInPercent1 + this.totalUnrealizedProfitInPercent2

    // this.accountMode1 = this.getAccountMode(this.accountData1)
    // this.accountMode2 = this.getAccountMode(this.accountData2)

    this.etherPosition1 = this.accountData1.positions.filter((entry: any) => entry.symbol === "ETHUSDT")[0]
    this.etherPosition2 = this.accountData2.positions.filter((entry: any) => entry.symbol === "ETHUSDT")[0]

    this.usdtSpotAccount1 = Number(await this.binanceConnector1.getUSDTBalance())
    this.bnbSpotAccount1 = Number(await this.binanceConnector1.getSpotBalance("BNB"))

    this.usdtSpotAccount2 = Number(await this.binanceConnector2.getUSDTBalance())
    this.bnbSpotAccount2 = Number(
      await this.binanceConnector2.getSpotBalance("BNB"))

    console.log(`startBalUnderRisk: ${this.startBalanceUnderRisk} - balUnderRisk: ${this.balanceUnderRisk} - addingAt: ${this.addingAt} - closingAt: ${this.closingAt}`)

    console.log(`\nPNL: ${this.totalUnrealizedProfitInPercent} - PNL1: ${this.totalUnrealizedProfitInPercent1} - PNL2: ${this.totalUnrealizedProfitInPercent2} - pnlBTC1: ${this.pnlBTC1} - pnlBTC2: ${this.pnlBTC2} \n`)
  }

  private isItAGoodTimeToAddToBTC1(): boolean {
    const marginRatio1 = (Number(this.accountData1.totalMaintMargin) * 100) /
      Number(this.accountData1.totalMarginBalance)

    if (this.pnlBTC1 < this.previousAddpnlBTC1 || this.pnlBTC1 < this.addingAt || this.pnlBTC1 > 100) {
      if (marginRatio1 < 18) {
        return true
      }
      if (marginRatio1 > 27 && marginRatio1 < 36) {
        return true
      }

      // console.log(`the margin ratio on account 1 is too high to add to BTC 1`)

      return false

    }

    // console.log(`the time is not right to add to BTC 1`)
    return false

  }

  private isItAGoodTimeToReduceBTC1(): boolean {
    const accountMode = FinancialService.getAccountMode(this.accountData1)
    if (this.pnlBTC1 > this.previousReducepnlBTC1 || (this.pnlBTC1 > this.closingAt && accountMode === "long")) {
      if (this.minimumBTCAtRisk < this.bitcoinPosition1.positionAmt) {
        return true
      }

      // console.log(`the minimum BTC at risk (${this.minimumBTCAtRisk}) has been reached on account 1 - positionAmt BTC1 being: ${this.bitcoinPosition1.positionAmt}`)
      return false

    }

    // console.log(`the time is not right to reduce BTC 1`)
    return false

  }

  private isItAGoodTimeToAddToBTC2(): boolean {
    const marginRatio2 = (Number(this.accountData2.totalMaintMargin) * 100) /
      Number(this.accountData2.totalMarginBalance)

    if (
      this.pnlBTC2 < this.previousAddpnlBTC2 ||
      this.pnlBTC2 < this.addingAt ||
      this.pnlBTC1 > 100
    ) {
      if (marginRatio2 < 18) {
        return true
      }

      if (marginRatio2 > 27 && marginRatio2 < 36) {
        return true
      }

      // console.log(`the margin ratio on account 2 is too high to add to BTC2`)
      return false

    }

    // console.log(`the time is not right to add to BTC2`)
    return false

  }

  private isItAGoodTimeToReduceBTC2(): boolean {
    const accountMode = FinancialService.getAccountMode(this.accountData2)

    if (this.pnlBTC2 > this.previousReducepnlBTC2 || (this.pnlBTC2 > this.closingAt && accountMode === "long")) {
      if (this.bitcoinPosition2.positionAmt < this.minimumBTCAtRisk * -1) {
        return true
      }

      // console.log(`the minimum BTC at risk has been reached on account 2`)
      return false

    }

    // console.log(`the time is not right to reduce BTC 2`)
    return false

  }

  // private getNumberOfOpenPositions(): number {
  //   let counter = 0

  //   if (Number(this.bitcoinPosition1.positionAmt) > 0) { counter += 1 }
  //   if (Number(this.bitcoinPosition2.positionAmt) < 0) { counter += 1 }

  //   return counter
  // }

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

const twoAccountsExploit = new TwoAccountsExploit(binanceConnectorAccount1, binanceConnectorAccount2)
twoAccountsExploit.playWithTheForce()
