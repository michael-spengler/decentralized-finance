
import { exit } from "process"
import { BinanceConnector } from "../../binance/binance-connector"
import { Converter } from "../utilities/converter"

export class TwoAccountsExploit {

    private accountData1: any
    private accountData2: any
    private marginRatio1 = 0
    private marginRatio2 = 0
    private bitcoinPosition1: any
    private bitcoinPosition2: any
    private etherPosition1: any
    private etherPosition2: any
    private pnlBTC1 = 0
    private pnlBTC2 = 0
    private accountMode1 = ''
    private accountMode2 = ''
    private previousAddpnlBTC1 = 0
    private previousAddpnlBTC2 = 0
    private previousReducepnlBTC1 = 0
    private previousReducepnlBTC2 = 0
    private tradingUnit = 0.001
    private minimumBTCAtRisk = 0.009
    private closingAt = 0
    private addingAt = 0
    private iterationCounter = 0
    private startBalanceUnderRisk = 0
    private pauseCounter = 0
    private balanceUnderRisk = 0
    private totalUnrealizedProfitInPercent1 = 0
    private totalUnrealizedProfitInPercent2 = 0
    private totalUnrealizedProfitInPercent = 0
    private marginDeltaAccount1 = 0
    private marginDeltaAccount2 = 0
    private usdtSpotAccount1 = 0
    private bnbSpotAccount1 = 0
    private usdtSpotAccount2 = 0
    private bnbSpotAccount2 = 0

    public constructor(private readonly binanceConnector1: BinanceConnector, private readonly binanceConnector2: BinanceConnector) {
        this.binanceConnector1 = binanceConnector1
        this.binanceConnector2 = binanceConnector2
    }


    public async playWithTheForce(): Promise<void> {

        setInterval(async () => {

            this.iterationCounter++

            console.log(`\n******************************* Iteration ${this.iterationCounter} *******************************`)

            await this.collectData()

            await this.playTheGame()

        }, 9 * 999)

    }


    private async playTheGame(): Promise<void> {


        if (this.iterationCounter === 1) {

            await this.cleanTheDeskIfNecessary(true)

        } else if (this.iterationCounter === 2) {

            await this.startTheGame()

        } else {

            await this.cleanTheDeskIfNecessary()

            await this.optimizeValueAtRiskOnAccount1()
            await this.optimizeValueAtRiskOnAccount2()

            await this.optimizeBTC1()
            await this.optimizeBTC2()

            await this.enjoyThePerfectHedges()
        }

    }



    private async cleanTheDeskIfNecessary(forceIt: boolean = false): Promise<void> {
        if (this.marginRatio1 > 83 && this.bnbSpotAccount1 < 0.1 && this.usdtSpotAccount1 < 10) {
            console.log(`I close all positions of account 1 because the strategy did not work well this time - marginRatio1: ${this.marginRatio1}`)
            await this.closeAllOpenPositions(this.accountData1, this.binanceConnector1)
        }

        if (this.marginRatio2 > 83 && this.bnbSpotAccount2 < 0.1 && this.usdtSpotAccount2 < 10) {
            console.log(`I close all positions of account 2 because the strategy did not work well this time - marginRatio2: ${this.marginRatio2}`)
            await this.closeAllOpenPositions(this.accountData2, this.binanceConnector2)
        }

        if (forceIt) {

            console.log(`I close all positions as I was forced to do so.`)
            await this.closeAllOpenPositions(this.accountData1, this.binanceConnector1)

            await this.sleep((Math.floor(Math.random() * (200 - 10 + 1) + 10))) // staying undercover

            await this.closeAllOpenPositions(this.accountData2, this.binanceConnector2)

        }
    }

    private async adjustTheEtherHedge(): Promise<void> {


        const ether1PNLInPercent = (this.etherPosition1.unrealizedProfit * 100) / this.etherPosition1.initialMargin

        if (this.marginRatio1 < 9 && Number(this.bitcoinPosition1.positionAmt) < 30 && Number(this.etherPosition1.positionAmt) < 2 || Number(this.etherPosition1.positionAmt > - 0.01)) {
            console.log(`I short sell 0.01 Ether for account 1`)
            await this.binanceConnector1.sellFuture('ETHUSDT', 0.01)
        } else if (ether1PNLInPercent > this.closingAt && Number(this.etherPosition1.positionAmt) < - 0.01) {
            console.log(`I buy back 0.01 short sold Ether for account 1`)
            await this.binanceConnector1.buyFuture('ETHUSDT', 0.01)
        } else {
            // console.log(`I leave the ether 1 position as it is`)
        }


        const ether2PNLInPercent = (this.etherPosition2.unrealizedProfit * 100) / this.etherPosition2.initialMargin


        if (this.marginRatio2 < 9 && Number(this.bitcoinPosition2.positionAmt) > -30 && Number(this.etherPosition2.positionAmt) < 2 || Number(this.etherPosition2.positionAmt < 0.01)) {
            console.log(`I buy 0.01 Ether for account 2`)
            await this.binanceConnector2.buyFuture('ETHUSDT', 0.01)
        } else if (ether2PNLInPercent > this.closingAt && Number(this.etherPosition2.positionAmt) > 0.01) {
            console.log(`I sell 0.01 Ether from account 2`)
            await this.binanceConnector2.sellFuture('ETHUSDT', 0.01)
        } else {
            // console.log(`I leave the ether 2 position as it is`)
        }
    }

    private async adjustTheAltHedge(accountData: any, binanceConnector: any, position: any, accountMode: string, marginRatio: number, pair: string): Promise<void> {
        const initialMarginOfPosition = Number(position.initialMargin)
        const marginDelta = this.getInitialMarginDelta(accountData)

        let pnlInPercent = (position.unrealizedProfit * 100) / position.initialMargin

        if (pnlInPercent > 1000000000) {
            pnlInPercent = 0
        }

        let limit = 100
        let hedgeUnit = 3
        switch (pair) {
            case 'LINKUSDT': {
                limit = 200
                hedgeUnit = 3
                break
            }
            case 'BATUSDT': {
                limit = 1200
                hedgeUnit = 9
                break
            }
            default: {
                limit = 100
                hedgeUnit = 6
            }
        }

        // console.log(`pair: ${pair} - marginRatio: ${marginRatio} - mdA: ${marginDelta} - vs. iMPosition: ${iMPosition}`)
        // console.log(`marginDelta: ${marginDelta} - initialMarginOfPosition: ${initialMarginOfPosition} - pair: ${pair} - hedgeUnit: ${hedgeUnit}`)

        if (pnlInPercent > this.closingAt && (Number(position.positionAmt) !== 9 && Number(position.positionAmt) !== - 9)) {
            if (Number(position.positionAmt > 9)) {

                console.log(`selling some ${pair} to realize some of the profits (${position.unrealizedProfit})`)
                await binanceConnector.sellFuture(pair, hedgeUnit)
            }

            if (pnlInPercent > this.closingAt && Number(position.positionAmt < - 9)) {
                console.log(`buying back some short sold ${pair} to realize some of the profits (${position.unrealizedProfit})`)
                await binanceConnector.buyFuture(pair, hedgeUnit)
            }
        } else {

            if (accountMode === 'long') {

                if (((Number(position.positionAmt) < 9 || (marginDelta / 3) > initialMarginOfPosition)) &&
                    (marginRatio < 45 && Number(position.positionAmt) > limit * -1)) {

                    console.log(`short selling ${pair} to protect a long account - limit would be: ${limit}`)
                    await binanceConnector.sellFuture(pair, hedgeUnit)
                }

            } else if (accountMode === 'short') {
                if (((Number(position.positionAmt) < 9 || (marginDelta / 3) > initialMarginOfPosition)) &&
                    marginRatio < 45 && Number(position.positionAmt) < limit) {

                    console.log(`buying ${pair} to protect a short account - limit would be: ${limit}`)
                    await binanceConnector.buyFuture(pair, hedgeUnit)

                }
            }

        }
    }

    private async enjoyThePerfectHedges(): Promise<void> {

        await this.adjustTheEtherHedge()

        const batPosition1 = this.accountData1.positions.filter((entry: any) => entry.symbol === 'BATUSDT')[0]
        const batPosition2 = this.accountData2.positions.filter((entry: any) => entry.symbol === 'BATUSDT')[0]
        const linkPosition1 = this.accountData1.positions.filter((entry: any) => entry.symbol === 'LINKUSDT')[0]
        const linkPosition2 = this.accountData2.positions.filter((entry: any) => entry.symbol === 'LINKUSDT')[0]

        await this.adjustTheAltHedge(this.accountData1, this.binanceConnector1, batPosition1, this.accountMode1, this.marginRatio1, 'BATUSDT')
        await this.adjustTheAltHedge(this.accountData1, this.binanceConnector1, linkPosition1, this.accountMode1, this.marginRatio1, 'LINKUSDT')

        await this.sleep((Math.floor(Math.random() * (200 - 10 + 1) + 10))) // staying undercover

        await this.adjustTheAltHedge(this.accountData2, this.binanceConnector2, batPosition2, this.accountMode2, this.marginRatio2, 'BATUSDT')
        await this.adjustTheAltHedge(this.accountData2, this.binanceConnector2, linkPosition2, this.accountMode2, this.marginRatio2, 'LINKUSDT')

    }

    private async optimizeValueAtRiskOnAccount1(): Promise<void> {

        console.log(`account 1: usdtSpot: ${this.usdtSpotAccount1} - bnbSpot: ${this.bnbSpotAccount1} - mr: ${this.marginRatio1} - accountMode: ${this.accountMode1} - marginDelta: ${this.marginDeltaAccount1}`)

        if (this.marginRatio1 > 54 && this.usdtSpotAccount1 >= 10) {
            console.log(`I transfer ${10} USDT to the USDT Account 1 due to a margin ratio of ${this.marginRatio1}`)
            await this.binanceConnector1.transferFromSpotAccountToUSDTFutures(10)
            this.pauseCounter = 100
        } else if (this.usdtSpotAccount1 < Number(this.accountData1.totalWalletBalance) / 5 && this.bnbSpotAccount1 > 0.02) {
            const currentPrices = await this.binanceConnector1.getCurrentPrices()

            const currentBNBPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === 'BNBUSDT')[0].price)

            const amountToBeConvertedToUSDT = Number((11 / currentBNBPrice).toFixed(2))

            console.log(amountToBeConvertedToUSDT)
            if (amountToBeConvertedToUSDT > 0.02) {
                console.log(`I convert ${amountToBeConvertedToUSDT} BNB to USDT.`)

                await this.convertToUSDT(this.binanceConnector1, amountToBeConvertedToUSDT, 'BNBUSDT')
            }
        } else if (this.usdtSpotAccount1 > Number(this.accountData1.totalWalletBalance) * 2) {

            const currentPrices = await this.binanceConnector1.getCurrentPrices()

            const amountToBeConvertedToBNB = (this.usdtSpotAccount1 - (Number(this.accountData1.totalWalletBalance))) - 2
            if (amountToBeConvertedToBNB > 0.07) {
                console.log(`I convert ${amountToBeConvertedToBNB} USDT to BNB.`)
                await this.convertToCrypto(this.binanceConnector1, currentPrices, amountToBeConvertedToBNB, 'BNBUSDT', 2)
            }
        }

    }

    private async optimizeValueAtRiskOnAccount2(): Promise<void> {

        console.log(`account 2: usdtSpot: ${this.usdtSpotAccount2} - bnbSpot: ${this.bnbSpotAccount2} - mr: ${this.marginRatio2} - accountMode: ${this.accountMode2} - marginDelta: ${this.marginDeltaAccount2}`)

        if (this.marginRatio2 > 54 && this.usdtSpotAccount2 >= 10) {
            console.log(`I transfer ${10} USDT to the USDT Account 1 due to a margin ratio of ${this.marginRatio2}`)
            await this.binanceConnector2.transferFromSpotAccountToUSDTFutures(10)
            this.pauseCounter = 100
        } else if (this.usdtSpotAccount2 < Number(this.accountData2.totalWalletBalance) && this.bnbSpotAccount2 > 0.02) {
            const currentPrices = await this.binanceConnector2.getCurrentPrices()

            const currentBNBPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === 'BNBUSDT')[0].price)

            const amountToBeConvertedToUSDT = Number((11 / currentBNBPrice).toFixed(2))

            console.log(amountToBeConvertedToUSDT)
            if (amountToBeConvertedToUSDT > 0.01) {

                console.log(`I convert ${amountToBeConvertedToUSDT} BNB to USDT.`)

                await this.convertToUSDT(this.binanceConnector2, amountToBeConvertedToUSDT, 'BNBUSDT')
            }

        } else if (this.usdtSpotAccount2 > Number(this.accountData2.totalWalletBalance) * 2) {

            const currentPrices = await this.binanceConnector2.getCurrentPrices()

            const amountToBeConvertedToBNB = (this.usdtSpotAccount2 - (Number(this.accountData2.totalWalletBalance))) - 2

            if (amountToBeConvertedToBNB > 0.07) {
                console.log(`I convert ${amountToBeConvertedToBNB} USDT to BNB.`)
                await this.convertToCrypto(this.binanceConnector2, currentPrices, amountToBeConvertedToBNB, 'BNBUSDT', 2)
            }

        }

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
            await this.binanceConnector1.buyFuture('BTCUSDT', this.minimumBTCAtRisk)
        }
    }

    private async openBTC2(): Promise<void> {
        if (Number(this.bitcoinPosition2.positionAmt) === 0) {
            await this.binanceConnector2.sellFuture('BTCUSDT', this.minimumBTCAtRisk)
        }
    }

    private async addToBTC1(): Promise<void> {
        console.log(`Adding to BTC1.`)
        await this.binanceConnector1.buyFuture('BTCUSDT', this.minimumBTCAtRisk)
        this.pauseCounter = 100
    }

    private async addToBTC2(): Promise<void> {
        console.log(`Adding to BTC2.`)
        await this.binanceConnector2.sellFuture('BTCUSDT', this.minimumBTCAtRisk)
        this.pauseCounter = 100
    }

    private async reduceBTC1(): Promise<void> {
        console.log(`Yay you just realized some of the ${this.pnlBTC1}% profit from BTC1 --> reducing BTC1.`)
        await this.binanceConnector1.sellFuture('BTCUSDT', this.tradingUnit)
        this.pauseCounter = 100
    }

    private async reduceBTC2(): Promise<void> {
        console.log(`Yay you just realized some of the ${this.pnlBTC2}% profit from BTC2 --> reducing BTC2.`)
        await this.binanceConnector2.buyFuture('BTCUSDT', this.tradingUnit)
        this.pauseCounter = 100
    }




    private async startTheGame(): Promise<void> {
        console.log(`starting the game`)

        await this.openBTC1()
        await this.sleep((Math.floor(Math.random() * (200 - 10 + 1) + 10))) // staying undercover
        await this.openBTC2()
    }

    private async collectData(): Promise<void> {

        // this.totalAccount1 = await this.binanceConnector1.getTotalAccount()
        // console.log(JSON.stringify(this.totalAccount1).substr(0, 250))
        this.accountData1 = await this.binanceConnector1.getFuturesAccountData()
        await this.sleep((Math.floor(Math.random() * (200 - 10 + 1) + 10))) // staying undercover
        this.accountData2 = await this.binanceConnector2.getFuturesAccountData()

        if (this.iterationCounter === 1) {
            this.startBalanceUnderRisk =
                Number(this.accountData1.totalWalletBalance) + Number(this.accountData2.totalWalletBalance) + Number(this.accountData1.totalUnrealizedProfit) + Number(this.accountData2.totalUnrealizedProfit)
        }

        this.balanceUnderRisk = Number(this.accountData1.totalWalletBalance) + Number(this.accountData2.totalWalletBalance) + Number(this.accountData1.totalUnrealizedProfit) + Number(this.accountData2.totalUnrealizedProfit)

        this.marginRatio1 = Number(this.accountData1.totalMaintMargin) * 100 / Number(this.accountData1.totalMarginBalance)
        this.marginRatio2 = Number(this.accountData2.totalMaintMargin) * 100 / Number(this.accountData2.totalMarginBalance)

        this.bitcoinPosition1 = this.accountData1.positions.filter((entry: any) => entry.symbol === 'BTCUSDT')[0]
        this.bitcoinPosition2 = this.accountData2.positions.filter((entry: any) => entry.symbol === 'BTCUSDT')[0]

        this.pnlBTC1 = (Number(this.bitcoinPosition1.unrealizedProfit) * 100 / Number(this.bitcoinPosition1.initialMargin))
        this.pnlBTC2 = (Number(this.bitcoinPosition2.unrealizedProfit) * 100 / Number(this.bitcoinPosition2.initialMargin))

        if (!(this.pnlBTC1 < 1000000000)) this.pnlBTC1 = 0
        if (!(this.pnlBTC2 < 1000000000)) this.pnlBTC2 = 0

        this.closingAt = (Math.floor(Math.random() * (27 - 18 + 1) + 18))

        this.addingAt = ((Math.floor(Math.random() * (27 - 18 + 1) + 18))) * -1

        this.totalUnrealizedProfitInPercent1 = (Number(this.accountData1.totalUnrealizedProfit) * 100 / Number(this.accountData2.totalWalletBalance))
        this.totalUnrealizedProfitInPercent2 = (Number(this.accountData2.totalUnrealizedProfit) * 100 / Number(this.accountData2.totalWalletBalance))
        this.totalUnrealizedProfitInPercent = this.totalUnrealizedProfitInPercent1 + this.totalUnrealizedProfitInPercent2

        if (this.pauseCounter > 0) {
            this.pauseCounter--
        }

        this.accountMode1 = this.getAccountMode(this.accountData1)
        this.accountMode2 = this.getAccountMode(this.accountData2)

        this.etherPosition1 = this.accountData1.positions.filter((entry: any) => entry.symbol === 'ETHUSDT')[0]
        this.etherPosition2 = this.accountData2.positions.filter((entry: any) => entry.symbol === 'ETHUSDT')[0]

        this.marginDeltaAccount1 = this.getInitialMarginDelta(this.accountData1)
        this.marginDeltaAccount2 = this.getInitialMarginDelta(this.accountData2)

        this.usdtSpotAccount1 = Number(await this.binanceConnector1.getUSDTBalance())
        this.bnbSpotAccount1 = Number(await this.binanceConnector1.getSpotBalance('BNB'))

        this.usdtSpotAccount2 = Number(await this.binanceConnector2.getUSDTBalance())
        this.bnbSpotAccount2 = Number(await this.binanceConnector2.getSpotBalance('BNB'))

        console.log(`startBalUnderRisk: ${this.startBalanceUnderRisk} - balUnderRisk: ${this.balanceUnderRisk} - addingAt: ${this.addingAt} - closingAt: ${this.closingAt}`)

        console.log(`\nPNL: ${this.totalUnrealizedProfitInPercent} - PNL1: ${this.totalUnrealizedProfitInPercent1} - PNL2: ${this.totalUnrealizedProfitInPercent2} - pnlBTC1: ${this.pnlBTC1} - pnlBTC2: ${this.pnlBTC2} - pauseCounter: ${this.pauseCounter} \n`)

    }


    private getInitialMarginDelta(accountData: any): number {

        let marginOfAllShortPositions = 0
        for (const position of accountData.positions) {
            if ((Number(position.positionAmt)) < 0) {
                marginOfAllShortPositions = marginOfAllShortPositions + Number(position.initialMargin)
            }
        }

        let marginOfAllLongPositions = 0
        for (const position of accountData.positions) {
            if ((Number(position.positionAmt)) > 0) {
                marginOfAllLongPositions = marginOfAllLongPositions + Number(position.initialMargin)
            }
        }

        return marginOfAllLongPositions - marginOfAllShortPositions

    }

    private getAccountMode(accountData: any): string {

        const marginDelta = this.getInitialMarginDelta(accountData)

        if (marginDelta > Number(accountData.totalWalletBalance / 9)) {
            return 'long'
        } else if (marginDelta < (Number(accountData.totalWalletBalance / 9) * -1)) {
            return 'short'
        } else {
            return 'balanced'
        }

    }

    private isItAGoodTimeToAddToBTC1(): boolean {

        if ((this.pnlBTC1 < this.previousAddpnlBTC1) || (this.pnlBTC1 < this.addingAt && this.pauseCounter === 0)) {
            if (this.marginRatio1 < 18) {
                return true
            } else if (this.marginRatio1 > 27 && this.marginRatio1 < 36) {
                return true
            } else {
                // console.log(`the margin ratio on account 1 is too high to add to BTC 1`)
                return false
            }
        } else {
            // console.log(`the time is not right to add to BTC 1`)
            return false
        }
    }

    private isItAGoodTimeToReduceBTC1(): boolean {

        if (this.pnlBTC1 > this.previousReducepnlBTC1 || (this.pnlBTC1 > this.closingAt && this.pauseCounter === 0)) {
            if (this.minimumBTCAtRisk < this.bitcoinPosition1.positionAmt) {
                return true
            } else {
                // console.log(`the minimum BTC at risk (${this.minimumBTCAtRisk}) has been reached on account 1 - positionAmt BTC1 being: ${this.bitcoinPosition1.positionAmt}`)
                return false
            }

        } else {
            // console.log(`the time is not right to reduce BTC 1`)
            return false
        }

    }

    private isItAGoodTimeToAddToBTC2(): boolean {
        if ((this.pnlBTC2 < this.previousAddpnlBTC2) || (this.pnlBTC2 < this.addingAt && this.pauseCounter === 0)) {
            if (this.marginRatio2 < 18) {
                return true
            } else if (this.marginRatio2 > 27 && this.marginRatio2 < 36) {
                return true
            } else {
                // console.log(`the margin ratio on account 2 is too high to add to BTC2`)
                return false
            }
        } else {
            // console.log(`the time is not right to add to BTC2`)
            return false
        }

    }


    private isItAGoodTimeToReduceBTC2(): boolean {

        if (this.pnlBTC2 > this.previousReducepnlBTC2 || (this.pnlBTC2 > this.closingAt && this.pauseCounter === 0)) {
            if (this.bitcoinPosition2.positionAmt < this.minimumBTCAtRisk * -1) {
                return true
            } else {
                // console.log(`the minimum BTC at risk has been reached on account 2`)
                return false
            }

        } else {
            // console.log(`the time is not right to reduce BTC 2`)
            return false
        }

    }



    private getNumberOfOpenPositions(): number {
        let counter = 0

        if (Number(this.bitcoinPosition1.positionAmt > 0)) counter++
        if (Number(this.bitcoinPosition2.positionAmt < 0)) counter++

        return counter
    }

    private sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    public async convertToCrypto(binanceConnector: any, currentPrices: any[], amountToBeConverted: number, pair: string, decimalPlaces: number) {
        const currentPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === pair)[0].price)
        const amountOfTargetToBeBought = Number(((Number((amountToBeConverted).toFixed(decimalPlaces))) / currentPrice).toFixed(decimalPlaces))
        console.log(`I'll buy ${amountOfTargetToBeBought}. Pair: ${pair}`)
        try {
            await binanceConnector.placeBuyOrder(pair, amountOfTargetToBeBought)
        } catch (error) {
            console.log(`error from placeBuyOrder: ${error.message}`)
        }
    }

    public async convertToUSDT(binanceConnector: any, amountToBeConverted: number, pair: string) {
        console.log(`I'll sell ${amountToBeConverted}. Pair: ${pair}`)
        try {
            await binanceConnector.placeSellOrder(pair, amountToBeConverted)
        } catch (error) {
            console.log(`error from placeBuyOrder: ${error.message}`)
        }

    }


    private async closeAllOpenPositions(accountData: any, binanceConnector: any): Promise<void> {

        await this.sellAllLongPositions(accountData, binanceConnector)
        await this.buyBackAllShortPositions(accountData, binanceConnector)

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
            if (Number(position.positionAmt) < 0) {
                console.log(`buying back shorted ${position.symbol}`)
                await binanceConnector.buyFuture(position.symbol, Number(position.positionAmt) * -1)
            }
        }

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