import { BinanceConnector } from "../../binance/binance-connector"


export class BasicDoubleGambler {
    private binanceConnector: BinanceConnector
    private bitcoinPrices: number[] = []
    private shitcoinPrices: number[] = []
    private historicPricesLength = 0
    private intervalLengthInSeconds = 0

    public constructor(historicPricesLength: number, intervalLengthInSeconds: number, binanceApiKey: string, binanceApiSecret: string) {
        this.binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)
        this.historicPricesLength = historicPricesLength
        this.intervalLengthInSeconds = intervalLengthInSeconds
    }

    public gamble() {

        setInterval(async () => {

            console.log(`*****************************************`)
            const accountData = await this.binanceConnector.getFuturesAccountData()

            const bitcoinPosition = accountData.positions.filter((entry: any) => entry.symbol === 'BTCUSDT')[0]
            const shitCoinPosition = accountData.positions.filter((entry: any) => entry.symbol === 'DOGEUSDT')[0]

            const currentPrices = await this.binanceConnector.getCurrentPrices()

            const currentBitcoinPrice: number = currentPrices.filter((e: any) => e.coinSymbol === 'BTCUSDT')[0].price
            const currentShitcoinPrice: number = currentPrices.filter((e: any) => e.coinSymbol === 'DOGEUSDT')[0].price

            if (this.bitcoinPrices.length === this.historicPricesLength) {
                this.bitcoinPrices.splice(this.bitcoinPrices.length - 1, 1)
            }
            this.bitcoinPrices.unshift(currentBitcoinPrice)

            if (this.shitcoinPrices.length === this.historicPricesLength) {
                this.shitcoinPrices.splice(this.shitcoinPrices.length - 1, 1)
            }
            this.shitcoinPrices.unshift(currentShitcoinPrice)

            const lowestRandomBitcoinPrice = this.getLowestBitcoinPrice(27, this.bitcoinPrices.length)
            const highestRandomShitCoinPrice = this.getHighestShitcoinPrice(27, this.shitcoinPrices.length)

            if (this.bitcoinPrices.length === this.historicPricesLength) {

                await this.utilizeInvestment(lowestRandomBitcoinPrice, currentBitcoinPrice, bitcoinPosition, accountData)
                await this.utilizeHedge(highestRandomShitCoinPrice, currentShitcoinPrice, shitCoinPosition, accountData)

            } else {

                console.log('still collecting data')

            }

        }, this.intervalLengthInSeconds * 1000)
    }
    
    
    private async utilizeInvestment(lowestRandomBitcoinPrice: number, currentBitcoinPrice: number, bitcoinPosition: any, accountData: any) {
       
        let bitcoinProfitInPercent = (bitcoinPosition.unrealizedProfit * 100) / bitcoinPosition.initialMargin
        
        if (!(bitcoinProfitInPercent < 1000000000)) {
            bitcoinProfitInPercent = 0
        }

        const sellingAt = Math.floor(Math.random() * (27 - 18 + 1) + 18);
        
        
        if (bitcoinProfitInPercent > sellingAt && bitcoinPosition.positionAmt > 0.5) {
            console.log(`selling BTC to take some profits as bitcoinProfitInPercent (${bitcoinProfitInPercent}) is above ${sellingAt}`)
            await this.binanceConnector.sellFuture('BTCUSDT', 0.018)
        } else if (lowestRandomBitcoinPrice === currentBitcoinPrice && Number(accountData.availableBalance) > 27) {
            let factor = (Number((bitcoinProfitInPercent / 10).toFixed(0)) * -1)
            
            
            if (factor <= 0) {
                factor = 1
            }
            
            console.log(`buying BTC due to a low price at a factor of ${factor}`)

            await this.binanceConnector.buyFuture('BTCUSDT', 0.09 * factor)
        } else {
            console.log(`bitcoinProfitInPercent: ${bitcoinProfitInPercent} - bitcoinPosition.positionAmt: ${bitcoinPosition.positionAmt}`)
        }

    }

    private async utilizeHedge(highestRandomShitCoinPrice: number, currentShitcoinPrice: number, shitCoinPosition: any, accountData: any) {

        let shitcoinProfitInPercent = (shitCoinPosition.unrealizedProfit * 100) / shitCoinPosition.initialMargin

        if (!(shitcoinProfitInPercent < 1000000000)) {
            shitcoinProfitInPercent = 0
        }

        const buyingBackAt = Math.floor(Math.random() * (27 - 18 + 1) + 18);

        if (shitcoinProfitInPercent > buyingBackAt) {
            console.log(`buying back shorted shitcoin to take some profits as shitcoinProfitInPercent (${shitcoinProfitInPercent}) is above ${buyingBackAt}`)
            await this.binanceConnector.buyFuture('DOGEUSDT', 432)
        } else if (highestRandomShitCoinPrice === currentShitcoinPrice && Number(accountData.availableBalance) > 27) {
            let factor = Number(shitcoinProfitInPercent.toFixed(0)) * -1
            if (factor <= 0) {
                factor = 1
            }

            console.log(`selling Shitcoin due to a high price at a factor of ${factor}`)
            await this.binanceConnector.sellFuture('DOGEUSDT', 153 * factor)
        } else {
            console.log(`shitcoinProfitInPercent: ${shitcoinProfitInPercent} - shitCoinPosition.positionAmt: ${shitCoinPosition.positionAmt}`)
        }

    }
    private getLowestBitcoinPrice(min: number, max: number): number {

        let lowestPrice = 1000000000
        let counter = 0

        const limit = (max === undefined) ? min : Math.floor(Math.random() * (max - min + 1) + min);

        const startPosition = this.bitcoinPrices.length - limit

        for (const e of this.bitcoinPrices) {
            counter++
            if (counter >= startPosition) {
                if (e < lowestPrice) {
                    lowestPrice = e
                }
            }
        }
        
        return lowestPrice
    }

    private getHighestShitcoinPrice(min: number, max: number): number {

        let highestPrice = 0
        let counter = 0

        const limit = (max === undefined) ? min : Math.floor(Math.random() * (max - min + 1) + min);

        const startPosition = this.shitcoinPrices.length - limit

        for (const e of this.shitcoinPrices) {
            counter++
            if (counter >= startPosition) {
                if (e > highestPrice) {
                    highestPrice = e
                }
            }
        }

        return highestPrice
    }
}


const historicPricesLength = Number(process.argv[2])
const intervalLengthInSeconds = Number(process.argv[3])
const binanceApiKey = process.argv[4] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[5] // check your profile on binance.com --> API Management

const basicDoubleGambler = new BasicDoubleGambler(historicPricesLength, intervalLengthInSeconds, binanceApiKey, binanceApiSecret)

basicDoubleGambler.gamble()



