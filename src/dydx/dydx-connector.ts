import axios from 'axios';


export class DyDxConnector {

    private readonly baseURL = 'https://api.dydx.exchange'

    public async getAccountBalance(walletAddress: string) {

      
    }

    public async isUserExisting(walletAddress: string) {
        const endPoint = 'v3/users/exists'
        const parameterName = 'ethereumAddress'

        const url = `${this.baseURL}/${endPoint}?${parameterName}=${walletAddress}`
        console.log(url)
        const result = (await axios.get(url)).data
        return result
    }

}