
import { BinanceConnector } from "../../binance/binance-connector"


export class TwoAccountsExploit {

    private accountData1: any
    private accountData2: any

    private marginRatio1 = 0
    private marginRatio2 = 0

    private bitcoinPosition1: any
    private bitcoinPosition2: any

    private dogePosition1: any
    private dogePosition2: any

    private pnlBTC1 = 0
    private pnlBTC2 = 0

    private pnlDOGE1 = 0
    private pnlDOGE2 = 0

    private bitcoinInvestmentAmount = 0.1
    private dogeInvestmentAmount = 1000

    private closingAt = 0

    private intervalCounter = 0


    public constructor(private readonly binanceConnector1: BinanceConnector, private readonly binanceConnector2: BinanceConnector) {
        this.binanceConnector1 = binanceConnector1
        this.binanceConnector2 = binanceConnector2
    }


    public async playWithTheForce(): Promise<void> {

        setInterval(async () => {

            this.intervalCounter++

            console.log(`\n******************************* Iteration ${this.intervalCounter} *******************************`)


            await this.collectDataForThisIteration()

            console.log(`pnlBTC1: ${this.pnlBTC1} - pnlBTC2: ${this.pnlBTC2} - pnlDOGE1: ${this.pnlDOGE1} - pnlDOGE2: ${this.pnlDOGE2}`)


            await this.manageRisk()


            if (this.marginRatio1 === 0 && this.marginRatio2 === 0) {

                await this.startTheGame()

            } else {

                await this.takeProfitsIfItIsWorthWhile()

            }

            if (this.getNumberOfOpenPositions() < 4 && this.pnlBTC1 + this.pnlBTC2 + this.pnlDOGE1 + this.pnlDOGE2 > this.closingAt / 2) {

                await this.closeAllOpenPositions()

            } else if (this.getNumberOfOpenPositions() === 3) {

                await this.handle3OpenPositions()

            } else if (this.getNumberOfOpenPositions() === 2) {

                await this.handle2OpenPositions()

            } else if (this.getNumberOfOpenPositions() === 1) {

                await this.handle1OpenPosition()

            }

        }, 11 * 1000)

    }


    private async handle1OpenPosition(): Promise<void> {
        if (this.pnlBTC1 > 0) {
            await this.closeBTC1()
        } else if (this.pnlBTC1 < - 100) {
            await this.openOrAddToBTC1()
        } else if (this.pnlBTC2 > 0) {
            await this.closeBTC2()
        } else if (this.pnlBTC2 < - 100) {
            await this.openOrAddToBTC2()
        } else if (this.pnlDOGE1 > 0) {
            await this.closeDOGE1()
        } else if (this.pnlDOGE1 < - 100) {
            await this.openOrAddToDOGE1()
        } else if (this.pnlDOGE2 > 0) {
            await this.closeDOGE2()
        } else if (this.pnlDOGE2 < - 100) {
            await this.openOrAddToDOGE2()
        }
    }

    private async handle2OpenPositions(): Promise<void> {

        if (this.pnlBTC1 > this.closingAt / 3) {

            await this.closeBTC1()

        } else if (this.isLowestPNL(this.pnlBTC1) && this.pnlBTC1 < - 100) {

            await this.openOrAddToBTC1()

        } else if (this.pnlDOGE1 > this.closingAt / 3) {

            await this.closeDOGE1()

        } else if (this.isLowestPNL(this.pnlDOGE1) && this.pnlDOGE1 < - 100) {

            await this.openOrAddToDOGE1()

        } else if (this.pnlBTC2 > this.closingAt / 3) {

            await this.closeBTC2()

        } else if (this.isLowestPNL(this.pnlBTC2) && this.pnlBTC2 < - 100) {

            await this.openOrAddToBTC2()

        } else if (this.pnlDOGE2 > this.closingAt / 3) {

            await this.closeDOGE2()

        } else if (this.isLowestPNL(this.pnlDOGE2) && this.pnlDOGE2 < - 100) {

            await this.openOrAddToDOGE2()

        }

    }
    private async handle3OpenPositions(): Promise<void> {

        if (this.isHighestPNL(this.pnlBTC1) && this.pnlBTC1 > this.closingAt / 2) {

            await this.closeBTC1()

        } else if (this.isHighestPNL(this.pnlDOGE1) && this.pnlDOGE1 > this.closingAt / 2) {

            await this.closeDOGE1()

        } else if (this.isHighestPNL(this.pnlBTC2) && this.pnlBTC2 > this.closingAt / 2) {

            await this.closeBTC2()

        } else if (this.isHighestPNL(this.pnlDOGE2) && this.pnlDOGE2 > this.closingAt / 2) {

            await this.closeDOGE2()
        }

    }
    private isLowestPNL(pnlUnderObservation: number): boolean {

        if (pnlUnderObservation <= this.pnlBTC1 &&
            pnlUnderObservation <= this.pnlBTC2 &&
            pnlUnderObservation <= this.pnlDOGE1 &&
            pnlUnderObservation <= this.pnlDOGE2) {
            return true
        }

        return false
    }

    private isHighestPNL(pnlUnderObservation: number): boolean {

        if (pnlUnderObservation >= this.pnlBTC1 &&
            pnlUnderObservation >= this.pnlBTC2 &&
            pnlUnderObservation >= this.pnlDOGE1 &&
            pnlUnderObservation >= this.pnlDOGE2) {
            return true
        }

        return false
    }

    private async takeProfitsIfItIsWorthWhile(): Promise<void> {
        if (this.pnlBTC1 + this.pnlBTC2 + this.pnlDOGE1 + this.pnlDOGE2 > this.closingAt) {
            console.log(`Yay you just made more than ${this.closingAt}% profit. I'll sell them all.`)
            await this.closeAllOpenPositions()
        } else if (this.pnlBTC1 > this.closingAt) {
            await this.closeBTC1()
            console.log(`Yay you just made more than ${this.closingAt}% profit from BTC1. I'll sell it`)
        } else if (this.pnlBTC2 > this.closingAt) {
            await this.closeBTC2()
            console.log(`Yay you just made more than ${this.closingAt}% profit from BTC2. I'll buy back its short sold BTC`)
        } else if (this.pnlDOGE1 > this.closingAt) {
            console.log(`Yay you just made more than ${this.closingAt}% profit from DOGE1. I'll buy back its short sold DOGE`)
            await this.closeDOGE1()
        } else if (this.pnlDOGE2 > this.closingAt) {
            console.log(`Yay you just made more than ${this.closingAt}% profit from DOGE2. I'll sell it`)
            await this.closeDOGE2()
        }
    }

    private async openOrAddToBTC1(): Promise<void> {
        await this.binanceConnector1.buyFuture('BTCUSDT', this.bitcoinInvestmentAmount)
    }

    private async closeBTC1(): Promise<void> {
        await this.binanceConnector1.sellFuture('BTCUSDT', this.bitcoinPosition1.positionAmt)
    }

    private async openOrAddToBTC2(): Promise<void> {
        await this.binanceConnector2.sellFuture('BTCUSDT', this.bitcoinInvestmentAmount)
    }

    private async closeBTC2(): Promise<void> {
        await this.binanceConnector2.buyFuture('BTCUSDT', this.bitcoinPosition2.positionAmt * -1)
    }

    private async openOrAddToDOGE1(): Promise<void> {
        await this.binanceConnector1.sellFuture('DOGEUSDT', this.dogeInvestmentAmount)

    }
    private async closeDOGE1(): Promise<void> {
        await this.binanceConnector1.buyFuture('DOGEUSDT', this.dogePosition1.positionAmt * -1)
    }

    private async openOrAddToDOGE2(): Promise<void> {
        await this.binanceConnector2.buyFuture('DOGEUSDT', this.dogeInvestmentAmount)

    }

    private async closeDOGE2(): Promise<void> {
        await this.binanceConnector2.sellFuture('DOGEUSDT', this.dogePosition2.positionAmt)
    }

    private async startTheGame(): Promise<void> {
        console.log(`starting the game`)

        await this.openOrAddToBTC1()
        await this.openOrAddToBTC2()
        await this.openOrAddToDOGE1()
        await this.openOrAddToDOGE2()
    }

    private async manageRisk(): Promise<void> {
        if (this.marginRatio1 > 45 || this.marginRatio2 > 45) {
            await this.closeAllOpenPositions()
            console.log(`Things went south. I quit in time.`)
        }
    }

    private async collectDataForThisIteration(): Promise<void> {
        this.accountData1 = await this.binanceConnector1.getFuturesAccountData()
        this.accountData2 = await this.binanceConnector2.getFuturesAccountData()

        this.marginRatio1 = Number(this.accountData1.totalMaintMargin) * 100 / Number(this.accountData1.totalMarginBalance)
        this.marginRatio2 = Number(this.accountData2.totalMaintMargin) * 100 / Number(this.accountData2.totalMarginBalance)

        this.closingAt = (Math.floor(Math.random() * (27 - 18 + 1) + 18))

        this.bitcoinPosition1 = this.accountData1.positions.filter((entry: any) => entry.symbol === 'BTCUSDT')[0]
        this.bitcoinPosition2 = this.accountData2.positions.filter((entry: any) => entry.symbol === 'BTCUSDT')[0]

        this.dogePosition1 = this.accountData1.positions.filter((entry: any) => entry.symbol === 'DOGEUSDT')[0]
        this.dogePosition2 = this.accountData2.positions.filter((entry: any) => entry.symbol === 'DOGEUSDT')[0]

        this.pnlBTC1 = (Number(this.bitcoinPosition1.unrealizedProfit) * 100 / Number(this.bitcoinPosition1.initialMargin))
        this.pnlBTC2 = (Number(this.bitcoinPosition2.unrealizedProfit) * 100 / Number(this.bitcoinPosition2.initialMargin))

        this.pnlDOGE1 = (Number(this.dogePosition1.unrealizedProfit) * 100 / Number(this.dogePosition1.initialMargin))
        this.pnlDOGE2 = (Number(this.dogePosition2.unrealizedProfit) * 100 / Number(this.dogePosition2.initialMargin))

        if (this.pnlBTC1 === undefined) this.pnlBTC1 = 0
        if (this.pnlBTC2 === undefined) this.pnlBTC2 = 0
        if (this.pnlDOGE1 === undefined) this.pnlDOGE1 = 0
        if (this.pnlDOGE2 === undefined) this.pnlDOGE2 = 0

    }

    private getNumberOfOpenPositions(): number {
        let counter = 0

        if (Number(this.bitcoinPosition1.positionAmt > 0)) counter++
        if (Number(this.bitcoinPosition2.positionAmt < 0)) counter++
        if (Number(this.dogePosition1.positionAmt < 0)) counter++
        if (Number(this.dogePosition2.positionAmt > 0)) counter++

        return counter
    }

    private async closeAllOpenPositions(): Promise<void> {

        if (Number(this.bitcoinPosition1.positionAmt > 0)) {
            await this.closeBTC1()
        }

        if (Number(this.dogePosition1.positionAmt < 0)) {
            await this.closeDOGE1()
        }

        if (Number(this.bitcoinPosition2.positionAmt < 0)) {
            await this.closeBTC2()
        }

        if (Number(this.dogePosition2.positionAmt > 0)) {
            await this.closeDOGE2()
        }
    }

}


const binanceApiKey1 = process.argv[2]
const binanceApiSecret1 = process.argv[3]
const binanceApiKey2 = process.argv[3]
const binanceApiSecret2 = process.argv[4]

let binanceConnectorAccount1 = new BinanceConnector(binanceApiKey1, binanceApiSecret1)
let binanceConnectorAccount2 = new BinanceConnector(binanceApiKey2, binanceApiSecret2)

// let cryptometerConnector = new CryptoMeterConnector(cryptoMeterAPIKey)

const twoAccountsExploit = new TwoAccountsExploit(binanceConnectorAccount1, binanceConnectorAccount2)
twoAccountsExploit.playWithTheForce()