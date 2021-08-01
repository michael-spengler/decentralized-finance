import { BinanceConnector } from "../../binance/binance-connector"

export class DataCollector {
    
    private binanceConnector: BinanceConnector
    private symbol: string
    private historicData: any[] = []
    private pathToTrainingData: string = `${__dirname}/training-data.json`

    public constructor(symbol: string, apiKey: string, apiSecret: string) {
        this.binanceConnector = new BinanceConnector(apiKey, apiSecret)
        this.symbol = symbol
    }

    public async saveDataToFile() {

        const fsExtra = require('fs-extra')

        const ticks = await this.binanceConnector.candlesticks('ETHUSDT', '5m')
        // console.log(ticks.length)

        for (const e of ticks) {
            var s = new Date(e[0]).toISOString();
            console.log(`${s}: ${e[1]}`)
        }
        await fsExtra.writeFileSync(this.pathToTrainingData, JSON.stringify(ticks))
    }
}


const symbol = process.argv[2] // e.g. ETH
const binanceApiKey = process.argv[3] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[4] // check your profile on binance.com --> API Management

const dataCollector = new DataCollector(symbol, binanceApiKey, binanceApiSecret)
dataCollector.saveDataToFile()