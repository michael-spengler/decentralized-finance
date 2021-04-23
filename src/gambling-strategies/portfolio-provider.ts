
export interface IPortfolio {
    pairName: string
    percentage: number
    decimalPlaces: number
}

export class PortfolioProvider {

    private portfolio: IPortfolio[] = []
    private averagePortFolioPriceHistory100: number[] = []
    private averagePortFolioPriceHistory1000: number[] = []

    public constructor() {
        this.preparePortfolioList()
    }

    public getPortfolio() {
        return this.portfolio
    }

    public getDecimalPlaces(pair: string): number {
        const e = this.portfolio.filter((e: IPortfolio) => e.pairName === pair)[0]
        if (e === undefined) {
            console.log(`error while getting decimal places for ${pair}`)
            return 0
        } else {
            return e.decimalPlaces
        }
    }

    public getCurrentPortfolioAveragePrice(currentPrices: any) {
        const prices = []
        let total = 0
        for (const pe of this.portfolio) {
            const currentPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === pe.pairName)[0].price)
            prices.push(currentPrice)
            total = total + currentPrice
        }

        if (total > 0) {
            const aPP = (total / prices.length)

            if (this.averagePortFolioPriceHistory100.length < 100) {
                this.averagePortFolioPriceHistory100.push(aPP)
            } else {
                this.averagePortFolioPriceHistory100.shift()
                this.averagePortFolioPriceHistory100.push(aPP)
            }

            if (this.averagePortFolioPriceHistory1000.length < 1000) {
                this.averagePortFolioPriceHistory1000.push(aPP)
            } else {
                this.averagePortFolioPriceHistory1000.shift()
                this.averagePortFolioPriceHistory1000.push(aPP)
            }

            return aPP
        }
        return 0
    }

    public getHistoricAverageOfaveragePortfolioPrice100() {
        let total = 0
        for (const e of this.averagePortFolioPriceHistory100) {
            total = total + e
        }
        if (this.averagePortFolioPriceHistory100.length > 0) {
            return total / this.averagePortFolioPriceHistory100.length
        } else {
            return 0
        }
    }

    public getLowestPriceOfRecent100Intervals(): number {
        let lowestPrice = 1000000000000
        for (const e of this.averagePortFolioPriceHistory100) {
            if (e < lowestPrice) {
                lowestPrice = e
            }
        }
        
        return lowestPrice
    }

    public getHighestPriceOfRecent100Intervals(): number {
        let highestPrice = 0
        for (const e of this.averagePortFolioPriceHistory100) {
            if (e > highestPrice) {
                highestPrice = e
            }
        }
        
        return highestPrice
    }

    public isBelow100Average(cPP: number) {
        if (cPP < this.getHistoricAverageOfaveragePortfolioPrice100()) {
            return true
        } else {
            return false
        }
    }

    public getHistoricAverageOfaveragePortfolioPrice1000() {
        let total = 0
        for (const e of this.averagePortFolioPriceHistory1000) {
            total = total + e
        }
        if (this.averagePortFolioPriceHistory1000.length > 0) {
            return total / this.averagePortFolioPriceHistory1000.length
        } else {
            return 0
        }
        // return 1000000
    }

    private preparePortfolioList() {
        this.portfolio.push({ pairName: "BTCUSDT", percentage: 5, decimalPlaces: 3 })
        this.portfolio.push({ pairName: "ADAUSDT", percentage: 5, decimalPlaces: 0 })
        this.portfolio.push({ pairName: "BNBUSDT", percentage: 5, decimalPlaces: 2 })
        this.portfolio.push({ pairName: "XMRUSDT", percentage: 5, decimalPlaces: 2 })
        this.portfolio.push({ pairName: "ETHUSDT", percentage: 5, decimalPlaces: 2 })
        this.portfolio.push({ pairName: "BATUSDT", percentage: 5, decimalPlaces: 1 })
        this.portfolio.push({ pairName: "TRXUSDT", percentage: 5, decimalPlaces: 0 })
        this.portfolio.push({ pairName: "XLMUSDT", percentage: 5, decimalPlaces: 0 })
        this.portfolio.push({ pairName: "LINKUSDT", percentage: 5, decimalPlaces: 2 })
        this.portfolio.push({ pairName: "MANAUSDT", percentage: 5, decimalPlaces: 0 })
        this.portfolio.push({ pairName: "THETAUSDT", percentage: 5, decimalPlaces: 1 })
        this.portfolio.push({ pairName: "FILUSDT", percentage: 5, decimalPlaces: 1 })
        this.portfolio.push({ pairName: "COMPUSDT", percentage: 5, decimalPlaces: 2 })
        this.portfolio.push({ pairName: "AAVEUSDT", percentage: 5, decimalPlaces: 1 })
        this.portfolio.push({ pairName: "EGLDUSDT", percentage: 5, decimalPlaces: 1 })
        this.portfolio.push({ pairName: "DOTUSDT", percentage: 5, decimalPlaces: 1 })
        this.portfolio.push({ pairName: "LTCUSDT", percentage: 5, decimalPlaces: 2 })
        this.portfolio.push({ pairName: "MKRUSDT", percentage: 5, decimalPlaces: 2 })
        this.portfolio.push({ pairName: "SNXUSDT", percentage: 5, decimalPlaces: 1 })
        this.portfolio.push({ pairName: "AVAXUSDT", percentage: 5, decimalPlaces: 0 })
    }




}