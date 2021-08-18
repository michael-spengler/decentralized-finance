

// https://www.npmjs.com/package/node-binance-api

const Binance = require('node-binance-api');

export class BinanceConnector {

    private binance: any

    public constructor(apiKey: string, apiSecret: string, private readonly accountId: string = 'default') {
        this.binance = new Binance().options({
            APIKEY: apiKey,
            APISECRET: apiSecret
        })
    }

    public getAccountId(): string {
        return this.accountId
    }
    
    public async candlesticks(pair: string, timeFrame: string) {
        return this.binance.candlesticks(pair, timeFrame)
        // this.binance.candlesticks("ETHUSDT", "1m", (error: any, ticks: any, symbol: string) => {
        //     console.info("candlesticks()", ticks);
        //     let last_tick = ticks[ticks.length - 1];
        //     let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;

        //     console.info(symbol+" last close: "+close);

        //     if (error){
        //         //
        //     }
        //   }, {limit: 500, endTime: 1514764800000});
    }

    public async getOrderbook(symbol: string) {
        const endpoint = `/api/v3/depth`
        const url = `https://vapi.binance.com`
        return this.binance.depth(symbol)
    }
    public async futuresLeverageBracket() {
        return this.binance.futuresLeverageBracket()
    }

    public async futuresLeverage(symbol: string, amount: number) {
        return this.binance.futuresLeverage(symbol, amount)
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

    // public async getAccount() {
    //     return this.binance.accountStatus()
    // }

    public async getTotalAccount() {
        return this.binance.account()
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
        this.binance.marketSell(pair, amount)
            .then((resp: any) => console.log(resp)).catch((err: any) => console.log(err.body))
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
        } catch (error) {
            console.log(error.message)
        }
    }

    public async buyFuture(pair: string, amount: number) {
        return this.binance.futuresMarketBuy(pair, amount)
    }

    public async getOpenOrders(pair: string) {
        return this.binance.futuresOpenOrders(pair)
    }

    public async cancelAllOpenOrders(pair: string) {
        return this.binance.futuresCancelAll(pair)
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
        return this.binance.futuresBuy(pair, amount, limitPrice)
    }

    public async placeFuturesSellOrder(pair: string, amount: number, limitPrice: number | undefined): Promise<void> {
        return this.binance.futuresSell(pair, amount, limitPrice)
    }

    public transferFromUSDTFuturesToSpotAccount(amount: number): Promise<any> {
        return this.binance.futuresTransferAsset('USDT', amount, "2")
    }

    public transferFromSpotAccountToUSDTFutures(amount: number): Promise<any> {
        return this.binance.futuresTransferAsset('USDT', amount, "1")
    }
}

