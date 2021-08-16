
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

    private bitcoinInvestmentAmount = 0.01
    private dogeInvestmentAmount = 100

    private closingAt = 0

    private addingAt = 0

    private iterationCounter = 0

    private startBalanceUnderRisk = 0
    private currentBalanceUnderRisk = 0
    private securedGains = 0


    public constructor(private readonly binanceConnector1: BinanceConnector, private readonly binanceConnector2: BinanceConnector) {
        this.binanceConnector1 = binanceConnector1
        this.binanceConnector2 = binanceConnector2
    }


    public async playWithTheForce(): Promise<void> {

        setInterval(async () => {

            this.iterationCounter++

            console.log(`\n******************************* Iteration ${this.iterationCounter} *******************************`)

            await this.collectData()

            await this.manageRisk()

            await this.playTheGame()

        }, 11 * 1000)

    }


    private async playTheGame(): Promise<void> {

        if (this.marginRatio1 === 0 && this.marginRatio2 === 0) {

            await this.startTheGame()

        } else {

            console.log(`I optimize ${this.getNumberOfOpenPositions()} open positions`)

            await this.optimizePositions()

        }
    }


    private async optimizePositions(): Promise<void> {

        if (this.pnlBTC1 + this.pnlBTC2 + this.pnlDOGE1 + this.pnlDOGE2 > this.closingAt) {

            await this.closeAllOpenPositions()

        } else if (this.pnlBTC1 > this.closingAt) {

            await this.closeBTC1()

        } else if (this.pnlBTC2 > this.closingAt) {

            await this.closeBTC2()

        } else if (this.pnlDOGE1 > this.closingAt) {

            await this.closeDOGE1()

        } else if (this.pnlDOGE2 > this.closingAt) {

            await this.closeDOGE2()

        } else {

            await this.accelerate()

        }

    }

    private async accelerate() {

        if (this.isLowestPNL(this.pnlBTC1) && this.pnlBTC1 < this.addingAt) {

            await this.addToBTC1()

        } else if (this.isLowestPNL(this.pnlDOGE1) && this.pnlDOGE1 < this.addingAt) {

            await this.addToDOGE1()

        } else if (this.isLowestPNL(this.pnlBTC2) && this.pnlBTC2 < this.addingAt) {

            await this.addToBTC2()

        } else if (this.isLowestPNL(this.pnlDOGE2) && this.pnlDOGE2 < this.addingAt) {

            await this.addToDOGE2()

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

    private async openBTC1(): Promise<void> {
        await this.binanceConnector1.buyFuture('BTCUSDT', this.bitcoinInvestmentAmount)
    }

    private async addToBTC1(): Promise<void> {
        await this.binanceConnector1.buyFuture('BTCUSDT', this.bitcoinPosition1.positionAmt)
    }

    private async closeBTC1(): Promise<void> {

        if (this.pnlBTC1 > 0) {
            console.log(`Yay you just made ${this.pnlBTC1}% profit from BTC1.`)
        }

        await this.binanceConnector1.sellFuture('BTCUSDT', this.bitcoinPosition1.positionAmt)
        await this.binanceConnector1.transferFromUSDTFuturesToSpotAccount(1)
    }

    private async openBTC2(): Promise<void> {
        await this.binanceConnector2.sellFuture('BTCUSDT', this.bitcoinInvestmentAmount)
    }

    private async addToBTC2(): Promise<void> {
        await this.binanceConnector2.sellFuture('BTCUSDT', this.bitcoinPosition2.positionAmt * -1)
    }

    private async closeBTC2(): Promise<void> {

        if (this.pnlBTC2 > 0) {
            console.log(`Yay you just made ${this.pnlBTC2}% profit from BTC2.`)
        }

        await this.binanceConnector2.buyFuture('BTCUSDT', this.bitcoinPosition2.positionAmt * -1)
        await this.binanceConnector2.transferFromUSDTFuturesToSpotAccount(1)
    }

    private async openDOGE1(): Promise<void> {
        await this.binanceConnector1.sellFuture('DOGEUSDT', this.dogeInvestmentAmount)
    }

    private async addToDOGE1(): Promise<void> {
        await this.binanceConnector1.sellFuture('DOGEUSDT', this.dogePosition1.positionAmt * -1)
    }

    private async closeDOGE1(): Promise<void> {

        if (this.pnlDOGE1 > 0) {
            console.log(`Yay you just made ${this.pnlDOGE1}% profit from DOGE1.`)
        }

        await this.binanceConnector1.buyFuture('DOGEUSDT', this.dogePosition1.positionAmt * -1)
    }

    private async openDOGE2(): Promise<void> {
        await this.binanceConnector2.buyFuture('DOGEUSDT', this.dogeInvestmentAmount)
    }

    private async addToDOGE2(): Promise<void> {
        await this.binanceConnector2.buyFuture('DOGEUSDT', this.dogePosition2.positionAmt)
    }

    private async closeDOGE2(): Promise<void> {

        if (this.pnlDOGE2 > 0) {
            console.log(`Yay you just made ${this.pnlDOGE2}% profit from DOGE2.`)
        }

        await this.binanceConnector2.sellFuture('DOGEUSDT', this.dogePosition2.positionAmt)
    }

    private async startTheGame(): Promise<void> {
        console.log(`starting the game`)

        await this.openBTC1()
        await this.openDOGE1()
        await this.sleep((Math.floor(Math.random() * (1000 - 100 + 1) + 100))) // staying undercover
        await this.openBTC2()
        await this.openDOGE2()
    }

    private async manageRisk(): Promise<void> {
        if (this.marginRatio1 > 54 || this.marginRatio2 > 54) {
            await this.closeAllOpenPositions()
            console.log(`Things went south. I quit in time.`)
        }
    }

    private async collectData(): Promise<void> {

        this.accountData1 = await this.binanceConnector1.getFuturesAccountData()
        await this.sleep((Math.floor(Math.random() * (1000 - 100 + 1) + 100))) // staying undercover
        this.accountData2 = await this.binanceConnector2.getFuturesAccountData()

        if (this.iterationCounter === 1) {
            this.startBalanceUnderRisk = Number(this.accountData1.totalWalletBalance) + Number(this.accountData2.totalWalletBalance)
        }
        this.currentBalanceUnderRisk = Number(this.accountData1.totalWalletBalance) + Number(this.accountData2.totalWalletBalance) + Number(this.accountData1.totalUnrealizedProfit) + Number(this.accountData2.totalUnrealizedProfit)

        this.marginRatio1 = Number(this.accountData1.totalMaintMargin) * 100 / Number(this.accountData1.totalMarginBalance)
        this.marginRatio2 = Number(this.accountData2.totalMaintMargin) * 100 / Number(this.accountData2.totalMarginBalance)

        this.bitcoinPosition1 = this.accountData1.positions.filter((entry: any) => entry.symbol === 'BTCUSDT')[0]
        this.bitcoinPosition2 = this.accountData2.positions.filter((entry: any) => entry.symbol === 'BTCUSDT')[0]

        this.dogePosition1 = this.accountData1.positions.filter((entry: any) => entry.symbol === 'DOGEUSDT')[0]
        this.dogePosition2 = this.accountData2.positions.filter((entry: any) => entry.symbol === 'DOGEUSDT')[0]

        this.pnlBTC1 = (Number(this.bitcoinPosition1.unrealizedProfit) * 100 / Number(this.bitcoinPosition1.initialMargin))
        this.pnlBTC2 = (Number(this.bitcoinPosition2.unrealizedProfit) * 100 / Number(this.bitcoinPosition2.initialMargin))

        this.pnlDOGE1 = (Number(this.dogePosition1.unrealizedProfit) * 100 / Number(this.dogePosition1.initialMargin))
        this.pnlDOGE2 = (Number(this.dogePosition2.unrealizedProfit) * 100 / Number(this.dogePosition2.initialMargin))

        if (!(this.pnlBTC1 < 1000000000)) this.pnlBTC1 = 0
        if (!(this.pnlBTC2 < 1000000000)) this.pnlBTC2 = 0
        if (!(this.pnlDOGE1 < 1000000000)) this.pnlDOGE1 = 0
        if (!(this.pnlDOGE2 < 1000000000)) this.pnlDOGE2 = 0

        this.closingAt = (Math.floor(Math.random() * (81 - 18 + 1) + 18))

        if (this.getNumberOfOpenPositions() > 0) {
            this.closingAt = (this.closingAt * this.getNumberOfOpenPositions()) / 9
        }

        this.addingAt = ((Math.floor(Math.random() * (81 - 18 + 1) + 18))) * -1

        if (this.getNumberOfOpenPositions() > 0) {
            this.addingAt = this.addingAt / this.getNumberOfOpenPositions() 
        }

        console.log(`startBalUnderRisk: ${this.startBalanceUnderRisk} - balUnderRisk: ${this.currentBalanceUnderRisk} - securedGains: ${this.securedGains} - pnl: ${this.pnlBTC1 + this.pnlBTC2 + this.pnlDOGE1 + this.pnlDOGE2}`)

        console.log(`pnlBTC1: ${this.pnlBTC1} - pnlBTC2: ${this.pnlBTC2} - pnlDOGE1: ${this.pnlDOGE1} - pnlDOGE2: ${this.pnlDOGE2} - addingAt: ${this.addingAt} - closingAt: ${this.closingAt}`)

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

        await this.sleep((Math.floor(Math.random() * (1000 - 100 + 1) + 100))) // staying undercover

        if (Number(this.bitcoinPosition2.positionAmt < 0)) {
            await this.closeBTC2()
        }

        if (Number(this.dogePosition2.positionAmt > 0)) {
            await this.closeDOGE2()
        }
    }

    private sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}


const binanceApiKey1 = process.argv[2]
const binanceApiSecret1 = process.argv[3]
const binanceApiKey2 = process.argv[4]
const binanceApiSecret2 = process.argv[5]

let binanceConnectorAccount1 = new BinanceConnector(binanceApiKey1, binanceApiSecret1)
let binanceConnectorAccount2 = new BinanceConnector(binanceApiKey2, binanceApiSecret2)

// let cryptometerConnector = new CryptoMeterConnector(cryptoMeterAPIKey)

const twoAccountsExploit = new TwoAccountsExploit(binanceConnectorAccount1, binanceConnectorAccount2)
twoAccountsExploit.playWithTheForce()