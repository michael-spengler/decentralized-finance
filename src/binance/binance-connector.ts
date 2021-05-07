

// https://www.npmjs.com/package/node-binance-api

const Binance = require('node-binance-api');

export class BinanceConnector {

    private binance: any

    public constructor(apiKey: string, apiSecret: string) {
        this.binance = new Binance().options({
            APIKEY: apiKey,
            APISECRET: apiSecret
        })
    }

    public async getCurrentPrices(): Promise<any[]> {

        const pricesResult = await this.binance.prices();
        const currentPrices: any[] = []

        let coinSymbols
        coinSymbols = Object.keys((pricesResult))
        for (const coinSymbol of coinSymbols) {
            const entry = {
                coinSymbol: coinSymbol,
                price: pricesResult[coinSymbol]
            }
            currentPrices.push(entry)
        }

        return currentPrices
    }

    public async getAccount() {
        return this.binance.accountStatus()
    }

    // public async getOverallBalance() {
    //     const bal = await this.binance.balance()
    //     console.log(JSON.stringify(bal))
    // }

    public async cancelAllOrders(pair: string) {
        await this.binance.cancelAll(pair)
    }

    public async placeBuyOrder(pair: string, amount: number): Promise<void> {
        this.binance.marketBuy(pair, amount)
            .then((resp: any) => console.log(resp)).catch((err: any) => console.log(err.body))
    }

    public async placeSellOrder(pair: string, amount: number): Promise<void> {
        await this.binance.marketSell(pair, amount)
    }

    public async getFuturesAccountData() {
        return this.binance.futuresAccount()
    }

    public async getFuturesBalanceData() {
        return this.binance.futuresBalance()
    }

    public async withdraw(symbol: string = 'ETH', targetWallet: string, amount: number) {
        try {
            const r = await this.binance.withdraw(symbol, targetWallet, amount)
            console.log(r)
        } catch(error){
            console.log(error.message)
        }
    }

    public async buyFuture(pair: string, amount: number) {
        return this.binance.futuresMarketBuy(pair, amount)
    }

    public async sellFuture(pair: string, amount: number) {
        return this.binance.futuresMarketSell(pair, amount)
    }

    public async cancelPosition(pair: string) {
        return this.binance.futuresCancelAll("ETHUSDT")
    }

    public async getSpotBalance(symbol: string): Promise<number> {
        const balances = await this.binance.balance()
        const balance = balances[symbol].available

        return balance
    }


    public async getBTCBalance(): Promise<number> {
        const balances = await this.binance.balance()
        const btcBalance = balances.BTC.available

        return btcBalance
    }

    public async getUSDTBalance(): Promise<number> {
        const balances = await this.binance.balance()
        const btcBalance = balances.USDT.available

        return btcBalance
    }

    public async placeStopLossOrder(pair: string, amount: any, maxPrice: any, stopLossPrice: any): Promise<void> {
        await this.binance.sell(pair, amount, maxPrice, { stopPrice: stopLossPrice, type: "STOP_LOSS_LIMIT" })
    }

    public async placeFuturesBuyOrder(pair: string, amount: number, limitPrice: number | undefined): Promise<void> {
        console.log(await this.binance.futuresBuy(pair, amount, limitPrice))
    }

    public transferFromUSDTFuturesToSpotAccount(amount: number): Promise<any> {
        return this.binance.futuresTransferAsset('USDT', amount, "2")
    }

    public transferFromSpotAccountToUSDTFutures(amount: number): Promise<any> {
        return this.binance.futuresTransferAsset('USDT', amount, "1")
    }
}

