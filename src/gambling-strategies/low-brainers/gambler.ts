import { BinanceConnector } from "../../binance/binance-connector"
import { Player } from "../utilities/player"
import { IPortfolio, PortfolioProvider } from "../utilities/portfolio-provider"

export class Gambler {

    private portfolio: IPortfolio[] = []
    private binanceConnector: BinanceConnector
    private portfolioProvider: PortfolioProvider
    private liquidityRatioToBuy: number
    private liquidityRatioToSell: number
    private reinvestAt: number
    private investmentAmount: number
    private intervalCounter: number

    public constructor(lrToBuy: number, lrToSell: number, reinvestAt: number, investmentAmount: number, binanceApiKey: string, binanceApiSecret: string) {
        this.liquidityRatioToBuy = lrToBuy
        this.liquidityRatioToSell = lrToSell
        this.binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)
        this.portfolioProvider = new PortfolioProvider()
        this.portfolio = this.portfolioProvider.getPortfolio()
        this.reinvestAt = reinvestAt
        this.investmentAmount = investmentAmount
        this.intervalCounter = 0
    }

    public static gamble(lrToBuy: number, lrToSell: number, reinvestAt: number, investmentAmount: number, binanceApiKey: string, binanceApiSecret: string): void {

        const i = new Gambler(lrToBuy, lrToSell, reinvestAt, investmentAmount, binanceApiKey, binanceApiSecret)
        if (lrToBuy < 0.6 || lrToSell > 0.4 || (binanceApiKey === undefined) || binanceApiSecret === undefined) {
            throw new Error(`Strange Parameters`)
        }

        setInterval(async () => {
            i.intervalCounter++

            try {
                await i.investWisely()
            } catch (error) {
                console.log(`you can improve something: ${error.message}`)
            }

        }, 11 * 1000)

    }

    private async investWisely(): Promise<void> {

        const currentPrices = await this.binanceConnector.getCurrentPrices()
        const cPP = this.portfolioProvider.getCurrentPortfolioAveragePrice(currentPrices)
        const accountData = await this.binanceConnector.getFuturesAccountData()
        const liquidityRatio = Number(accountData.availableBalance) / Number(accountData.totalWalletBalance)
        const lowestPrice10_5000 = this.portfolioProvider.getLowestPriceOfRecentXIntervals(10, 5000)
        const lowestPrice300000_400000 = this.portfolioProvider.getLowestPriceOfRecentXIntervals(300000, 400000) // about 50 days
        const highestPrice100_1000 = this.portfolioProvider.getHighestPriceOfRecentXIntervals(1000, 5000) 
        const usdtBalanceOnSpot = Number(await this.binanceConnector.getUSDTBalance())

        if (this.intervalCounter === 2) {
            await this.adjustLeverageEffect(accountData)
        }

        console.log(`LR: ${liquidityRatio.toFixed(2)}; CPP: ${cPP.toFixed(2)}; lP10_5000: ${lowestPrice10_5000.toFixed(2)}; nyrPNL: ${accountData.totalUnrealizedProfit}`)

        if (Number(accountData.totalWalletBalance) <= this.reinvestAt && usdtBalanceOnSpot > 10) {

            console.log(`I transfer USDT from Spot Account to Futures Account e.g. after a serious drop which resulted in a low wallet ballance.`)
            await this.transferUSDTFromSpotAccountToFuturesAccount(this.investmentAmount)

        } else if (this.shouldISellSomethingDueToSignificantGains(Number(accountData.totalUnrealizedProfit), Number(accountData.totalWalletBalance))) {

            console.log(`Saving something as I made some significant gains and the market seems a bit overhyped atm.`)
            console.log(`${accountData.totalUnrealizedProfit} vs. ${accountData.totalWalletBalance}`)
            await this.sell(0.07)
            await this.saveSomething(currentPrices, accountData)

        } else if (liquidityRatio <= this.liquidityRatioToSell) {

            await this.sell(0.07)

        } else if (Number(accountData.totalWalletBalance) > (this.reinvestAt * 3)) {

            await this.saveSomething(currentPrices, accountData)

        } else if (liquidityRatio >= this.liquidityRatioToBuy) {

            if (this.intervalCounter > 1000) {
                if (cPP === lowestPrice10_5000) {
                    const couldBuyWouldBuyFactor = 0.1
                    await this.buy(currentPrices, accountData, couldBuyWouldBuyFactor)
                    console.log(`I bought with factor ${couldBuyWouldBuyFactor}`)
                    await this.saveSomething(currentPrices, accountData)
                } else {
                    console.log(`I'll invest some more as soon as I hit the lowest relative price. `)
                }
            } else {
                console.log(`intervalCounter: ${this.intervalCounter}`)
            }

        } else if ((Number(accountData.totalUnrealizedProfit)) < ((Number(accountData.totalWalletBalance) * -1) / 2)) {

            console.log(`unfortunately it seems time to realize some losses. I'm selling 10 Percent of my assets.`)
            await this.sell(0.07)

        } else if (cPP === lowestPrice300000_400000 && this.intervalCounter > 400000) {

            console.log(`I transfer USDT from Spot Account to Futures Account due to reaching a long term low.`)
            await this.transferUSDTFromSpotAccountToFuturesAccount(this.investmentAmount * 0.5)

        } else {

            const totalGamblingValue = Number(accountData.totalWalletBalance) + usdtBalanceOnSpot + Number(accountData.totalUnrealizedProfit)

            console.log(`I'm reasonably invested. LR: ${liquidityRatio}; TGV: ${totalGamblingValue}`)

        }

        await this.hedgeWisely(accountData, highestPrice100_1000, cPP)
    }

    public async hedgeWisely(accountData: any, highestPrice100_1000: number, cPP: number): Promise<void> {

        console.log(`cPP (${cPP}) > highestPrice100_1000 (${highestPrice100_1000}) = ${cPP > highestPrice100_1000}`)

        if (cPP > highestPrice100_1000) {
            await this.binanceConnector.sellFuture('DOGEUSDT', 1000)
        } else {
            console.log(`highestPrice100_1000 ok: ${highestPrice100_1000}`)
        }

        const currentHedgePosition = accountData.positions.filter((entry: any) => entry.symbol === 'DOGEUSDT')[0]
        const hedgeProfitInPercent = (currentHedgePosition.unrealizedProfit * 100) / currentHedgePosition.initialMargin
            
        console.log(`hedgeProfitInPercent: ${hedgeProfitInPercent}`)

        if (hedgeProfitInPercent > 100) {
            await this.binanceConnector.sellFuture('DOGEUSDT', currentHedgePosition.positionAmt)
        }

    }

    // public getTheAverage(list: number[]): number {

    //     let sum = 0
    //     for (const e of list) {
    //         sum = sum + Number(e)
    //     }

    //     return sum / list.length
    // }

    private shouldISellSomethingDueToSignificantGains(totalUnrealizedProfit: number, totalWalletBalance: number): boolean {
        const randomNumberBetween7And40 = Math.floor((Math.random() * (40 - 7 + 1) + 7)) // empirical observations suggest this strangely looking approach
        const randomFactor = randomNumberBetween7And40 / 10

        console.log(`randomFactor: ${randomFactor}`)
        if (totalUnrealizedProfit > totalWalletBalance * randomFactor) {
            return true
        }

        return false
    }

    private async adjustLeverageEffect(accountData: any): Promise<void> {

        const leverageEntries = await this.binanceConnector.futuresLeverageBracket()

        for (const p of accountData.positions) {
            if (p.positionAmt > 0) {

                const leverageInfo = leverageEntries.filter((e: any) => e.symbol == p.symbol)[0]
                if (leverageInfo !== undefined) {
                    console.log(p.symbol)

                    let maxLeverageForPosition = leverageEntries.filter((e: any) => e.symbol === p.symbol)[0].brackets[0].initialLeverage
                    console.log(`adjusting leverage of ${p.symbol} to ${maxLeverageForPosition}`)
                    await this.binanceConnector.futuresLeverage(p.symbol, maxLeverageForPosition)
                } else {
                    console.log(p.symbol)
                }
            }
        }
    }

    private async saveSomething(currentPrices: any[], accountData: any, savingsFactor: number = 0.05): Promise<void> {
        const savingsAmount = Number((accountData.availableBalance * savingsFactor).toFixed(0))
        console.log(`saveSomething - savingsAmount: ${savingsAmount}`)
        if (savingsAmount >= 1) {
            console.log(`I'll transfer ${savingsAmount} USDT to my fiat and spot account to prepare for a reinvestment after a serious drop.`)
            try {
                await this.binanceConnector.transferFromUSDTFuturesToSpotAccount(savingsAmount)
            } catch (error) {
                console.log(`error from transferFromUSDTFuturesToSpotAccount: ${error.message}`)
            }
        }
    }

    private async transferUSDTFromSpotAccountToFuturesAccount(investmentAmount: number): Promise<void> {

        try {
            const availableUSDTBalanceInSpotAccount = Number(await this.binanceConnector.getUSDTBalance())
            const transferAmount = (availableUSDTBalanceInSpotAccount < investmentAmount) ? availableUSDTBalanceInSpotAccount : investmentAmount

            await this.binanceConnector.transferFromSpotAccountToUSDTFutures(transferAmount)
        } catch (error) {
            console.log(`you might take a look into this: ${error.message}`)
        }

    }

    private async buy(currentPrices: any[], accountData: any, couldBuyWouldBuyFactor: number): Promise<void> {

        try {
            for (const listEntry of this.portfolio) {
                const currentPrice = currentPrices.filter((e: any) => e.coinSymbol === listEntry.pairName)[0].price
                const xPosition = accountData.positions.filter((entry: any) => entry.symbol === listEntry.pairName)[0]
                const canBuy = ((accountData.availableBalance * xPosition.leverage) / currentPrice) * (listEntry.percentage / 100)
                const howMuchToBuy = Number((canBuy * couldBuyWouldBuyFactor))
                console.log(`I'll buy ${howMuchToBuy} ${listEntry.pairName} as it has a portfolio percentage of ${listEntry.percentage}`)
                await this.binanceConnector.buyFuture(listEntry.pairName, Number(howMuchToBuy.toFixed(this.portfolioProvider.getDecimalPlaces(listEntry.pairName))))
            }

            Player.playMP3(`${__dirname}/../../sounds/game-new-level.mp3`) // https://www.freesoundslibrary.com/cow-moo-sounds/ 

        } catch (error) {
            console.log(`shit happened: ${error.message}`)
        }

    }

    private async sell(positionSellFactor: number = 0.3): Promise<void> {
        try {
            const accountData = await this.binanceConnector.getFuturesAccountData()
            for (const position of accountData.positions) {
                if (position.positionAmt > 0 && position.symbol !=='DOGEUSDT') { // the hedge is handled separately
                    const howMuchToSell = Number((position.positionAmt * positionSellFactor).toFixed(this.portfolioProvider.getDecimalPlaces(position.symbol)))
                    console.log(`I'll sell ${howMuchToSell} ${position.symbol}`)
                    await this.binanceConnector.sellFuture(position.symbol, howMuchToSell)
                }
            }

            Player.playMP3(`${__dirname}/../../sounds/cow-moo-sound.mp3`) // https://www.freesoundslibrary.com/cow-moo-sounds/ 

        } catch (error) {
            console.log(`shit happened: ${error.message}`)
        }
    }

}
