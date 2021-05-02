import { BinanceConnector } from "../binance/binance-connector"
import { Player } from "./player"
import { IBalPort, IPortfolio, PortfolioProvider } from "./portfolio-provider"

export class Gambler {

    private portfolio: IPortfolio[] = []
    private binanceConnector: BinanceConnector
    private portfolioProvider: PortfolioProvider
    private liquidityRatioToBuy: number
    private liquidityRatioToSell: number
    private reinvestAt: number
    private investmentAmount: number
    private intervalCounter: number
    private writeStats: boolean
    private statistics: IBalPort[] = []

    public constructor(lrToBuy: number, lrToSell: number, reinvestAt: number, investmentAmount: number, binanceApiKey: string, binanceApiSecret: string, writeStats: boolean) {
        this.liquidityRatioToBuy = lrToBuy
        this.liquidityRatioToSell = lrToSell
        this.binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)
        this.portfolioProvider = new PortfolioProvider()
        this.portfolio = this.portfolioProvider.getPortfolio()
        this.reinvestAt = reinvestAt
        this.investmentAmount = investmentAmount
        this.intervalCounter = 0
        this.writeStats = writeStats
    }

    public static gamble(lrToBuy: number, lrToSell: number, reinvestAt: number, investmentAmount: number, binanceApiKey: string, binanceApiSecret: string, writeStats: boolean = false): void {

        const i = new Gambler(lrToBuy, lrToSell, reinvestAt, investmentAmount, binanceApiKey, binanceApiSecret, writeStats)
        if (lrToBuy < 0.6 || lrToSell > 0.4 || (binanceApiKey === undefined) || binanceApiSecret === undefined) {
            throw new Error(`Strange Parameters`)
        }
        setInterval(async () => {
            i.intervalCounter++

            // const all = await i.binanceConnector.getAccount()

            try {
                await i.investWisely()
            } catch (error) {
                console.log(`you can improve something: ${error.message}`)
            }
        }, 11 * 1000)

    }

    private async investWisely() {

        const currentPrices = await this.binanceConnector.getCurrentPrices()
        const cBTCP = this.portfolioProvider.getCurrentXPrice(currentPrices, 'BTCUSDT')
        const accountData = await this.binanceConnector.getFuturesAccountData()
        const cPV = this.portfolioProvider.getCurrentPortfolioValue(accountData.positions, currentPrices)
        const liquidityRatio = accountData.availableBalance / accountData.totalWalletBalance
        const lowestPrice80_100 = this.portfolioProvider.getLowestPriceOfRecentXIntervals(80, 100, 'BTCUSDT') // about 20 mins
        const lowestPrice300_500 = this.portfolioProvider.getLowestPriceOfRecentXIntervals(300, 500, 'BTCUSDT') // about 1.5 hours
        const lowestPrice900_1200 = this.portfolioProvider.getLowestPriceOfRecentXIntervals(900, 1200, 'BTCUSDT') // about 3.5 hours
        const lowestPrice300000_400000 = this.portfolioProvider.getLowestPriceOfRecentXIntervals(300000, 400000, 'BTCUSDT') // about 50 days
        const highestPrice3_8 = this.portfolioProvider.getHighestPriceOfRecentXIntervals(3, 8, 'BTCUSDT')
        const usdtBalanceOnSpot = Number(await this.binanceConnector.getUSDTBalance())

        
        if (this.writeStats) {

            if (this.statistics.length > 500000) {
                this.statistics.shift()
            }
    
            this.statistics.push({balanceInUSDT: Number(usdtBalanceOnSpot) + Number(accountData.totalWalletBalance) + Number(accountData.totalUnrealizedProfit), portfolioPriceInUSDT: cPV})
            await this.portfolioProvider.saveStatistics(this.statistics)
        }

        console.log(`LR: ${liquidityRatio.toFixed(2)}; cBTCP: ${cBTCP.toFixed(2)}; lP80_100: ${lowestPrice80_100.toFixed(2)}; hP3_8: ${highestPrice3_8.toFixed(2)} nyrPNL: ${accountData.totalUnrealizedProfit}`)

        if (Number(accountData.totalWalletBalance) <= this.reinvestAt && usdtBalanceOnSpot > 10) {
            console.log(`I transfer USDT from Spot Account to Futures Account e.g. after a serious drop which resulted in a low wallet ballance.`)
            await this.transferUSDTFromSpotAccountToFuturesAccount(this.investmentAmount)
        } else if (Number(accountData.totalUnrealizedProfit) > Number(accountData.totalWalletBalance)) {
            console.log(`Selling and saving something as I made some significant gains and the market seems a bit overhyped atm.`)
            console.log(`${accountData.totalUnrealizedProfit} vs. ${accountData.totalWalletBalance}`)
            await this.sell(0.3)
            await this.saveSomething(currentPrices, accountData)
        } else if (liquidityRatio <= this.liquidityRatioToSell) {
            if (liquidityRatio <= (this.liquidityRatioToSell * 0.9)) {
                await this.sell(0.8)
                console.log(`selling 95% of assets as it looks like a very strong dip`)
            } else {
                console.log(`selling 50% of assets as it looks like a strong dip`)
                await this.sell(0.5)
            }
        } else if (liquidityRatio >= this.liquidityRatioToBuy) {
            if (this.intervalCounter > 100) { // for devtests
            // if (this.intervalCounter > 1200) {
                if (cBTCP === lowestPrice900_1200) {
                    await this.buy(currentPrices, accountData, 0.1)
                    console.log(`I bought with factor 0.1`)
                    await this.saveSomething(currentPrices, accountData)
                } else if (cBTCP === lowestPrice300_500) {
                    await this.buy(currentPrices, accountData, 0.07)
                    console.log(`I bought with factor 0.07`)
                    await this.saveSomething(currentPrices, accountData)
                } else if (cBTCP === lowestPrice80_100) {
                    await this.buy(currentPrices, accountData, 0.05)
                    console.log(`I bought with factor 0.05`)
                    await this.saveSomething(currentPrices, accountData)
                } else {
                    console.log(`I'll invest some more as soon as I hit the lowest relative price. `)
                }
            } else {
                console.log(`intervalCounter: ${this.intervalCounter}`)
            }
        } else if ((((this.liquidityRatioToBuy + this.liquidityRatioToSell) / 2) > liquidityRatio)) {
            if (cBTCP < highestPrice3_8) {
                console.log(`I'm seeking to reduce my risk as soon as soon as I hit the highest relative price.`)
            } else {
                console.log(`gently reducing the risk by selling 10%`)
                await this.sell(0.1)
            }
        } else if ((Number(accountData.totalUnrealizedProfit)) < ((Number(accountData.totalWalletBalance) * -1) / 2)) {
            console.log(`unfortunately it seems time to realize some losses. I'm selling 10 Percent of my assets.`)
            await this.sell(0.1)
        } else if (cBTCP === lowestPrice300000_400000 && this.intervalCounter > 400000) {
            console.log(`I transfer USDT from Spot Account to Futures Account due to reaching a long term low.`)
            await this.transferUSDTFromSpotAccountToFuturesAccount(this.investmentAmount * 0.5)
        } else {
            console.log(`I'm reasonably invested. LR: ${liquidityRatio}; TWB: ${accountData.totalWalletBalance}`)
        }
    }

    private async saveSomething(currentPrices: any[], accountData: any, savingsFactor: number = 0.05) {
        const savingsAmount = Number((accountData.availableBalance * savingsFactor).toFixed(0))
        console.log(`saveSomething - savingsAmount: ${savingsAmount}`)
        if (savingsAmount >= 1) {
            console.log(`I'll transfer ${savingsAmount} USDT to my fiat and spot account to prepare for a reinvestment after a serious drop.`)
            try {
                await this.binanceConnector.transferFromUSDTFuturesToSpotAccount(savingsAmount)
            } catch (error) {
                console.log(`error from transferFromUSDTFuturesToSpotAccount: ${error.message}`)
            }

            // Some might want to convert USDT to ETH... 
            // const currentEtherPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === 'ETHUSDT')[0].price)
            // const amountOfEthToBeBought = Number(((Number((savingsAmount / 2).toFixed(2))) / currentEtherPrice).toFixed(3))
            // console.log(`I'll buy ${amountOfEthToBeBought} ETH paying with USDT to stay liquid and reasonably invested in my spot account as well.`)
            // try {
            //     await this.binanceConnector.placeBuyOrder("ETHUSDT", amountOfEthToBeBought)
            // } catch (error) {
            //     console.log(`error from placeBuyOrder: ${error.message}`)
            // }
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

    private async buy(currentPrices: any[], accountData: any, couldBuyWouldBuyFactor: number) {
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
