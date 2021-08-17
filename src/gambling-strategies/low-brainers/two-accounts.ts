
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
    private bitcoinInvestmentAmount = 0.002
    private dogeInvestmentAmount = 20
    private closingAt = 0
    private addingAt = 0
    private iterationCounter = 0
    private startBalanceUnderRisk = 0
    private pauseCounter = 0
    private balanceUnderRisk = 0
    private totalUnrealizedProfitInPercent1 = 0
    private totalUnrealizedProfitInPercent2 = 0
    private totalUnrealizedProfitInPercent = 0
    private failureCount = 0
    private level = 0
    private profitInCurrent4To0Session = 0


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

            if (this.pauseCounter > 0) {

                console.log(`\nI pause as there has been an extreme move by the centralized forces recently - pauseCounter: ${this.pauseCounter}`)

                await this.playTheGame()

            }

        }, 11 * 1000)

    }


    private async playTheGame(): Promise<void> {

        if (this.marginRatio1 === 0 && this.marginRatio2 === 0) {

            await this.startTheGame()

        } else {

            if (this.getNumberOfOpenPositions() === 4 || this.getNumberOfOpenPositions() === 3) {

                this.level = 1

                await this.optimizePositionsLevel1()


            } else if (this.getNumberOfOpenPositions() === 2 && this.level === 1) {

                await this.getRidOfTheSecondWorst()

            } else if (this.getNumberOfOpenPositions() === 1 && this.level === 1) {

                await this.establishAMeanHedge()

                this.level = 2

            } else if (this.getNumberOfOpenPositions() === 2 && this.level === 2) {

                if (await this.couldWeCloseAPosition()) {

                    await this.closeAllOpenPositions()

                }

            } else if (this.getNumberOfOpenPositions() === 1 && this.level === 2 || this.level === 0) {

                console.log(`Hmm - probably even the badest position has a pnl > 0 --> closing`)
                await this.closeAllOpenPositions()

            } else {

                console.log(`Hmm - how can I have ${this.getNumberOfOpenPositions()} and play in level ${this.level}?`)

            }

        }
    }

    private async establishAMeanHedge(): Promise<void> {

        console.log(`I establish a mean hedge if the position which is left has a pnl of < 0`)

        if (this.isLowestPNL(this.pnlBTC1) && this.pnlBTC1 < 0) {
            console.log(`I'll hedge the least successful position --> adding to BTC2.`)
            await this.addToBTC2(Number((this.bitcoinPosition1.positionAmt * 1.1).toFixed(3)))
        }
        if (this.isLowestPNL(this.pnlBTC2) && this.pnlBTC2 < 0) {
            console.log(`I'll hedge the least successful position --> adding to BTC1.`)
            await this.addToBTC1(Number((this.bitcoinPosition2.positionAmt * 1.1).toFixed(3)) * -1)
        }
        if (this.isLowestPNL(this.pnlDOGE1) && this.pnlDOGE1 < 0) {
            console.log(`I'll hedge the least successful position --> adding to DOGE2.`)
            await this.addToDOGE2(Number((this.dogePosition1.positionAmt * 1.1).toFixed(0)) * -1)
        }
        if (this.isLowestPNL(this.pnlDOGE2) && this.pnlDOGE2 < 0) {
            console.log(`I'll hedge the least successful position --> adding to DOGE1.`)
            await this.addToDOGE1(Number((this.dogePosition2.positionAmt * 1.1).toFixed(0)))
        }
    }

    private async getRidOfTheSecondWorst(): Promise<void> {
        if (this.getNumberOfOpenPositions() !== 2) {
            throw new Error("this only works if the number of open positions is 2")
        }

        console.log(`I get rid of the second worst position ${Number(this.bitcoinPosition1.unrealizedProfit)}`)

        if (this.isHighestAbsolute(this.bitcoinPosition1.unrealizedProfit)) {
            console.log(`getting rid of BTC1 as it is the second worst`)
            await this.closeBTC1()
        } else if (this.isHighestAbsolute(this.bitcoinPosition2.unrealizedProfit)) {
            console.log(`getting rid of BTC2 as it is the second worst`)
            await this.closeBTC2()
        } else if (this.isHighestAbsolute(this.dogePosition1.unrealizedProfit)) {
            console.log(`getting rid of DOGE1 as it is the second worst`)
            await this.closeDOGE1()
        } else if (this.isHighestAbsolute(this.dogePosition2.unrealizedProfit)) {
            console.log(`getting rid of DOGE2 as it is the second worst`)
            await this.closeDOGE2()
        }
    }

    private async couldWeCloseAPosition(): Promise<boolean> {
        if (this.totalUnrealizedProfitInPercent > this.closingAt) {

            await this.closeAllOpenPositions()

            return true

        } else if (this.pnlBTC1 > this.closingAt && Number(this.bitcoinPosition1.unrealizedProfit) > Number(this.accountData1.totalWalletBalance) / 20) {

            await this.closeBTC1()
            return true

        } else if (this.pnlBTC2 > this.closingAt && Number(this.bitcoinPosition2.unrealizedProfit) > Number(this.accountData2.totalWalletBalance) / 20) {

            await this.closeBTC2()
            return true

        } else if (this.pnlDOGE1 > this.closingAt && Number(this.dogePosition1.unrealizedProfit) > Number(this.accountData1.totalWalletBalance) / 20) {

            await this.closeDOGE1()
            return true

        } else if (this.pnlDOGE2 > this.closingAt && Number(this.dogePosition2.unrealizedProfit) > Number(this.accountData2.totalWalletBalance) / 20) {

            await this.closeDOGE2()
            return true

        } else {
            return false
        }

    }

    private async optimizePositionsLevel1(): Promise<void> {

        console.log(`\nI optimize ${this.getNumberOfOpenPositions()} open positions on level ${this.level}`)

        if ((await this.couldWeCloseAPosition()) === false) {

            await this.accelerate()

        }


    }



    private async accelerate() {

        if (this.pnlBTC1 < this.addingAt && this.marginRatio1 < 18) {

            await this.addToBTC1(this.bitcoinInvestmentAmount)

        }

        if (this.pnlDOGE1 < this.addingAt && this.marginRatio1 < 18) {

            await this.addToDOGE1(this.dogeInvestmentAmount)

        }

        if (this.pnlBTC2 < this.addingAt && this.marginRatio2 < 18) {

            await this.addToBTC2(this.bitcoinInvestmentAmount)

        }

        if (this.pnlDOGE2 < this.addingAt && this.marginRatio2 < 18) {

            await this.addToDOGE2(this.dogeInvestmentAmount)

        }

    }

    private isLowestAbsolute(absolutPNLUnderObservation: number): boolean {
        if (absolutPNLUnderObservation <= Number(this.bitcoinPosition1.unrealizedProfit) &&
            absolutPNLUnderObservation <= Number(this.bitcoinPosition2.unrealizedProfit) &&
            absolutPNLUnderObservation <= Number(this.dogePosition1.unrealizedProfit) &&
            absolutPNLUnderObservation <= Number(this.dogePosition2.unrealizedProfit)) {
            return true
        }

        return false

    }

    private isHighestAbsolute(absolutPNLUnderObservation: number): boolean {
        if (absolutPNLUnderObservation >= Number(this.bitcoinPosition1.unrealizedProfit) &&
            absolutPNLUnderObservation >= Number(this.bitcoinPosition2.unrealizedProfit) &&
            absolutPNLUnderObservation >= Number(this.dogePosition1.unrealizedProfit) &&
            absolutPNLUnderObservation >= Number(this.dogePosition2.unrealizedProfit)) {
            return true
        }

        return false

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

    private async addToBTC1(amount: number = this.bitcoinPosition1.positionAmt): Promise<void> {
        console.log(`Adding ${amount} BTC to BTC1.`)
        await this.binanceConnector1.buyFuture('BTCUSDT', amount)
    }

    private async closeBTC1(): Promise<void> {

        if (this.pnlBTC1 > 0) {
            console.log(`Yay you just made ${Number(this.bitcoinPosition1.unrealizedProfit)} (${this.pnlBTC1}%) profit from BTC1.`)
        }

        await this.binanceConnector1.sellFuture('BTCUSDT', this.bitcoinPosition1.positionAmt)
        this.profitInCurrent4To0Session = this.profitInCurrent4To0Session + Number(this.bitcoinPosition1.unrealizedProfit)
    }

    private async openBTC2(): Promise<void> {
        await this.binanceConnector2.sellFuture('BTCUSDT', this.bitcoinInvestmentAmount)
    }

    private async addToBTC2(amount: number = this.bitcoinPosition2.positionAmt * -1): Promise<void> {
        console.log(`Adding ${amount} BTC to BTC2.`)
        await this.binanceConnector2.sellFuture('BTCUSDT', amount)
    }

    private async closeBTC2(): Promise<void> {

        if (this.pnlBTC2 > 0) {
            console.log(`Yay you just made ${Number(this.bitcoinPosition2.unrealizedProfit)} (${this.pnlBTC2}%) profit from BTC2.`)
        }

        await this.binanceConnector2.buyFuture('BTCUSDT', this.bitcoinPosition2.positionAmt * -1)
        this.profitInCurrent4To0Session = this.profitInCurrent4To0Session + Number(this.bitcoinPosition2.unrealizedProfit)
    }

    private async openDOGE1(): Promise<void> {
        await this.binanceConnector1.sellFuture('DOGEUSDT', this.dogeInvestmentAmount)
    }

    private async addToDOGE1(amount: number = this.dogePosition1.positionAmt * -1): Promise<void> {
        console.log(`Adding ${amount} DOGE to DOGE1.`)
        await this.binanceConnector1.sellFuture('DOGEUSDT', amount)
    }

    private async closeDOGE1(): Promise<void> {

        if (this.pnlDOGE1 > 0) {
            console.log(`Yay you just made ${Number(this.dogePosition1.unrealizedProfit)} (${this.pnlDOGE1}%) profit from DOGE1.`)
        }

        await this.binanceConnector1.buyFuture('DOGEUSDT', this.dogePosition1.positionAmt * -1)
        this.profitInCurrent4To0Session = this.profitInCurrent4To0Session + Number(this.dogePosition1.unrealizedProfit)

    }

    private async openDOGE2(): Promise<void> {
        await this.binanceConnector2.buyFuture('DOGEUSDT', this.dogeInvestmentAmount)
    }

    private async addToDOGE2(amount: number = this.dogePosition2.positionAmt): Promise<void> {
        console.log(`Adding ${amount} DOGE to DOGE2.`)
        await this.binanceConnector2.buyFuture('DOGEUSDT', amount)
    }

    private async closeDOGE2(): Promise<void> {

        if (this.pnlDOGE2 > 0) {
            console.log(`Yay you just made ${Number(this.dogePosition2.unrealizedProfit)} (${this.pnlDOGE2}%) profit from DOGE2.`)
        }

        await this.binanceConnector2.sellFuture('DOGEUSDT', this.dogePosition2.positionAmt)
        this.profitInCurrent4To0Session = this.profitInCurrent4To0Session + Number(this.dogePosition2.unrealizedProfit)
    }

    private async startTheGame(): Promise<void> {
        console.log(`starting the game`)

        await this.openBTC1()
        await this.openDOGE1()
        await this.sleep((Math.floor(Math.random() * (200 - 10 + 1) + 10))) // staying undercover
        await this.openBTC2()
        await this.openDOGE2()
    }

    private async manageRisk(): Promise<void> {

        const maximumLossInOnePositionIndicatingExtremeManipulation = -100

        if (this.marginRatio1 > 54 || this.marginRatio2 > 54) {
            await this.closeAllOpenPositions()
            console.log(`According to a margin ratio, things went south. I quit in time.`)
            this.pauseCounter = 100
            this.failureCount++
        } else if (this.pnlBTC1 < maximumLossInOnePositionIndicatingExtremeManipulation ||
            this.pnlBTC2 < maximumLossInOnePositionIndicatingExtremeManipulation ||
            this.pnlDOGE1 < maximumLossInOnePositionIndicatingExtremeManipulation ||
            this.pnlDOGE2 < maximumLossInOnePositionIndicatingExtremeManipulation) {
            await this.closeAllOpenPositions()
            console.log(`According to an extreme loss in one position, things went south. I quit in time.`)
            this.pauseCounter = 100
            this.failureCount++
        } else if (this.pauseCounter > 0) {
            this.pauseCounter--
        }

    }

    private async collectData(): Promise<void> {

        this.accountData1 = await this.binanceConnector1.getFuturesAccountData()
        await this.sleep((Math.floor(Math.random() * (200 - 10 + 1) + 10))) // staying undercover
        this.accountData2 = await this.binanceConnector2.getFuturesAccountData()

        if (this.iterationCounter === 1) {
            this.startBalanceUnderRisk = Number(this.accountData1.totalWalletBalance) + Number(this.accountData2.totalWalletBalance) + Number(this.accountData2.totalUnrealizedProfit)
        }

        this.balanceUnderRisk = Number(this.accountData1.totalWalletBalance) + Number(this.accountData2.totalWalletBalance) + Number(this.accountData1.totalUnrealizedProfit) + Number(this.accountData2.totalUnrealizedProfit)

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
            this.closingAt = (this.closingAt * this.getNumberOfOpenPositions()) / 3
        }

        this.addingAt = ((Math.floor(Math.random() * (36 - 18 + 1) + 18))) * -1

        if (this.getNumberOfOpenPositions() > 0) {
            this.addingAt = this.addingAt / this.getNumberOfOpenPositions()
        }

        this.totalUnrealizedProfitInPercent1 = (Number(this.accountData1.totalUnrealizedProfit) * 100 / Number(this.accountData1.totalWalletBalance))
        this.totalUnrealizedProfitInPercent2 = (Number(this.accountData2.totalUnrealizedProfit) * 100 / Number(this.accountData2.totalWalletBalance))
        this.totalUnrealizedProfitInPercent = this.totalUnrealizedProfitInPercent1 + this.totalUnrealizedProfitInPercent2

        console.log(`startBalUnderRisk: ${this.startBalanceUnderRisk} - balUnderRisk: ${this.balanceUnderRisk} - failureCount: ${this.failureCount} - addingAt: ${this.addingAt} - closingAt: ${this.closingAt} - profitInCurrent4To0Session: ${this.profitInCurrent4To0Session}`)

        console.log(`\nPNL: ${this.totalUnrealizedProfitInPercent} - PNL1: ${this.totalUnrealizedProfitInPercent1} - PNL2: ${this.totalUnrealizedProfitInPercent2} - pnlBTC1: ${this.pnlBTC1} - pnlBTC2: ${this.pnlBTC2} - pnlDOGE1: ${this.pnlDOGE1} - pnlDOGE2: ${this.pnlDOGE2}`)

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

        await this.sellAllLongPositions(this.accountData1, this.binanceConnector1)
        await this.buyBackAllShortPositions(this.accountData1, this.binanceConnector1)
        await this.sleep((Math.floor(Math.random() * (100 - 10 + 1) + 10))) // staying undercover
        await this.sellAllLongPositions(this.accountData2, this.binanceConnector2)
        await this.buyBackAllShortPositions(this.accountData2, this.binanceConnector2)

        this.profitInCurrent4To0Session = 0

    }

    private async sellAllLongPositions(accountData: any, binanceConnector: any) {
        for (let position of accountData.positions) {
            if (position.positionAmt > 0) {
                console.log(`selling ${position.symbol}`)
                await binanceConnector.sellFuture(position.symbol, Number(position.positionAmt))
            }
        }
    }

    private async buyBackAllShortPositions(accountData: any, binanceConnector: any) {
        for (let position of accountData.positions) {
            if (position.positionAmt < 0) {
                console.log(`buying back shorted ${position.symbol}`)
                await binanceConnector.buyFuture(position.symbol, Number(position.positionAmt) * -1)
            }
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