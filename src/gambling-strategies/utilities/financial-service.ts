// tslint:disable-next-line: no-unnecessary-class
export class FinancialService {

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
        const marginRatio = (Number(accountData.totalMaintMargin) * 100) /
            Number(accountData.totalMarginBalance)
        const marginDelta = FinancialService.getInitialMarginDelta(accountData)
        const accountMode = FinancialService.getAccountMode(accountData)
        console.log(
            `${accountId}: usdtSpot: ${usdtSpotAccount} - bnbSpot: ${bnbSpotAccount} - mr: ${marginRatio} - marginDelta: ${marginDelta} - accountMode: ${accountMode}`,
        )

        if (marginRatio > 54 && usdtSpotAccount >= 10) {
            console.log(`I transfer ${10} USDT to the USDT Account 1 due to a margin ratio of ${marginRatio}`)
            await binanceConnector.transferFromSpotAccountToUSDTFutures(10)
        } else if (usdtSpotAccount < 100 && bnbSpotAccount > 0.2) {
            const currentPrices = await binanceConnector.getCurrentPrices()

            const currentBNBPrice = Number(
                currentPrices.filter((e: any) => e.coinSymbol === "BNBUSDT")[0].price,
            )

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
}
