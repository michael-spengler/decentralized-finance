const axios = require('axios')

export class EthereumService {

    public static async getGasPriceInfo(): Promise<any> {
        const gasPriceInfo = (await axios.get('https://ethgasstation.info/json/ethgasAPI.json')).data

        return gasPriceInfo
    }
}

