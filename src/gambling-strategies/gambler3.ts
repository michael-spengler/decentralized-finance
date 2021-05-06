import { BinanceConnector } from "../binance/binance-connector"
import { Player } from "./player"
import { IBalPort, IPortfolio, PortfolioProvider } from "./portfolio-provider"

export class Gambler {

    private portfolio: IPortfolio[] = []
    private binanceConnector: BinanceConnector
    private portfolioProvider: PortfolioProvider
    private liquidityRatioToTransfer: number
    private liquidityRatioToSell: number

    public constructor(lrToSell: number, binanceApiKey: string, binanceApiSecret: string) {
        this.liquidityRatioToTransfer = lrToSell
        this.liquidityRatioToSell = lrToSell
        this.binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)
        this.portfolioProvider = new PortfolioProvider()
        this.portfolio = this.portfolioProvider.getPortfolio()
    }

    public static gamble(lrToTransfer: number, lrToSell: number, binanceApiKey: string, binanceApiSecret: string): void {

        const i = new Gambler(lrToSell, binanceApiKey, binanceApiSecret)
        if (lrToTransfer < 0.8 || lrToSell > 0.4 || (binanceApiKey === undefined) || binanceApiSecret === undefined) {
            throw new Error(`Strange Parameters`)
        }
        setInterval(async () => {

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
        const liquidityRatio = accountData.availableBalance / accountData.totalWalletBalance
        const lowestPrice80_100 = this.portfolioProvider.getLowestPriceOfRecentXIntervals(80, 100, 'BTCUSDT') // about 20 mins
        const highestPrice3_8 = this.portfolioProvider.getHighestPriceOfRecentXIntervals(3, 8, 'BTCUSDT')

        console.log(`LR: ${liquidityRatio.toFixed(2)}; cBTCP: ${cBTCP.toFixed(2)}; lP80_100: ${lowestPrice80_100.toFixed(2)}; hP3_8: ${highestPrice3_8.toFixed(2)} nyrPNL: ${accountData.totalUnrealizedProfit}`)

        if (accountData.totalUnrealizedProfit === 0) {
            await this.buy(currentPrices, accountData, 1)
        } else if (this.liquidityRatioToTransfer < liquidityRatio) {
            console.log(`Selling and Saving something as I made some significant gains.`)
            await this.sell(0.1)
            console.log(`${accountData.totalUnrealizedProfit} vs. ${accountData.totalWalletBalance}`)
            await this.saveSomething(accountData)
        } else if (this.liquidityRatioToSell > liquidityRatio) {
            if (cBTCP < highestPrice3_8) {
                console.log(`I'm seeking to reduce my risk as soon as soon as I hit the highest relative price.`)
            } else {
                console.log(`gently reducing the risk by selling 10%`)
                await this.sell(0.1)
            }
        } else {
            const availableUSDTBalanceInSpotAccount = Number(await this.binanceConnector.getUSDTBalance())
            const value = Number(accountData.totalWalletBalance) + availableUSDTBalanceInSpotAccount + Number(accountData.totalUnrealizedProfit)
            console.log(`I'm reasonably invested. LR: ${liquidityRatio}; TVL: ${value}`)
        }
    }

    private async saveSomething(accountData: any, savingsFactor: number = 0.05) {
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
