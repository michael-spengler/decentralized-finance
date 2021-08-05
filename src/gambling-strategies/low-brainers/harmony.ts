import { BinanceConnector } from "../../binance/binance-connector"
import { BinanceConnectorDouble } from "../../binance/binance-connector-double"
import { CryptoMeterConnector } from "../../cryptometer/cryptometer-connector"
import { Indicator } from "../utilities/indicator"

export class Harmony {

    private binanceConnector: BinanceConnector
    private intervalLengthInSeconds = 9
    private investmentPair = 'BTCUSDT'
    private hedgePair = 'DOGEUSDT'
    private targetInvestmentAmount = 0.003
    private targetHedgePositionAmount = 0
    private historicEtherPrices: number[] = []
    private historicPricesLength = 45000
    private initialBitcoinPrice = 0
    private initialHedgePrice = 0
    private previousPriceDeltaDifference = 0
    private indicator: Indicator
    private sellingAt = 0
    private marginRatio = 0


    public constructor(binanceConnector: BinanceConnector, private cryptoMeterConnector: CryptoMeterConnector) {
        this.binanceConnector = binanceConnector
        this.cryptoMeterConnector = cryptoMeterConnector
        this.indicator = new Indicator()

    }

    public flow() {

        setInterval(async () => {

            const randomDelayInSeconds = Math.floor(Math.random() * ((this.intervalLengthInSeconds - 5) - 2 + 1) + 2)

            this.sellingAt = (Math.floor(Math.random() * (27 - 18 + 1) + 18))

            setTimeout(async () => {

                const accountData = await this.binanceConnector.getFuturesAccountData()
                const currentPrices = await this.binanceConnector.getCurrentPrices()

                this.marginRatio = Number(accountData.totalMaintMargin) * 100 / Number(accountData.totalMarginBalance)

                if (Number(accountData.availableBalance) > 100) {
                    await this.binanceConnector.transferFromUSDTFuturesToSpotAccount(Number(accountData.availableBalance) - 100)
                }

                await this.exploitTheBadAssStretch(accountData, currentPrices)

                await this.exploitEtherManipulators(accountData, currentPrices)

                await this.hoddleSavely(accountData)

            }, 1000 * randomDelayInSeconds)

        }, 1000 * this.intervalLengthInSeconds)

    }

    private async exploitTheBadAssStretch(accountData: any, currentPrices: any[]) {

        const currentBitcoinPrice: number = currentPrices.filter((e: any) => e.coinSymbol === this.investmentPair)[0].price
        const currentHedgePrice: number = currentPrices.filter((e: any) => e.coinSymbol === this.hedgePair)[0].price
        const bitcoinPosition = accountData.positions.filter((entry: any) => entry.symbol === this.investmentPair)[0]
        const hedgePosition = accountData.positions.filter((entry: any) => entry.symbol === this.hedgePair)[0]
        const bitcoinProfitInPercent = (bitcoinPosition.unrealizedProfit * 100) / bitcoinPosition.initialMargin
        const hedgeProfitInPercent = (hedgePosition.unrealizedProfit * 100) / hedgePosition.initialMargin
        const unrealizedProfitInPercent = (Number(accountData.totalUnrealizedProfit) * 100) / Number(accountData.totalInitialMargin)

        if (this.initialBitcoinPrice === 0) this.initialBitcoinPrice = currentBitcoinPrice
        if (this.initialHedgePrice === 0) this.initialHedgePrice = currentHedgePrice

        const bitcoinPriceDeltaInPercent = ((currentBitcoinPrice * 100) / this.initialBitcoinPrice) - 100
        const hedgePriceDeltaInPercent = ((currentHedgePrice * 100) / this.initialHedgePrice) - 100
        const priceDeltaDifference = hedgePriceDeltaInPercent - bitcoinPriceDeltaInPercent

        // const pnlFromBitcoinPosition = Number(bitcoinPosition.entryPrice) * Number(bitcoinPosition.unrealizedProfit)
        // const pnlFromHedgePosition = Number(hedgePosition.entryPrice) * Number(hedgePosition.unrealizedProfit)

        const pnlFromBitcoinPosition = Number(bitcoinPosition.unrealizedProfit)
        const pnlFromHedgePosition = Number(hedgePosition.unrealizedProfit)

        console.log(`\n*******exploitTheBadAssStretch**********\npnlFromBitcoinPosition: ${pnlFromBitcoinPosition} - pnlFromHedgePosition: ${pnlFromHedgePosition}`)

        const pnlFromBadAssStretch = pnlFromBitcoinPosition + pnlFromHedgePosition
        const investedAmountInBadAssStretch = Number(bitcoinPosition.initialMargin) + Number(hedgePosition.initialMargin)

        const pnlFromBadAssStretchInPercent = (pnlFromBadAssStretch * 100 / investedAmountInBadAssStretch)
        console.log(`pnlFromBitcoinPosition: ${pnlFromBitcoinPosition} - pnlFromHedgePosition: ${pnlFromHedgePosition} - pnlFromBadAssStretchInPercent: ${pnlFromBadAssStretchInPercent} - unrealizedProfitInPercent: ${unrealizedProfitInPercent} `)

        console.log(`initialBitcoinPrice: ${this.initialBitcoinPrice} - currentBitcoinPrice: ${currentBitcoinPrice} --> bitcoinPriceDeltaInPercent: ${bitcoinPriceDeltaInPercent}`)
        console.log(`initialHedgePrice: ${this.initialHedgePrice} - currentHedgePrice: ${currentHedgePrice} --> hedgePriceDeltaInPercent: ${hedgePriceDeltaInPercent}`)

        console.log(`priceDeltaDifference: ${priceDeltaDifference}`)

        this.targetHedgePositionAmount = Number(((this.targetInvestmentAmount / currentHedgePrice) * currentBitcoinPrice).toFixed(0))

        const sellingBadAssStretchAt = (this.marginRatio > 18) ? this.sellingAt / 3 : this.sellingAt

        if (pnlFromBadAssStretchInPercent > sellingBadAssStretchAt || this.marginRatio > 72) {

            console.log(`closing the deal with an unrealizedProfitInPercent of ${unrealizedProfitInPercent}%`)

            const responseInvestment = await this.binanceConnector.sellFuture(this.investmentPair, Number(bitcoinPosition.positionAmt))
            console.log(responseInvestment)

            const responseHedge = await this.binanceConnector.buyFuture(this.hedgePair, Number(hedgePosition.positionAmt) * -1)
            console.log(responseHedge)

        } else {

            if (Number(bitcoinPosition.positionAmt) < this.targetInvestmentAmount) {

                console.log(`initializing the bad ass stretch game`)

                const bitcoinDelta = this.targetInvestmentAmount - Number(bitcoinPosition.positionAmt)
                console.log(`I buy ${bitcoinDelta} BTC`)
                const responseInvestment = await this.binanceConnector.buyFuture(this.investmentPair, bitcoinDelta)
                console.log(responseInvestment)
                this.initialBitcoinPrice = currentBitcoinPrice

                console.log(`I sell ${this.targetHedgePositionAmount} ${this.hedgePair} to establish the hedge`)
                const responseHedge = await this.binanceConnector.sellFuture(this.hedgePair, this.targetHedgePositionAmount)
                console.log(responseHedge)
                this.initialHedgePrice = currentHedgePrice

            }

            if ((bitcoinPriceDeltaInPercent < hedgePriceDeltaInPercent) || (hedgeProfitInPercent < 0 && bitcoinProfitInPercent < 0)) {
                console.log(`thug life :) --> bitcoinPriceDeltaInPercent: ${bitcoinPriceDeltaInPercent} vs. hedgePriceDeltaInPercent: ${hedgePriceDeltaInPercent}`)

                console.log(`previousPriceDeltaDifference: ${this.previousPriceDeltaDifference} vs. priceDeltaDifference: ${priceDeltaDifference}`)

                if (priceDeltaDifference > this.previousPriceDeltaDifference && priceDeltaDifference > 0.18 && this.marginRatio < 45) {

                    await this.binanceConnector.buyFuture(this.investmentPair, this.targetInvestmentAmount)

                    await this.binanceConnector.sellFuture(this.hedgePair, this.targetHedgePositionAmount)

                }

            }

            this.previousPriceDeltaDifference = priceDeltaDifference

        }


    }

    private async exploitEtherManipulators(accountData: any, currentPrices: any[]): Promise<void> {

        const etherPosition = accountData.positions.filter((entry: any) => entry.symbol === 'ETHUSDT')[0]
        const currentEtherPrice: number = currentPrices.filter((e: any) => e.coinSymbol === 'ETHUSDT')[0].price

        if (this.historicEtherPrices.length === this.historicPricesLength) {
            this.historicEtherPrices.splice(this.historicEtherPrices.length - 1, 1)
        }
        this.historicEtherPrices.unshift(currentEtherPrice)

        const lowestSinceX = this.getIsLowestEtherPriceSinceX(currentEtherPrice)
        const highestSinceX = this.getIsHighestEtherPriceSinceX(currentEtherPrice)

        console.log(`\n********applyBuyLowSellHigh*************\ncurrent: ${currentEtherPrice} (${Number(etherPosition.unrealizedProfit)}) - lowestSinceX: ${lowestSinceX} - highestSinceX: ${highestSinceX} - marginRatio: ${this.marginRatio}`)

        const orderBook = await this.binanceConnector.getOrderbook('ETHBTC')

        const bidsAndAsks = this.indicator.getAmountOfBidsAndAsksFromOrderbook(orderBook)
        console.log(bidsAndAsks)

        const bidsAndAsksDeltaInPercent = this.indicator.getBidsAndAsksDeltaInPercent(bidsAndAsks)
        console.log(`bidsAndAsksDeltaInPercent: ${bidsAndAsksDeltaInPercent}`)

        const pnlFromEtherPositionInPercent = Number(etherPosition.unrealizedProfit) * 100 / Number(etherPosition.initialMargin)

        console.log(`pnlFromEtherPositionInPercent: ${pnlFromEtherPositionInPercent}`)

        const averageEtherPrice = this.getTheAverage(this.historicEtherPrices)
        const deltaToAverageInPercent = (currentEtherPrice * 100 / averageEtherPrice) - 100
        const calculated = averageEtherPrice + (averageEtherPrice * (deltaToAverageInPercent / 100))

        console.log(`averageEtherPrice2Days: ${averageEtherPrice} - current: ${currentEtherPrice} - deltaToAverageInPercent: ${deltaToAverageInPercent} - calculated: ${calculated}`)

        if (currentEtherPrice > averageEtherPrice) {

            console.log(`I need to wait as the averageEtherPrice is ${averageEtherPrice} and the current Ether price is ${currentEtherPrice}`)
        } else {
            if (lowestSinceX > 45 || highestSinceX > 72) {

                if (lowestSinceX > 45) {

                    if ((this.marginRatio > 70 && Number(etherPosition.positionAmt) > 0.01)) {

                        console.log(`things went south. I sell most of my ether position with a pnl of: ${pnlFromEtherPositionInPercent}%`)

                        await this.binanceConnector.sellFuture('ETHUSDT', Number(Number(etherPosition.positionAmt).toFixed(2)) - 0.01)

                    } else if (this.marginRatio > 55 && Number(etherPosition.positionAmt) > 0.01) {

                        console.log(`I need to sell 0.01 of my ether position with a pnl of: ${pnlFromEtherPositionInPercent}%`)

                        await this.binanceConnector.sellFuture('ETHUSDT', 0.01)

                    } else if (this.marginRatio < 27 && bidsAndAsksDeltaInPercent < - 27) {

                        let amountToBeBought = Number((0.01 * Number((lowestSinceX / 100).toFixed(0))).toFixed(2)) + 0.01

                        console.log(`amountToBeBought before potential correction: ${amountToBeBought}`)

                        if (amountToBeBought > 3 - Number(etherPosition.positionAmt)) {
                            amountToBeBought = 3 - Number(etherPosition.positionAmt)
                        }

                        console.log(`amountToBeBought after potential correction: ${amountToBeBought}`)

                        console.log(`Buying ${amountToBeBought} Ether`)
                        const responseBuyEther = await this.binanceConnector.buyFuture('ETHUSDT', amountToBeBought)
                        console.log(responseBuyEther)

                    }

                } else if (highestSinceX > 72 && pnlFromEtherPositionInPercent > this.sellingAt && Number(etherPosition.positionAmt) > 0.01) {

                    let amountToBeSold = Number((0.02 * Number((highestSinceX / 10).toFixed(0))).toFixed(2))

                    console.log(`amountToBeSold before potential Correction: ${amountToBeSold}`)
                    if (amountToBeSold > Number(etherPosition.positionAmt) - 0.01) {
                        amountToBeSold = Number(etherPosition.positionAmt) - 0.01
                    }

                    console.log(`amountToBeSold after potential Correction: ${amountToBeSold}`)

                    console.log(`Selling ${amountToBeSold} Ether`)
                    const responseSellEther = await this.binanceConnector.sellFuture('ETHUSDT', amountToBeSold)
                    console.log(responseSellEther)
                }
            }

        }

    }

    private getTheAverage(list: number[]): number {

        let sum = 0
        for (const e of list) {
            sum = sum + Number(e)
        }

        return sum / list.length
    }

    private async hoddleSavely(accountData: any) {

        const bnbPosition = accountData.positions.filter((entry: any) => entry.symbol === 'BNBUSDT')[0]
        const xmrPosition = accountData.positions.filter((entry: any) => entry.symbol === 'XMRUSDT')[0]
        const adaPosition = accountData.positions.filter((entry: any) => entry.symbol === 'ADAUSDT')[0]
        const linkPosition = accountData.positions.filter((entry: any) => entry.symbol === 'LINKUSDT')[0]
        const batPosition = accountData.positions.filter((entry: any) => entry.symbol === 'BATUSDT')[0]
        const compPosition = accountData.positions.filter((entry: any) => entry.symbol === 'COMPUSDT')[0]
        const manaPosition = accountData.positions.filter((entry: any) => entry.symbol === 'MANAUSDT')[0]
        // const dotPosition = accountData.positions.filter((entry: any) => entry.symbol === 'DOTUSDT')[0]
        // const aavePosition = accountData.positions.filter((entry: any) => entry.symbol === 'AAVEUSDT')[0]
        // const lunaPosition = accountData.positions.filter((entry: any) => entry.symbol === 'LUNAUSDT')[0]
        // const filPosition = accountData.positions.filter((entry: any) => entry.symbol === 'FILUSDT')[0]
        // const uniPosition = accountData.positions.filter((entry: any) => entry.symbol === 'UNIUSDT')[0]
        // const egldPosition = accountData.positions.filter((entry: any) => entry.symbol === 'EGLDUSDT')[0]

        const bnbPNLInPercent = (bnbPosition.unrealizedProfit * 100) / bnbPosition.initialMargin
        const xmrPNLInPercent = (xmrPosition.unrealizedProfit * 100) / xmrPosition.initialMargin
        const adaPNLInPercent = (adaPosition.unrealizedProfit * 100) / adaPosition.initialMargin
        const linkPNLInPercent = (linkPosition.unrealizedProfit * 100) / linkPosition.initialMargin
        const batPNLInPercent = (batPosition.unrealizedProfit * 100) / batPosition.initialMargin
        const compPNLInPercent = (compPosition.unrealizedProfit * 100) / compPosition.initialMargin
        const manaPNLInPercent = (manaPosition.unrealizedProfit * 100) / manaPosition.initialMargin
        // const dotPNLInPercent = (dotPosition.unrealizedProfit * 100) / dotPosition.initialMargin
        // const aavePNLInPercent = (aavePosition.unrealizedProfit * 100) / aavePosition.initialMargin
        // const lunaPNLInPercent = (lunaPosition.unrealizedProfit * 100) / lunaPosition.initialMargin
        // const filPNLInPercent = (filPosition.unrealizedProfit * 100) / filPosition.initialMargin
        // const uniPNLInPercent = (uniPosition.unrealizedProfit * 100) / uniPosition.initialMargin
        // const egldPNLInPercent = (egldPosition.unrealizedProfit * 100) / egldPosition.initialMargin

        console.log(`\n*********hoddleSavely*************\n - compPNLInPercent: ${compPNLInPercent}`)
        // console.log(Number(xmrPosition.positionAmt))
        if (this.marginRatio < 27) {
            if (Number(bnbPosition.positionAmt) < 0.27 || bnbPNLInPercent > 100) {
                await this.binanceConnector.buyFuture('BNBUSDT', 0.27)
            } else if (Number(xmrPosition.positionAmt) < 0.27 || xmrPNLInPercent > 100) {
                await this.binanceConnector.buyFuture('XMRUSDT', 0.27)
            } else if (Number(adaPosition.positionAmt) < 27 || adaPNLInPercent > 100) {
                await this.binanceConnector.buyFuture('ADAUSDT', 27)
            } else if (Number(linkPosition.positionAmt) < 2.7 || linkPNLInPercent > 100) {
                await this.binanceConnector.buyFuture('LINKUSDT', 2.7)
            } else if (Number(batPosition.positionAmt) < 27 || batPNLInPercent > 100) {
                await this.binanceConnector.buyFuture('BATUSDT', 27)
            } else if (Number(compPosition.positionAmt) < 0.027 || compPNLInPercent > 100) {
                await this.binanceConnector.buyFuture('COMPUSDT', 0.027)
            } else if (Number(manaPosition.positionAmt) < 27 || manaPNLInPercent > 100) {
                await this.binanceConnector.buyFuture('MANAUSDT', 27)
                // } else if (Number(dotPosition.positionAmt) < 2.7 || dotPNLInPercent > 100) {
                //     await this.binanceConnector.buyFuture('DOTUSDT', 2.7)
                // } else if (Number(aavePosition.positionAmt) < 2.7 || aavePNLInPercent > 100) {
                //     await this.binanceConnector.buyFuture('AAVEUSDT', 2.7)
                // } else if (Number(lunaPosition.positionAmt) < 3 || lunaPNLInPercent > 100) {
                //     await this.binanceConnector.buyFuture('LUNAUSDT', 3)
                // } else if (Number(filPosition.positionAmt) < 2.7 || filPNLInPercent > 100) {
                //     await this.binanceConnector.buyFuture('FILUSDT', 2.7)
                // } else if (Number(egldPosition.positionAmt) < 2.7 || egldPNLInPercent > 100) {
                //     const r = await this.binanceConnector.buyFuture('EGLDUSDT', 2.7)
                //     console.log(r)
                // } else if (Number(uniPosition.positionAmt) < 2.7 || uniPNLInPercent > 100) {
                //     const r = await this.binanceConnector.buyFuture('UNIUSDT', 2.7)
                //     console.log(r)
            }
        }

        if (bnbPNLInPercent < 27 && Number(bnbPosition.positionAmt) > 0.27) {
            await this.binanceConnector.sellFuture('BNBUSDT', Number(bnbPosition.positionAmt) - 0.27)
        }
        if (xmrPNLInPercent < 27 && Number(xmrPosition.positionAmt) > 0.27) {
            await this.binanceConnector.sellFuture('XMRUSDT', Number(xmrPosition.positionAmt) - 0.27)
        }
        if (adaPNLInPercent < 27 && Number(adaPosition.positionAmt) > 27) {
            await this.binanceConnector.sellFuture('ADAUSDT', Number(adaPosition.positionAmt) - 27)
        }
        if (linkPNLInPercent < 27 && Number(linkPosition.positionAmt) > 2.7) {
            await this.binanceConnector.sellFuture('LINKUSDT', Number(linkPosition.positionAmt) - 2.7)
        }
        if (batPNLInPercent < 27 && Number(batPosition.positionAmt) > 27) {
            await this.binanceConnector.sellFuture('BATUSDT', Number(batPosition.positionAmt) - 27)
        }
        if (compPNLInPercent < 27 && Number(compPosition.positionAmt) > 0.027) {
            const a = Number((Number(compPosition.positionAmt) - 0.027).toFixed(3))
            await this.binanceConnector.sellFuture('COMPUSDT', a)
        }
        if (manaPNLInPercent < 27 && Number(manaPosition.positionAmt) > 27) {
            await this.binanceConnector.sellFuture('MANAUSDT', Number(manaPosition.positionAmt) - 27)
        }
        // if (dotPNLInPercent < 27 && Number(dotPosition.positionAmt) > 2.7) {
        //     await this.binanceConnector.sellFuture('DOTUSDT', Number(dotPosition.positionAmt) - 2.7)
        // }
        // if (aavePNLInPercent < 27 && Number(aavePosition.positionAmt) > 2.7) {
        //     await this.binanceConnector.sellFuture('AAVEUSDT', Number(aavePosition.positionAmt) - 2.7)
        // }
        // if (lunaPNLInPercent < 27 && Number(lunaPosition.positionAmt) > 3) {
        //     await this.binanceConnector.sellFuture('LUNAUSDT', Number(lunaPosition.positionAmt) - 3)
        // }
        // if (uniPNLInPercent < 27 && Number(uniPosition.positionAmt) > 2.7) {
        //     await this.binanceConnector.sellFuture('UNIUSDT', Number(uniPosition.positionAmt) - 2.7)
        // }
        // if (filPNLInPercent < 27 && Number(filPosition.positionAmt) > 2.7) {
        //     await this.binanceConnector.sellFuture('FILUSDT', Number(filPosition.positionAmt) - 2.7)
        // }
        // if (egldPNLInPercent < 27 && Number(egldPosition.positionAmt) > 2.7) {
        //     await this.binanceConnector.sellFuture('EGLDUSDT', Number(egldPosition.positionAmt) - 2.7)
        // }

    }

    private getIsLowestEtherPriceSinceX(price: number) {
        let counter = 0

        for (const e of this.historicEtherPrices) {
            if (price > e) {
                return counter
            }
            counter++
        }
        return counter
    }

    private getIsHighestEtherPriceSinceX(price: number) {
        let counter = 0

        for (const e of this.historicEtherPrices) {
            if (price < e) {
                return counter
            }
            counter++
        }
        return counter
    }

}


const binanceApiKey = process.argv[2] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[3] // check your profile on binance.com --> API Management
const cryptoMeterAPIKey = process.argv[4]
const simulationMode = process.argv[5]
let binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)

if (simulationMode === 'X') {
    console.log(`injecting a test double via constructor injection in order to go to simulation mode`)
    binanceConnector = new BinanceConnectorDouble(binanceApiKey, binanceApiSecret) as any
}

let cryptometerConnector = new CryptoMeterConnector(cryptoMeterAPIKey)

const harmonie = new Harmony(binanceConnector, cryptometerConnector)
harmonie.flow()