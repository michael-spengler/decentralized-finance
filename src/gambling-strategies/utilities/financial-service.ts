// tslint:disable-next-line: no-unnecessary-class

import { BinanceConnector } from "../../binance/binance-connector"

export interface IPortfolio {
    pair: string
    decimalPlaces: number
    historicPrices: number[]
}
// tslint:disable-next-line: no-unnecessary-class
export class FinancialService {

    public static singletonInstance: any
    private static readonly buyLowSellHighPortfolio: IPortfolio[] = []
    private static readonly historicPricesLength = 45000

    public static initializeBuyLowSellHighShortPortfolio(): void {
        console.log(`dynamically add those assets which fell recently fell out of the top ten and which are not contained in the long portfolio`)

        const excludeList = ["ETHUSDT", "BTCUSDT", "LINKUSDT", "BATUSDT"] // add the hard coded ... longportfolio items in this exclude list
    }


    public static initializeBuyLowSellHighLongPortfolio(): void {

        FinancialService.buyLowSellHighPortfolio.push({ pair: "UNIUSDT", decimalPlaces: 0, historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "XMRUSDT", decimalPlaces: 2, historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "COMPUSDT", decimalPlaces: 2, historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "MANAUSDT", decimalPlaces: 0, historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "AAVEUSDT", decimalPlaces: 1, historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "DOTUSDT", decimalPlaces: 1, historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "ADAUSDT", decimalPlaces: 0, historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "AVAXUSDT", decimalPlaces: 0, historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "EGLDUSDT", decimalPlaces: 1, historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "RENUSDT", decimalPlaces: 0, historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "SOLUSDT", decimalPlaces: 0, historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "LUNAUSDT", decimalPlaces: 0, historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "TRXUSDT", decimalPlaces: 0, historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "VETUSDT", decimalPlaces: 0, historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "XLMUSDT", decimalPlaces: 0, historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "FILUSDT", decimalPlaces: 1, historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "LTCUSDT", decimalPlaces: 2, historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "MKRUSDT", decimalPlaces: 2, historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "SNXUSDT", decimalPlaces: 1, historicPrices: [] })
        FinancialService.buyLowSellHighPortfolio.push({ pair: "THETAUSDT", decimalPlaces: 1, historicPrices: [] })

    }
    public static async closeAllOpenPositions(accountData: any, binanceConnector: any): Promise<void> {
        await FinancialService.sellAllLongPositions(accountData, binanceConnector)
        await FinancialService.buyBackAllShortPositions(
            accountData,
            binanceConnector,
        )
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

    public static updateBuyLowSellHighPortfolio(currentPrices: any[]) {
        console.log(`updateBuyLowSellHighPortfolio`)
        for (const entry of FinancialService.buyLowSellHighPortfolio) {
            const currentPairPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === entry.pair)[0].price)
            if (entry.historicPrices.length === FinancialService.historicPricesLength) {
                entry.historicPrices.splice(entry.historicPrices.length - 1, 1)
            }
            entry.historicPrices.unshift(currentPairPrice)
        }

    }

    public static getPortfolio() {
        return FinancialService.buyLowSellHighPortfolio
    }

    public static getIsLowestSinceX(price: number, pair: string) {
        let counter = 0

        const entry = FinancialService.buyLowSellHighPortfolio.filter((e: any) => e.pair === pair)[0]

        for (const e of entry.historicPrices) {
            if (price > e) {
                return counter
            }

            counter += 1
        }

        return counter
    }

    public static getIsHighestSinceX(price: number, pair: string) {
        let counter = 0

        const entry = FinancialService.buyLowSellHighPortfolio.filter((e: any) => e.pair === pair)[0]

        for (const e of entry.historicPrices) {
            if (price < e) {
                return counter
            }

            counter += 1
        }

        return counter
    }

    public static async buyLowSellHigh(closingAt: any, binanceConnector: BinanceConnector, currentPrices: any[], accountData: any) {

        const accountId = binanceConnector.getAccountId()
        console.log(`${accountId}: buy low sell high`)
        const lowestSinceXBuyTrigger = 27
        FinancialService.updateBuyLowSellHighPortfolio(currentPrices)

        const marginRatio = (Number(accountData.totalMaintMargin) * 100) / Number(accountData.totalMarginBalance)

        const theBestItemToBeBoughtNow = FinancialService.getPortfolioItemWithHighestLowestSinceX(currentPrices) as any
        const currentPairPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === theBestItemToBeBoughtNow.pair)[0].price)
        const lowestSinceX = FinancialService.getIsLowestSinceX(currentPairPrice, theBestItemToBeBoughtNow.pair)

        console.log(`${accountId}: theBestPairToBeBoughtNow: ${theBestItemToBeBoughtNow.pair}`)
        console.log(`${accountId}: currentPairPrice: ${currentPairPrice} = lowestSince: ${lowestSinceX}`)

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

        if (lowestSinceX > lowestSinceXBuyTrigger && marginRatio < 27 && Number(position.positionAmt) < maxAmount) {

            console.log(`${accountId}: I buy ${tradingAmount} of ${theBestItemToBeBoughtNow.pair} - limit would be ${maxAmount}`)

            await binanceConnector.buyFuture(theBestItemToBeBoughtNow.pair, tradingAmount)

        }

        await FinancialService.sellAllBuyLowSellHighPositionsWithAPNLOfHigherThan(closingAt, accountData, binanceConnector)
    }

    private static getPortfolioItemWithHighestLowestSinceX(currentPrices: any) {
        let matchingEntry
        let highestLowestSinceX = 0

        for (const entry of FinancialService.buyLowSellHighPortfolio) {
            const currentPairPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === entry.pair)[0].price)
            const hmm = FinancialService.getIsLowestSinceX(currentPairPrice, entry.pair)

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

        for (const entry of FinancialService.buyLowSellHighPortfolio) {
            const currentPairPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === entry.pair)[0].price)
            const hmm = FinancialService.getIsHighestSinceX(currentPairPrice, entry.pair)

            if (hmm > highestHighestSinceX) {
                matchingEntry = entry
                highestHighestSinceX = hmm
            }

        }

        return matchingEntry
    }
}
