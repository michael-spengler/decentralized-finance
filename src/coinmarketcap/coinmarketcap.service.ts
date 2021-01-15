
require('dotenv').config()

const axios = require('axios')

export class CoinMarketCapService {

    public static async getPriceDataWithTimeStamp(coinMarketCapAPIKey: string): Promise<any> {

        process.env.NODE_ENV = 'production'
        const result = 
        (await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', { headers: { 'X-CMC_PRO_API_KEY': coinMarketCapAPIKey } })).data

        return { coinmarketcapResult: result }

    }

}