import { BinanceConnector } from "../binance/binance-connector"
import { Player } from "./player"
import { IPortfolio, PortfolioProvider } from "./portfolio-provider"

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

    public static gamble(lrToBuy: number, lrToSell: number, reinvestAt: number, investmentAmount: number, binanceApiKey: string, binanceApiSecret: string) {

        const i = new Gambler(lrToBuy, lrToSell, reinvestAt, investmentAmount, binanceApiKey, binanceApiSecret)
        if (lrToBuy < 0.6 || lrToSell > 0.4 || (binanceApiKey === undefined) || binanceApiSecret === undefined) {
            throw new Error(`Strange Parameters`)
        }
        setInterval(async () => {
            i.intervalCounter++
            try {
                await i.investWisely()
            } catch(error) {
                console.log(`you can improve something: ${error.message}`)
            }
        }, 11 * 1000)

    }

    private async investWisely() {

        const currentPrices = await this.binanceConnector.getCurrentPrices()
        const cPP = this.portfolioProvider.getCurrentPortfolioAveragePrice(currentPrices)
        const accountData = await this.binanceConnector.getFuturesAccountData()
        const liquidityRatio = accountData.availableBalance / accountData.totalWalletBalance
        const lowestPrice80_100 = this.portfolioProvider.getLowestPriceOfRecentXIntervals(80, 100) // about 20 mins
        const lowestPrice300_500 = this.portfolioProvider.getLowestPriceOfRecentXIntervals(300, 500) // about 1.5 hours
        const lowestPrice900_1200 = this.portfolioProvider.getLowestPriceOfRecentXIntervals(900, 1200) // about 3.5 hours
        const lowestPrice7000_20000 = this.portfolioProvider.getLowestPriceOfRecentXIntervals(7000, 20000) // about 35 hours
        const lowestPrice300000_400000 = this.portfolioProvider.getLowestPriceOfRecentXIntervals(300000, 400000) // about 50 days
        const highestPrice3_8 = this.portfolioProvider.getHighestPriceOfRecentXIntervals(3, 8)

        console.log(`LR: ${liquidityRatio.toFixed(2)}; CPP: ${cPP.toFixed(2)}; lP80_100: ${lowestPrice80_100.toFixed(2)}; hP3_8: ${highestPrice3_8.toFixed(2)} nyrPNL: ${accountData.totalUnrealizedProfit}`)

        if (Number(accountData.totalWalletBalance) <= this.reinvestAt) {
            console.log(`I transfer USDT from Spot Account to Futures Account e.g. after a serious drop which resulted in a low wallet ballance.`)
            await this.transferUSDTFromSpotAccountToFuturesAccount(this.investmentAmount)
        } else if (Number(accountData.totalUnrealizedProfit) > Number(accountData.totalWalletBalance)) {
            console.log(`Selling and saving something as I made some significant gains and the market seems a bit overhyped atm.`)
            console.log(`${accountData.totalUnrealizedProfit} vs. ${accountData.totalWalletBalance}`)
            await this.sell(0.3)
            await this.saveSomething(accountData)
        } else if (liquidityRatio <= this.liquidityRatioToSell) {
            if (liquidityRatio <= (this.liquidityRatioToSell * 0.9)) {
                await this.sell(0.8)
                console.log(`selling 95% of assets as it looks like a very strong dip`)
            } else {
                console.log(`selling 50% of assets as it looks like a strong dip`)
                await this.sell(0.5)
            }
        } else if (liquidityRatio >= this.liquidityRatioToBuy) {
            if (cPP === lowestPrice80_100 && this.intervalCounter > 100) {
                await this.buy(currentPrices, accountData)
                await this.saveSomething(accountData)
            } else {
                console.log(`I'll invest some more as soon as I hit the lowest relative price. `)
            }
        } else if ((((this.liquidityRatioToBuy + this.liquidityRatioToSell) / 2) > liquidityRatio)) {
            if (cPP < highestPrice3_8) {
                console.log(`I'm seeking to reduce my risk as soon as soon as I hit the highest relative price.`)
            } else {
                console.log(`gently reducing the risk by selling 10%`)
                await this.sell(0.1)
            }
        } else if ((Number(accountData.totalUnrealizedProfit)) < ((Number(accountData.totalWalletBalance) * -1) / 2)) {
            console.log(`unfortunately it seems time to realize some losses. I'm selling 10 Percent of my assets.`)
            await this.sell(0.1)
        } else if (cPP === lowestPrice300000_400000 && this.intervalCounter > 400000) {
            console.log(`I transfer USDT from Spot Account to Futures Account due to reaching a long term low.`)
            await this.transferUSDTFromSpotAccountToFuturesAccount(this.investmentAmount)
        } else if (cPP === lowestPrice7000_20000 && this.intervalCounter > 20000) {
            console.log(`I transfer USDT from Spot Account to Futures Account due to reaching a mid term low.`)
            await this.transferUSDTFromSpotAccountToFuturesAccount(this.investmentAmount * 0.8)
        } else if (cPP === lowestPrice900_1200 && this.intervalCounter > 1200) {
            console.log(`I transfer USDT from Spot Account to Futures Account due to reaching a short term low without being in reduce risk mode.`)
            await this.transferUSDTFromSpotAccountToFuturesAccount(this.investmentAmount * 0.5)
        } else if (cPP === lowestPrice300_500 && this.intervalCounter > 500) {
            console.log(`I transfer USDT from Spot Account to Futures Account due to reaching a very short term low without being in reduce risk mode.`)
            await this.transferUSDTFromSpotAccountToFuturesAccount(this.investmentAmount * 0.2)
        } else {
            console.log(`I'm reasonably invested. LR: ${liquidityRatio}; TWB: ${accountData.totalWalletBalance}`)
        }
    }

    private async saveSomething(accountData: any) {
        const savingsAmount = Number((accountData.availableBalance * 0.05).toFixed(0))
        if (savingsAmount >= 1) {
            console.log(`I'll transfer ${savingsAmount} USDT to my fiat and spot account to prepare for a reinvestment after a serious drop.`)
            try {
                await this.binanceConnector.transferFromUSDTFuturesToSpotAccount(savingsAmount)
            } catch (error) {
                console.log(`error from transferFromUSDTFuturesToSpotAccount: ${error.message}`)
            }

            try {
                await this.binanceConnector.placeBuyOrder("ETHUSDT", Number((savingsAmount / 2).toFixed(3)))
            } catch (error) {
                console.log(`error from placeBuyOrder: ${error.message}`)
            }
        }
    }

    private async transferUSDTFromSpotAccountToFuturesAccount(investmentAmount: number) {

        try {
            const availableUSDTBalanceInSpotAccount = Number(await this.binanceConnector.getUSDTBalance())
            const transferAmount = (availableUSDTBalanceInSpotAccount < investmentAmount) ? availableUSDTBalanceInSpotAccount : investmentAmount

            await this.binanceConnector.transferFromSpotAccountToUSDTFutures(transferAmount)
        } catch (error) {
            console.log(`you might take a look into this: ${error.message}`)
        }
    }

    private async buy(currentPrices: any[], accountData: any) {
        try {
            for (const listEntry of this.portfolio) {
                const currentPrice = currentPrices.filter((e: any) => e.coinSymbol === listEntry.pairName)[0].price
                const xPosition = accountData.positions.filter((entry: any) => entry.symbol === listEntry.pairName)[0]
                const canBuy = ((accountData.availableBalance * xPosition.leverage) / currentPrice) * (listEntry.percentage / 100)
                const couldBuyWouldBuyFactor = 0.1
                const howMuchToBuy = Number((canBuy * couldBuyWouldBuyFactor))
                console.log(`I'll buy ${howMuchToBuy} ${listEntry.pairName} as it has a portfolio percentage of ${listEntry.percentage}`)
                await this.binanceConnector.buyFuture(listEntry.pairName, Number(howMuchToBuy.toFixed(this.portfolioProvider.getDecimalPlaces(listEntry.pairName))))
            }
            Player.playMP3(`${__dirname}/../../sounds/game-new-level.mp3`) // https://www.freesoundslibrary.com/cow-moo-sounds/ 
        } catch (error) {
            console.log(`shit happened: ${error.message}`)
        }
    }

    private async sell(positionSellFactor: number = 0.3) {
        try {
            const accountData = await this.binanceConnector.getFuturesAccountData()
            for (const position of accountData.positions) {
                if (position.positionAmt > 0) {
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
