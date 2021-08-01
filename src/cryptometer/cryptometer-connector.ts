const axios = require('axios')

export class CryptoMeterConnector {

    private apiKey

    public constructor(apiKey: string) {
        this.apiKey = apiKey
    }

    public async getTrendIndicators() {
        const url = `https://api.cryptometer.io/trend-indicator-v3?api_key=${this.apiKey}`
        console.log(url)
        let result
        try {
            result = (await axios.get(url)).data.data[0]
        } catch (error) {
            console.log(error.message)
        }

        return result
    }

    public async getLiquidationData() {
        const url = `https://api.cryptometer.io/liquidation-data?api_key=${this.apiKey}`
        console.log(url)
        let result
        try {
            result = (await axios.get(url)).data.data
        } catch (error) {
            console.log(error.message)
        }

        return result
    }

    public async getBuyToSellRatio(symbol: string): Promise<number> {
        
        const url = `https://api.cryptometer.io/current-day-merged-volume-v2?symbol=${symbol}&api_key=${this.apiKey}`
        console.log(url)
        let result
        try {
            result = (await axios.get(url)).data.data[0]

            console.log(result)

            return result.buy / result.sell
        } catch (error) {
            console.log(error.message)

        }

        return 0
    }

    public async getLongShortRatio(symbol: string): Promise<number> {

        const url = `https://api.cryptometer.io/current-day-long-short-v2?e=binance&symbol=${symbol}&api_key=${this.apiKey}`
        console.log(url)
        let result
        try {
            result = (await axios.get(url)).data.data

            console.log(result)

            return result.longs / result.shorts
        } catch (error) {
            console.log(error.message)

        }

        return 0
    }

    // public async getSMA(symbol: string): Promise<number> {

    //     const url = `https://api.cryptometer.io/indicator-sma/?market_pair=${symbol.toLowerCase()}usdt&e=binance&timeframe=5m&source=close&period=14&api_key=${this.apiKey}`
    //     console.log(url)
    //     let result
    //     try {
    //         result = (await axios.get(url)).data.data

    //         console.log(result)

    //         return result.longs / result.shorts
    //     } catch (error) {
    //         console.log(error.message)

    //     }

    //     return 0
    // }


}