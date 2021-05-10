

const fse = require('fs-extra')
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


export interface IPortfolio {
    pairName: string
    percentage: number
    decimalPlaces: number
}

export interface IBalPort {
    balanceInUSDT: number
    portfolioPriceInUSDT: number
}

export class PortfolioProvider {

    private portfolio: IPortfolio[] = []
    private portFolioPriceHistory: number[] = []
    private btcPriceHistory: number[] = []
    private path = `${__dirname}/historic-portfolio-prices.json`
    private pathToStatistics = `${__dirname}/statistics.csv`


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

    public getCurrentPortfolioValue(positions: any[], currentPrices: any) {


        let portfolioValue = 0
        for (const p of positions) {
            if (p.positionAmt > 0) {

                try {
                    const currentPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === p.symbol)[0].price)
                    const positionValue = Number(p.positionAmt) * currentPrice
                    portfolioValue = portfolioValue + positionValue
                } catch (error) {
                    console.log(`error while processing ${p.symbol} error.message: ${error.message}`)
                }
            }
        }

        return portfolioValue

    }

    public getCurrentXPrice(currentPrices: any, pair: string) {

        const currentXPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === pair)[0].price)

        if (this.btcPriceHistory.length >= 400004) {
            this.btcPriceHistory.shift()
        }

        this.btcPriceHistory.push(currentXPrice)

        return currentXPrice
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

            if (this.portFolioPriceHistory.length < 400004) {
                this.portFolioPriceHistory.push(aPP)
            } else {
                this.portFolioPriceHistory.shift()
                this.portFolioPriceHistory.push(aPP)
            }

            return aPP
        }
        return 0
    }

    public getHistoricAverageOfportfolioPriceX() {
        let total = 0
        for (const e of this.portFolioPriceHistory) {
            total = total + e
        }
        if (this.portFolioPriceHistory.length > 0) {
            return total / this.portFolioPriceHistory.length
        } else {
            return 0
        }
    }

    public async saveStatistics(statistics: IBalPort[]): Promise<void> {
        // await fse.write(this.pathToStatistics, statistics)

        const csvWriter = createCsvWriter({
            path: this.pathToStatistics,
            header: [
                { id: 'balanceInUSDT', title: 'balanceInUSDT' },
                { id: 'portfolioPriceInUSDT', title: 'portfolioPriceInUSDT' }
            ]
        });

        const records: any[] = []

        for (const entry of statistics) {
            records.push({ balanceInUSDT: entry.balanceInUSDT, portfolioPriceInUSDT: entry.portfolioPriceInUSDT })
        }

        await csvWriter.writeRecords(records)
    }

    public getLowestPriceOfRecentXIntervals(numberOfIntervalsToBeRegarded: number, randomizerMax?: number, pair?: string): number {
        let lowestPrice = 1000000000000
        let counter = 0
        const limit = (randomizerMax === undefined) ? numberOfIntervalsToBeRegarded : Math.floor(Math.random() * (randomizerMax - numberOfIntervalsToBeRegarded + 1) + numberOfIntervalsToBeRegarded);

        if (pair === undefined) {

            const startPosition = this.portFolioPriceHistory.length - limit

            for (const e of this.portFolioPriceHistory) {
                counter++
                if (counter >= startPosition) {
                    if (e < lowestPrice) {
                        lowestPrice = e
                    }
                }
            }
        } else {
            const startPosition = this.btcPriceHistory.length - limit

            for (const e of this.btcPriceHistory) {
                counter++
                if (counter >= startPosition) {
                    if (e < lowestPrice) {
                        lowestPrice = e
                    }
                }
            }

        }

        return lowestPrice
    }

    public getHighestPriceOfRecentXIntervals(numberOfIntervalsToBeRegarded: number, randomizerMax?: number, pair?: string): number {

        let highestPrice = 0
        let counter = 0
        const limit = (randomizerMax === undefined) ? numberOfIntervalsToBeRegarded : Math.floor(Math.random() * (randomizerMax - numberOfIntervalsToBeRegarded + 1) + numberOfIntervalsToBeRegarded);

        if (pair === undefined) {
            const startPosition = this.portFolioPriceHistory.length - limit

            for (const e of this.portFolioPriceHistory) {
                counter++
                if (counter >= startPosition) {
                    if (e > highestPrice) {
                        highestPrice = e
                    }
                }
            }
        } else if (pair === 'BTCUSDT') {
            const startPosition = this.btcPriceHistory.length - limit

            for (const e of this.btcPriceHistory) {
                counter++
                if (counter >= startPosition) {
                    if (e > highestPrice) {
                        highestPrice = e
                    }
                }
            }
        } else {
            throw new Error('to be implemented if another assetclass emerges as being the leader')
        }

        return highestPrice
    }

    // public isBelow100Average(cPP: number) {
    //     if (cPP < this.getHistoricAverageOfportfolioPriceX()) {
    //         return true
    //     } else {
    //         return false
    //     }
    // }

    private preparePortfolioList() {
        this.portfolio.push({ pairName: "ADAUSDT", percentage: 4, decimalPlaces: 0 })
        this.portfolio.push({ pairName: "AVAXUSDT", percentage: 4, decimalPlaces: 0 })
        this.portfolio.push({ pairName: "EOSUSDT", percentage: 4, decimalPlaces: 0 })
        this.portfolio.push({ pairName: "MANAUSDT", percentage: 4, decimalPlaces: 0 })
        this.portfolio.push({ pairName: "SOLUSDT", percentage: 4, decimalPlaces: 0 })
        this.portfolio.push({ pairName: "LUNAUSDT", percentage: 4, decimalPlaces: 0 })
        this.portfolio.push({ pairName: "TRXUSDT", percentage: 4, decimalPlaces: 0 })
        this.portfolio.push({ pairName: "UNIUSDT", percentage: 4, decimalPlaces: 0 })
        this.portfolio.push({ pairName: "VETUSDT", percentage: 4, decimalPlaces: 0 })
        this.portfolio.push({ pairName: "XLMUSDT", percentage: 4, decimalPlaces: 0 })
        this.portfolio.push({ pairName: "AAVEUSDT", percentage: 4, decimalPlaces: 1 })
        this.portfolio.push({ pairName: "BATUSDT", percentage: 4, decimalPlaces: 1 })
        this.portfolio.push({ pairName: "BNBUSDT", percentage: 4, decimalPlaces: 2 })
        this.portfolio.push({ pairName: "BTCUSDT", percentage: 4, decimalPlaces: 3 })
        this.portfolio.push({ pairName: "COMPUSDT", percentage: 4, decimalPlaces: 2 })
        this.portfolio.push({ pairName: "DOTUSDT", percentage: 4, decimalPlaces: 1 })
        this.portfolio.push({ pairName: "EGLDUSDT", percentage: 4, decimalPlaces: 1 })
        this.portfolio.push({ pairName: "ETHUSDT", percentage: 4, decimalPlaces: 2 })
        this.portfolio.push({ pairName: "FILUSDT", percentage: 4, decimalPlaces: 1 })
        this.portfolio.push({ pairName: "LINKUSDT", percentage: 4, decimalPlaces: 2 })
        this.portfolio.push({ pairName: "LTCUSDT", percentage: 4, decimalPlaces: 2 })
        this.portfolio.push({ pairName: "MKRUSDT", percentage: 4, decimalPlaces: 2 })
        this.portfolio.push({ pairName: "SNXUSDT", percentage: 4, decimalPlaces: 1 })
        this.portfolio.push({ pairName: "THETAUSDT", percentage: 4, decimalPlaces: 1 })
        this.portfolio.push({ pairName: "XMRUSDT", percentage: 4, decimalPlaces: 2 })
    }
}