import { BinanceConnector } from "../../binance/binance-connector"


export class JumpStarter {

    private binanceConnector: BinanceConnector
    private historicData: any[] = []

    public constructor(apiKey: string, apiSecret: string) {
        this.binanceConnector = new BinanceConnector(apiKey, apiSecret)
    }

    public async investWisely(): Promise<void> {
        const currentPrices = await this.binanceConnector.getCurrentPrices()
        const btcPrice = Number(currentPrices.filter((e: any) => e.coinSymbol === 'BTCUSDT')[0].price)

        console.log(btcPrice)

        if (this.historicData.length === 500000) {
            this.historicData.splice(this.historicData.length - 1, 1)
        }
        this.historicData.unshift(btcPrice)


        const lowestBTCPriceSince = this.getIsLowestSinceX(btcPrice)

        console.log(lowestBTCPriceSince)


    }

    private getIsLowestSinceX(price: number) {
        let counter = 0

        for (const e of this.historicData) {
            if (price > e) {
                return counter
            }
            counter++
        }
        return counter
    }


}


const binanceApiKey = process.argv[2] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[3] // check your profile on binance.com --> API Management

setInterval(async () => {

    const jumpStarter = new JumpStarter(binanceApiKey, binanceApiKey)
    jumpStarter.investWisely()


}, 11 * 1000)