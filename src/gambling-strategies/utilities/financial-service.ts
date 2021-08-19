// tslint:disable-next-line: no-unnecessary-class

import { BinanceConnector } from "../../binance/binance-connector"

export interface IPortfolio {
    pair: string
    historicPrices: number[]
}
// tslint:disable-next-line: no-unnecessary-class
export class FinancialService {

    public static singletonInstance: any
    private static portfolio: IPortfolio[] = []
    private static readonly buyLowSellHighPortfolio: IPortfolio[] = []
    private static readonly shortPortfolio: IPortfolio[] = []
    private static readonly historicPricesLength = 45000

    public static initializeBuyLowSellHighShortPortfolio(): void {

        const excludeList = ["ETHUSDT", "BTCUSDT", "LINKUSDT", "BATUSDT"] // add the hard coded ... longportfolio items in this exclude list

        FinancialService.shortPortfolio.push({ pair: "ICPUSDT", historicPrices: [] })
    }

    public static initializeBuyLowSellHighLongPortfolio(): void {

        FinancialService.buyLowSellHighPortfolio.push({ pair: "UNIUSDT", historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "XMRUSDT", historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "COMPUSDT", historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "MANAUSDT", historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "AAVEUSDT", historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "DOTUSDT", historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "ADAUSDT", historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "AVAXUSDT", historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "EGLDUSDT", historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "RENUSDT", historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "SOLUSDT", historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "LUNAUSDT", historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "TRXUSDT", historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "VETUSDT", historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "XLMUSDT", historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "FILUSDT", historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "LTCUSDT", historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "MKRUSDT", historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "SNXUSDT", historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "THETAUSDT", historicPrices: [] })

    }

    public static initializePortfolio(): void {

        if (FinancialService.portfolio.length === 0) {
            FinancialService.portfolio = [
                { pair: "XMRUSDT", historicPrices: [] },
                { pair: "ETHUSDT", historicPrices: [] },
                { pair: "BTCUSDT", historicPrices: [] },
                { pair: "UNIUSDT", historicPrices: [] },
                { pair: "DOGEUSDT", historicPrices: [] },
                { pair: "LINKUSDT", historicPrices: [] },
                { pair: "BATUSDT", historicPrices: [] },
                { pair: "BNBUSDT", historicPrices: [] },
                { pair: "COMPUSDT", historicPrices: [] },
                { pair: "MANAUSDT", historicPrices: [] },
                { pair: "AAVEUSDT", historicPrices: [] },
                { pair: "DOTUSDT", historicPrices: [] },
                { pair: "ADAUSDT", historicPrices: [] },
                { pair: "AVAXUSDT", historicPrices: [] },
                { pair: "EGLDUSDT", historicPrices: [] },
                { pair: "RENUSDT", historicPrices: [] },
                { pair: "SOLUSDT", historicPrices: [] },
                { pair: "LUNAUSDT", historicPrices: [] },
                { pair: "TRXUSDT", historicPrices: [] },
                { pair: "VETUSDT", historicPrices: [] },
                { pair: "XLMUSDT", historicPrices: [] },
                { pair: "FILUSDT", historicPrices: [] },
                { pair: "LTCUSDT", historicPrices: [] },
                { pair: "MKRUSDT", historicPrices: [] },
                { pair: "SNXUSDT", historicPrices: [] },
                { pair: "THETAUSDT", historicPrices: [] },
            ]
        }

    }

    public static async closeAllOpenPositions(accountData: any, binanceConnector: any): Promise<void> {
        await FinancialService.sellAllLongPositions(accountData, binanceConnector)
        await FinancialService.buyBackAllShortPositions(accountData, binanceConnector)
    }

    public static async convertToUSDT(binanceConnector: any, amountToBeConverted: number, pair: string) {
        console.log(`I'll sell ${amountToBeConverted}. Pair: ${pair}`)
        try {
            await binanceConnector.placeSellOrder(pair, amountToBeConverted)
        } catch (error) {
            console.log(`error from placeBuyOrder: ${error.message}`)
        }
    }

    public static async sleep(ms: number): Promise<any> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms)
        })
    }

    public static getAccountMode(accountData: any): string {
        const marginDelta = FinancialService.getInitialMarginDelta(accountData)
        const buffer = Number(accountData.totalWalletBalance / 27)

        if (marginDelta - buffer > 0) {
            return "long"
        }
        if (marginDelta + buffer < 0) {
            return "short"
        }

        return "balanced"

    }

    public static async optimizeValueAtRiskOnAccount(binanceConnector: any, bnbSpotAccount: number, usdtSpotAccount: number, accountData: any): Promise<void> {
        const accountId = binanceConnector.getAccountId()
        const marginRatio = (Number(accountData.totalMaintMargin) * 100) / Number(accountData.totalMarginBalance)
        const marginDelta = FinancialService.getInitialMarginDelta(accountData)
        const accountMode = FinancialService.getAccountMode(accountData)
        console.log(`${accountId}: usdtSpot: ${usdtSpotAccount} - bnbSpot: ${bnbSpotAccount} - mr: ${marginRatio} - marginDelta: ${marginDelta} - accountMode: ${accountMode}`)

        if (marginRatio > 54 && usdtSpotAccount >= 10) {
            console.log(`I transfer ${10} USDT to the USDT Account 1 due to a margin ratio of ${marginRatio}`)
            await binanceConnector.transferFromSpotAccountToUSDTFutures(10)
        } else if (usdtSpotAccount < 100 && bnbSpotAccount > 0.2) {
            const currentPrices = await binanceConnector.getCurrentPrices()

            const currentBNBPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === "BNBUSDT")[0].price)

            const amountToBeConvertedToUSDT = Number(
                (36 / currentBNBPrice).toFixed(2),
            )

            console.log(`amountToBeConvertedToUSDT ${amountToBeConvertedToUSDT}`)

            if (amountToBeConvertedToUSDT > 0.06) {
                console.log(`I convert ${amountToBeConvertedToUSDT} BNB to USDT.`)

                await FinancialService.convertToUSDT(
                    binanceConnector,
                    amountToBeConvertedToUSDT,
                    "BNBUSDT",
                )
            }
        } else if (usdtSpotAccount > Number(accountData.totalWalletBalance) * 2) {
            const currentPrices = await binanceConnector.getCurrentPrices()

            const amountToBeConvertedToBNB = usdtSpotAccount -
                Number(accountData.totalWalletBalance) - 2
            if (amountToBeConvertedToBNB > 0.07) {
                console.log(`I convert ${amountToBeConvertedToBNB} USDT to BNB.`)
                await FinancialService.convertToCrypto(binanceConnector, currentPrices, amountToBeConvertedToBNB, "BNBUSDT", 2)
            }
        }
    }

    public static getInitialMarginDelta(accountData: any): number {
        let marginOfAllShortPositions = 0
        for (const position of accountData.positions) {
            if (Number(position.positionAmt) < 0) {
                marginOfAllShortPositions = marginOfAllShortPositions +
                    Number(position.initialMargin)
            }
        }

        let marginOfAllLongPositions = 0
        for (const position of accountData.positions) {
            if (Number(position.positionAmt) > 0) {
                marginOfAllLongPositions = marginOfAllLongPositions +
                    Number(position.initialMargin)
            }
        }

        return marginOfAllLongPositions - marginOfAllShortPositions
    }

    public static async buyBackAllShortPositions(
        accountData: any,
        binanceConnector: any,
    ) {
        for (const position of accountData.positions) {
            if (Number(position.positionAmt) < 0) {
                console.log(`buying back shorted ${position.symbol}`)
                await binanceConnector.buyFuture(
                    position.symbol,
                    Number(position.positionAmt) * -1,
                )
            }
        }
    }

    public static async convertToCrypto(binanceConnector: any, currentPrices: any[], amountToBeConverted: number, pair: string, decimalPlaces: number) {
        const currentPrice = Number(
            currentPrices.filter((e: any) => e.coinSymbol === pair)[0].price,
        )
        const amountOfTargetToBeBought = Number(
            (
                Number(amountToBeConverted.toFixed(decimalPlaces)) / currentPrice
            ).toFixed(decimalPlaces),
        )
        console.log(`I'll buy ${amountOfTargetToBeBought}. Pair: ${pair}`)
        try {
            await binanceConnector.placeBuyOrder(pair, amountOfTargetToBeBought)
        } catch (error) {
            console.log(`error from placeBuyOrder: ${error.message}`)
        }
    }

    public static async sellAllBuyLowSellHighPositionsWithAPNLOfHigherThan(closingAt: number, accountData: any, binanceConnector: any) {

        for (const position of accountData.positions) {

            const pnlInPercent = (position.unrealizedProfit * 100) / position.initialMargin

            const entry = FinancialService.buyLowSellHighPortfolio.filter((e: any) => e.pair === position.symbol)[0]

            if (entry === undefined) {
                // not relevant for this potential sale
            } else if (pnlInPercent > closingAt) {

                if (position.positionAmt > 0) {
                    console.log(`selling ${position.symbol}`)
                    await binanceConnector.sellFuture(position.symbol, Number(position.positionAmt))
                }
            }
        }

    }

    public static async closeAllPositionsWithAPNLOfHigherThan(closingAt: number, accountData: any, binanceConnector: any): Promise<boolean> {
        const accountId = binanceConnector.getAccountId()

        let positionsAdjusted = false

        for (const position of accountData.positions) {

            const pnlInPercent = (position.unrealizedProfit * 100) / position.initialMargin

            if (pnlInPercent > closingAt && Number(position.unrealizedProfit) > 1) {

                if (position.positionAmt > 0) {
                    console.log(`${accountId}: selling ${position.symbol} to realize some profits`)
                    await binanceConnector.sellFuture(position.symbol, Number(position.positionAmt))
                    positionsAdjusted = true
                }

                if (position.positionAmt < 0) {
                    console.log(`${accountId}: buying back short sold ${position.symbol} to realize some profits`)
                    await binanceConnector.buyFuture(position.symbol, Number(position.positionAmt) * -1)
                    positionsAdjusted = true
                }
            }

        }

        return positionsAdjusted
    }

    public static getTheAverage(list: number[]): number {

        let sum = 0
        for (const e of list) {
            sum = sum + Number(e)
        }

        return sum / list.length
    }

    public static async sellAllLongPositions(accountData: any, binanceConnector: any) {
        for (const position of accountData.positions) {
            if (position.positionAmt > 0) {
                console.log(`selling ${position.symbol}`)
                await binanceConnector.sellFuture(
                    position.symbol,
                    Number(position.positionAmt),
                )
            }
        }
    }

    // public static async getThingsGoingWhenStuckInAnUnRewardingBalance(closingAt: number, binanceConnector: any, currentPrices: any[], accountData: any) {
    //     const accountId = binanceConnector.getAccountId()
    //     const accountMode = FinancialService.getAccountMode(accountData)
    //     const marginRatio = (Number(accountData.totalMaintMargin) * 100) / Number(accountData.totalMarginBalance)

    //     if (accountMode === 'balanced' && marginRatio < 45) {
    //         const theBestItemToBeBoughtNow = FinancialService.shortPortfolio.filter((e: any) => e.)
    //         const currentPairPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === theBestItemToBeBoughtNow.pair)[0].price)
    //         const lowestSinceX = FinancialService.getIsLowestSinceX(currentPairPrice, theBestItemToBeBoughtNow.pair)
    //         const averagePairPrice = FinancialService.getTheAverage(theBestItemToBeBoughtNow.historicPrices)

    //         const deltaToAverageInPercent = (currentPairPrice * 100 / averagePairPrice) - 100

    //     }

    // }

    public static async adjustLeverageEffect(accountData: any, binanceConnector: any): Promise<void> {

        const leverageEntries = await binanceConnector.futuresLeverageBracket()

        for (const p of accountData.positions) {
            if (p.positionAmt > 0) {

                const leverageInfo = leverageEntries.filter((e: any) => e.symbol == p.symbol)[0]
                if (leverageInfo !== undefined) {
                    console.log(p.symbol)

                    const maxLeverageForPosition: any = leverageEntries.filter((e: any) => e.symbol === p.symbol)[0].brackets[0].initialLeverage
                    console.log(`adjusting leverage of ${p.symbol} to ${maxLeverageForPosition}`)
                    await binanceConnector.futuresLeverage(p.symbol, maxLeverageForPosition)
                } else {
                    console.log(p.symbol)
                }
            }
        }
    }

    public static updatePriceHistoryOfPortfolio(currentPrices: any[]) {
        for (const entry of FinancialService.portfolio) {
            const currentPairPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === entry.pair)[0].price)
            if (entry.historicPrices.length === FinancialService.historicPricesLength) {
                entry.historicPrices.splice(entry.historicPrices.length - 1, 1)
            }
            entry.historicPrices.unshift(currentPairPrice)
        }
    }

    public static investigateTheLeastSuccessfulPosition(accountData1: any, accountData2: any) {

        let lowestPNLSoFar = 1000000000
        let theLeastSuccessfulPositionSoFar: any
        let leastSuccessfulPositionIsInAccount = 0
        for (const position of accountData1.positions) {

            const pnlInPercent = (position.unrealizedProfit * 100) / position.initialMargin

            if (pnlInPercent < lowestPNLSoFar) {
                theLeastSuccessfulPositionSoFar = position
                lowestPNLSoFar = pnlInPercent
                leastSuccessfulPositionIsInAccount = 1
            }
        }

        for (const position of accountData2.positions) {

            const pnlInPercent = (position.unrealizedProfit * 100) / position.initialMargin

            if (pnlInPercent < lowestPNLSoFar) {
                theLeastSuccessfulPositionSoFar = position
                lowestPNLSoFar = pnlInPercent
                leastSuccessfulPositionIsInAccount = 2
            }
        }

        return { theLeastSuccessfulPosition: theLeastSuccessfulPositionSoFar, leastSuccessfulPositionIsInAccount }

    }

    public static async ensureHedgesAreInShape(binanceConnector: any, currentPrices: any[], accountData: any): Promise<void> {

        const accountId = binanceConnector.getAccountId()
        const marginDelta = FinancialService.getInitialMarginDelta(accountData)
        const accountMode = FinancialService.getAccountMode(accountData)
        const marginRatio = (Number(accountData.totalMaintMargin) * 100) / Number(accountData.totalMarginBalance)
        const currentBitcoinPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === 'BTCUSDT')[0].price)

        const prediction = FinancialService.getPrediction(currentBitcoinPrice)

        // let pnlInPercent = (etherPosition.unrealizedProfit * 100) / etherPosition.initialMargin
        console.log(`${accountId}: accountMode: ${accountMode} - marginRatio: ${marginRatio} - accountMode: ${accountMode} - prediction: ${prediction} - marginDelta: ${marginDelta}`)

        if (marginRatio < 36) {

            if ((accountMode === 'short' && prediction === 'up') || marginDelta < - 20) {
                await FinancialService.buyTheBestOpportunity(binanceConnector, currentPrices, accountData)
            }

            if ((accountMode === 'long' && prediction === 'down') || marginDelta > 20) {
                await FinancialService.sellTheBestOpportunity(binanceConnector, currentPrices, accountData)
            }
        } else {
            console.log(`${accountId}: I can't adjust the hedge atm as the margin ratio (${marginRatio}) is above 36`)
        }
    }

    public static getPrediction(currentBTCPrice: number) {
        const bitCoinPortfolioItem = FinancialService.portfolio
            .filter((e) => e.pair === 'BTCUSDT')[0
        ]

        const lowestSinceX = FinancialService.getIsLowestSinceX(currentBTCPrice, 'BTCUSDT', FinancialService.portfolio)
        const highestSinceX = FinancialService.getIsHighestSinceX(currentBTCPrice, 'BTCUSDT', FinancialService.portfolio)

        const averageBTCPrice = FinancialService.getTheAverage(bitCoinPortfolioItem.historicPrices)

        const deltaToAverageInPercent = (currentBTCPrice * 100 / averageBTCPrice) - 100

        if (deltaToAverageInPercent < - 10 || lowestSinceX > 27) {
            return 'up'
        }

        if (deltaToAverageInPercent > 10 || highestSinceX > 27) {
            return 'down'
        }

        return 'stay'

    }

    public static updatePriceHistory(currentPrices: any[]) {
        for (const entry of FinancialService.buyLowSellHighPortfolio) {
            const currentPairPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === entry.pair)[0].price)
            if (entry.historicPrices.length === FinancialService.historicPricesLength) {
                entry.historicPrices.splice(entry.historicPrices.length - 1, 1)
            }
            entry.historicPrices.unshift(currentPairPrice)
        }

        for (const entry of FinancialService.shortPortfolio) {
            const currentPairPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === entry.pair)[0].price)
            if (entry.historicPrices.length === FinancialService.historicPricesLength) {
                entry.historicPrices.splice(entry.historicPrices.length - 1, 1)
            }
            entry.historicPrices.unshift(currentPairPrice)
        }

    }

    public static getIsLowestSinceX(price: number, pair: string, portfolio: IPortfolio[]) {
        let counter = 0

        const entry = portfolio.filter((e: any) => e.pair === pair)[0]

        for (const e of entry.historicPrices) {
            if (price > e) {
                return counter
            }

            counter += 1
        }

        return counter
    }

    public static getIsHighestSinceX(price: number, pair: string, portfolio: IPortfolio[]) {
        let counter = 0

        const entry = portfolio.filter((e: any) => e.pair === pair)[0]

        for (const e of entry.historicPrices) {
            if (price < e) {
                return counter
            }

            counter += 1
        }

        return counter
    }

    public static async sellTheBestOpportunity(binanceConnector: BinanceConnector, currentPrices: any[], accountData: any) {

        const accountId = binanceConnector.getAccountId()

        const marginRatio = (Number(accountData.totalMaintMargin) * 100) / Number(accountData.totalMarginBalance)

        const theBestItemToBeSoldNow = FinancialService.getPortfolioItemWithHighestHighestSinceX(currentPrices) as any
        const currentPairPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === theBestItemToBeSoldNow.pair)[0].price)
        const highestSinceX = FinancialService.getIsHighestSinceX(currentPairPrice, theBestItemToBeSoldNow.pair, FinancialService.portfolio)
        const averagePairPrice = FinancialService.getTheAverage(theBestItemToBeSoldNow.historicPrices)

        const deltaToAverageInPercent = (currentPairPrice * 100 / averagePairPrice) - 100

        console.log(`${accountId}: theBestPairToBeSoldtNow: ${theBestItemToBeSoldNow.pair} - currentPairPrice: ${currentPairPrice} = highestSinceX: ${highestSinceX} - deltaToAverageInPercent: ${deltaToAverageInPercent}`)

        const position = accountData.positions.filter((i: any) => i.symbol === theBestItemToBeSoldNow.pair)[0]

        let tradingAmount = 0
        let maxAmount = 0

        if (currentPairPrice > 1000) {
            tradingAmount = 0.01
            maxAmount = 1
        } else if (currentPairPrice > 100) {
            tradingAmount = 0.1
            maxAmount = 10
        } else if (currentPairPrice > 10) {
            tradingAmount = 1
            maxAmount = 100
        } else if (currentPairPrice > 1) {
            tradingAmount = 10
            maxAmount = 1000
        } else {
            tradingAmount = 100
            maxAmount = 10000
        }

        if (marginRatio < 36 && Number(position.positionAmt) < maxAmount) {

            console.log(`${accountId}: I sell ${tradingAmount} of ${theBestItemToBeSoldNow.pair} - limit would be ${maxAmount}`)

            await binanceConnector.sellFuture(theBestItemToBeSoldNow.pair, tradingAmount)

        } else {

            console.log(`${accountId}: an important hedge sell prerequisite has not been met`)

        }
    }

    public static async buyTheBestOpportunity(binanceConnector: BinanceConnector, currentPrices: any[], accountData: any) {

        const accountId = binanceConnector.getAccountId()

        const marginRatio = (Number(accountData.totalMaintMargin) * 100) / Number(accountData.totalMarginBalance)

        const theBestItemToBeBoughtNow = FinancialService.getPortfolioItemWithHighestLowestSinceX(currentPrices) as any

        const currentPairPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === theBestItemToBeBoughtNow.pair)[0].price)
        const lowestSinceX = FinancialService.getIsLowestSinceX(currentPairPrice, theBestItemToBeBoughtNow.pair, FinancialService.portfolio)
        const averagePairPrice = FinancialService.getTheAverage(theBestItemToBeBoughtNow.historicPrices)

        const deltaToAverageInPercent = (currentPairPrice * 100 / averagePairPrice) - 100

        console.log(`${accountId}: theBestPairToBeBoughtNow: ${theBestItemToBeBoughtNow.pair} - currentPairPrice: ${currentPairPrice} = lowestSince: ${lowestSinceX} - deltaToAverageInPercent: ${deltaToAverageInPercent}`)

        const position = accountData.positions.filter((i: any) => i.symbol === theBestItemToBeBoughtNow.pair)[0]

        let tradingAmount = 0
        let maxAmount = 0

        if (currentPairPrice > 1000) {
            tradingAmount = 0.01
            maxAmount = 1
        } else if (currentPairPrice > 100) {
            tradingAmount = 0.1
            maxAmount = 10
        } else if (currentPairPrice > 10) {
            tradingAmount = 1
            maxAmount = 100
        } else if (currentPairPrice > 1) {
            tradingAmount = 10
            maxAmount = 1000
        } else {
            tradingAmount = 100
            maxAmount = 10000
        }

        if (marginRatio < 36 && Number(position.positionAmt) < maxAmount) {

            console.log(`${accountId}: I buy ${tradingAmount} of ${theBestItemToBeBoughtNow.pair} - limit would be ${maxAmount}`)

            await binanceConnector.buyFuture(theBestItemToBeBoughtNow.pair, tradingAmount)

        } else {

            console.log(`${accountId}: an important hedge buy prerequisite has not been met`)

        }
    }

    public static getTradingAmountFromPrice(price: number): number {

        if (price > 1000) { return 0.01 }
        if (price > 100) { return 0.1 }
        if (price > 60) { return 0.7 }
        if (price > 10) { return 1 }
        if (price > 1) { return 10 }

        return 100

    }

    public static getMaxiAmountFromPrice(price: number): number {

        if (price > 1000) { return 1 }
        if (price > 100) { return 10 }
        if (price > 10) { return 100 }
        if (price > 1) { return 1000 }

        return 10000

    }

    public static async buyLowSellHigh(closingAt: any, binanceConnector: BinanceConnector, currentPrices: any[], accountData: any) {

        const accountId = binanceConnector.getAccountId()
        const lowestSinceXBuyTrigger = 27

        const marginRatio = (Number(accountData.totalMaintMargin) * 100) / Number(accountData.totalMarginBalance)

        const theBestItemToBeBoughtNow = FinancialService.getPortfolioItemWithHighestLowestSinceX(currentPrices) as any
        const currentPairPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === theBestItemToBeBoughtNow.pair)[0].price)
        const lowestSinceX = FinancialService.getIsLowestSinceX(currentPairPrice, theBestItemToBeBoughtNow.pair, FinancialService.portfolio)
        const averagePairPrice = FinancialService.getTheAverage(theBestItemToBeBoughtNow.historicPrices)

        const deltaToAverageInPercent = (currentPairPrice * 100 / averagePairPrice) - 100

        console.log(`${accountId}: theBestPairToBeBoughtNow: ${theBestItemToBeBoughtNow.pair} - currentPairPrice: ${currentPairPrice} = lowestSince: ${lowestSinceX} - deltaToAverageInPercent: ${deltaToAverageInPercent}`)

        const position = accountData.positions.filter((i: any) => i.symbol === theBestItemToBeBoughtNow.pair)[0]

        let tradingAmount = 0
        let maxAmount = 0

        if (currentPairPrice > 1000) {
            tradingAmount = 0.01
            maxAmount = 1
        } else if (currentPairPrice > 100) {
            tradingAmount = 0.1
            maxAmount = 10
        } else if (currentPairPrice > 10) {
            tradingAmount = 1
            maxAmount = 100
        } else if (currentPairPrice > 1) {
            tradingAmount = 10
            maxAmount = 1000
        } else {
            tradingAmount = 100
            maxAmount = 10000
        }

        if (lowestSinceX > lowestSinceXBuyTrigger && marginRatio < 27 && Number(position.positionAmt) < maxAmount && deltaToAverageInPercent < 0) {

            console.log(`${accountId}: I buy ${tradingAmount} of ${theBestItemToBeBoughtNow.pair} - limit would be ${maxAmount}`)

            await binanceConnector.buyFuture(theBestItemToBeBoughtNow.pair, tradingAmount)

        }

        await FinancialService.sellAllBuyLowSellHighPositionsWithAPNLOfHigherThan(closingAt, accountData, binanceConnector)
    }

    private static getPortfolioItemWithHighestLowestSinceX(currentPrices: any) {
        let matchingEntry
        let highestLowestSinceX = 0

        for (const entry of FinancialService.portfolio) {
            const currentPairPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === entry.pair)[0].price)
            const hmm = FinancialService.getIsLowestSinceX(currentPairPrice, entry.pair, FinancialService.portfolio)

            // console.log(`hmm: ${hmm}`)
            if (hmm > highestLowestSinceX) {
                matchingEntry = entry
                highestLowestSinceX = hmm
            }

        }

        return matchingEntry
    }

    private static getPortfolioItemWithHighestHighestSinceX(currentPrices: any) {

        let matchingEntry
        let highestHighestSinceX = 0

        for (const entry of FinancialService.portfolio) {
            const currentPairPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === entry.pair)[0].price)
            const hmm = FinancialService.getIsHighestSinceX(currentPairPrice, entry.pair, FinancialService.portfolio)

            if (hmm > highestHighestSinceX) {
                matchingEntry = entry
                highestHighestSinceX = hmm
            }

        }

        return matchingEntry
    }
}
