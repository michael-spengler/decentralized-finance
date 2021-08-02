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
    private historicPricesLength = 100
    private initialBitcoinPrice = 0
    private initialHedgePrice = 0
    private previousPriceDeltaDifference = 0
    private indicator: Indicator



    public constructor(binanceConnector: BinanceConnector, private cryptoMeterConnector: CryptoMeterConnector) {
        this.binanceConnector = binanceConnector
        this.cryptoMeterConnector = cryptoMeterConnector
        this.indicator = new Indicator()

    }

    public flow() {

        setInterval(async () => {

            const randomDelayInSeconds = Math.floor(Math.random() * ((this.intervalLengthInSeconds - 5) - 2 + 1) + 2)

            setTimeout(async () => {

                const accountData = await this.binanceConnector.getFuturesAccountData()
                const currentPrices = await this.binanceConnector.getCurrentPrices()
    
                if (Number(accountData.availableBalance) > 500) {
                    await this.binanceConnector.transferFromUSDTFuturesToSpotAccount(Number(accountData.availableBalance) - 500)
                }

                await this.exploitTheBadAssStretch(accountData, currentPrices)

                await this.applyBuyLowSellHigh(accountData, currentPrices)

            }, 1000 * randomDelayInSeconds)

        }, 1000 * this.intervalLengthInSeconds)

    }

    private async exploitTheBadAssStretch(accountData: any, currentPrices: any[]) {

        const currentBitcoinPrice: number = currentPrices.filter((e: any) => e.coinSymbol === this.investmentPair)[0].price
        const currentHedgePrice: number = currentPrices.filter((e: any) => e.coinSymbol === this.hedgePair)[0].price
        const sellingAt = (Math.floor(Math.random() * (27 - 18 + 1) + 18))
        const bitcoinPosition = accountData.positions.filter((entry: any) => entry.symbol === this.investmentPair)[0]
        const hedgePosition = accountData.positions.filter((entry: any) => entry.symbol === this.hedgePair)[0]
        const bitcoinProfitInPercent = (bitcoinPosition.unrealizedProfit * 100) / bitcoinPosition.initialMargin
        const hedgeProfitInPercent = (hedgePosition.unrealizedProfit * 100) / hedgePosition.initialMargin
        const unrealizedProfitInPercent = (Number(accountData.totalunrealizedProfit) * 100) / Number(accountData.totalInitialMargin)


        if (this.initialBitcoinPrice === 0) this.initialBitcoinPrice = currentBitcoinPrice
        if (this.initialHedgePrice === 0) this.initialHedgePrice = currentHedgePrice

        const bitcoinPriceDeltaInPercent = ((currentBitcoinPrice * 100) / this.initialBitcoinPrice) - 100
        const hedgePriceDeltaInPercent = ((currentHedgePrice * 100) / this.initialHedgePrice) - 100
        const priceDeltaDifference = hedgePriceDeltaInPercent - bitcoinPriceDeltaInPercent

        // const pnlFromBitcoinPosition = Number(bitcoinPosition.entryPrice) * Number(bitcoinPosition.unrealizedProfit)
        // const pnlFromHedgePosition = Number(hedgePosition.entryPrice) * Number(hedgePosition.unrealizedProfit)

        const pnlFromBitcoinPosition = Number(bitcoinPosition.unrealizedProfit)
        const pnlFromHedgePosition = Number(hedgePosition.unrealizedProfit)

        console.log(`pnlFromBitcoinPosition: ${pnlFromBitcoinPosition}`)
        console.log(`pnlFromHedgePosition: ${pnlFromHedgePosition}`)

        const pnlFromBadAssStretch = pnlFromBitcoinPosition + pnlFromHedgePosition

        console.log(`pnlFromBadAssStretch: ${pnlFromBadAssStretch}`)

        console.log(`initialBitcoinPrice: ${this.initialBitcoinPrice} - currentBitcoinPrice: ${currentBitcoinPrice} --> bitcoinPriceDeltaInPercent: ${bitcoinPriceDeltaInPercent}`)
        console.log(`initialHedgePrice: ${this.initialHedgePrice} - currentHedgePrice: ${currentHedgePrice} --> hedgePriceDeltaInPercent: ${hedgePriceDeltaInPercent}`)

        console.log(`priceDeltaDifference: ${priceDeltaDifference}`)


        if ((((unrealizedProfitInPercent > sellingAt &&
            bitcoinPriceDeltaInPercent > hedgePriceDeltaInPercent) ||
            unrealizedProfitInPercent < - 54)) &&
            Number(bitcoinPosition.positionAmt) > 0 &&
            pnlFromBadAssStretch > 5) {

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
                const responseInvestment = await this.binanceConnector.buyFuture('BTCUSDT', bitcoinDelta)
                console.log(responseInvestment)
                this.initialBitcoinPrice = currentBitcoinPrice

                this.targetHedgePositionAmount = Number(((this.targetInvestmentAmount / currentHedgePrice) * currentBitcoinPrice).toFixed(0))
                console.log(`I sell ${this.targetHedgePositionAmount} ${this.hedgePair} to establish the hedge`)
                const responseHedge = await this.binanceConnector.sellFuture(this.hedgePair, this.targetHedgePositionAmount)
                console.log(responseHedge)
                this.initialHedgePrice = currentHedgePrice

            }

            if ((bitcoinPriceDeltaInPercent < hedgePriceDeltaInPercent) || (hedgeProfitInPercent < 0 && bitcoinProfitInPercent < 0)) {
                console.log(`thug life :) --> bitcoinPriceDeltaInPercent: ${bitcoinPriceDeltaInPercent} vs. hedgePriceDeltaInPercent: ${hedgePriceDeltaInPercent}`)

                console.log(`previousPriceDeltaDifference: ${this.previousPriceDeltaDifference} vs. priceDeltaDifference: ${priceDeltaDifference}`)

                if (priceDeltaDifference > this.previousPriceDeltaDifference && priceDeltaDifference > 0.027) {

                    const responseInvestment = await this.binanceConnector.buyFuture(this.investmentPair, this.targetInvestmentAmount)
                    console.log(responseInvestment)

                    const responseHedge = await this.binanceConnector.sellFuture(this.hedgePair, this.targetHedgePositionAmount)
                    console.log(responseHedge)

                }

            }

            this.previousPriceDeltaDifference = priceDeltaDifference

        }


    }

    private async applyBuyLowSellHigh(accountData: any, currentPrices: any[]): Promise<void> {

        const etherPosition = accountData.positions.filter((entry: any) => entry.symbol === 'ETHUSDT')[0]
        const currentEtherPrice: number = currentPrices.filter((e: any) => e.coinSymbol === 'ETHUSDT')[0].price

        if (this.historicEtherPrices.length === this.historicPricesLength) {
            this.historicEtherPrices.splice(this.historicEtherPrices.length - 1, 1)
        }
        this.historicEtherPrices.unshift(currentEtherPrice)

        const lowestSinceX = this.getIsLowestEtherPriceSinceX(currentEtherPrice)
        const highestSinceX = this.getIsHighestEtherPriceSinceX(currentEtherPrice)

        console.log(`current: ${currentEtherPrice} (lowestSinceX: ${lowestSinceX}) - (highestSinceX: ${highestSinceX})`)

        if (lowestSinceX > 50 || highestSinceX > 50) {

            const sellPressureFromCryptometer = (await this.cryptoMeterConnector.getTrendIndicators()).sell_pressure

            const orderBook = await this.binanceConnector.getOrderbook('ETHBTC')

            const bidsAndAsks = this.indicator.getAmountOfBidsAndAsksFromOrderbook(orderBook)
            console.log(bidsAndAsks)
            
            const currentETHPrice: number = currentPrices.filter((e: any) => e.coinSymbol === 'ETHUSDT')[0].price

            const bidsAndAsksDeltaInPercent = this.indicator.getBidsAndAsksDeltaInPercent(bidsAndAsks)
            console.log(`bidsAndAsksDeltaInPercent: ${bidsAndAsksDeltaInPercent}`)


            if (lowestSinceX > 50) {

               
                if (sellPressureFromCryptometer > 50 && bidsAndAsksDeltaInPercent < - 30) { // this might sound counterintuitive - in some respect you need to do the opposite of what 75 % of traders do

                    let amountToBeBought = 0.02 * Number((lowestSinceX / 10).toFixed(2))

                    console.log(`amountToBeBought before potential correction: ${amountToBeBought}`)
                    if (amountToBeBought > 2 - Number(etherPosition.positionAmt)) {
                        amountToBeBought = 2 - Number(etherPosition.positionAmt)
                    }

                    console.log(`amountToBeBought after potential correction: ${amountToBeBought}`)

                    if (amountToBeBought <= 2 - Number(etherPosition.positionAmt)) {
                        console.log(`Buying ${amountToBeBought} Ether`)
                        const responseBuyEther = await this.binanceConnector.buyFuture('ETHUSDT', amountToBeBought)
                        console.log(responseBuyEther)
                    }
                }

            } else if (highestSinceX > 50) {

                if (sellPressureFromCryptometer < 50 && bidsAndAsksDeltaInPercent > 100) {

                    let amountToBeSold = 0.02 * Number((highestSinceX / 10).toFixed(2))

                    console.log(`amountToBeSold before potential Correction: ${amountToBeSold}`)
                    if (amountToBeSold > Number(etherPosition.positionAmt) - 0.1) {
                        amountToBeSold = Number(etherPosition.positionAmt) - 0.1
                    }

                    console.log(`amountToBeSold after potential Correction: ${amountToBeSold}`)
                    if (Number(etherPosition.positionAmt) > amountToBeSold + 0.1) {
                        console.log(`Selling ${amountToBeSold} Ether`)
                        const responseSellEther = await this.binanceConnector.sellFuture('ETHUSDT', amountToBeSold)
                        console.log(responseSellEther)
                    }
                }
            }
        }

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