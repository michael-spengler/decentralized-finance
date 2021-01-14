
require('dotenv').config()

const axios = require('axios')

export class CoinMarketCapService {

    public static async getPriceDataWithTimeStamp(): Promise<any> {

        CoinMarketCapService.checkEnvironmentIsConfiguredProperly()
        process.env.NODE_ENV = 'production'
        const result = 
        (await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', { headers: { 'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY } })).data

        return { coinmarketcapResult: result }

    }


    private static checkEnvironmentIsConfiguredProperly() {

        if (process.env.COINMARKETCAP_API_KEY === undefined) {
            throw new Error('Copy the .env.template file to .env and ensure there is a valid value for COINMARKETCAP_API_KEY')
        }

    }

}