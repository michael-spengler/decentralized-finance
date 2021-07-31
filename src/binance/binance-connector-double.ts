

// https://www.npmjs.com/package/node-binance-api

const Binance = require('node-binance-api');

export class BinanceConnectorDouble {

    private binance: any

    public constructor(apiKey: string, apiSecret: string) {
        this.binance = new Binance().options({
            APIKEY: apiKey,
            APISECRET: apiSecret
        })
    }

    public async get24HoursPrices() {
        // return this.binance.candlesticks("ETHUSDT", "1m")
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

    public async futuresLeverageBracket() {
        // return this.binance.futuresLeverageBracket()
        return "super from test double"
    }
    
    public async futuresLeverage(symbol: string, amount: number) {
        // return this.binance.futuresLeverage(symbol, amount)
        return "super from test double"
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
    
    
    public async cancelAllOrders(pair: string) {
        return "super from test double"
    }
    
    public async placeBuyOrder(pair: string, amount: number): Promise<void> {
        
    }
    
    public async placeSellOrder(pair: string, amount: number): Promise<void> {
    }
    
    public async getFuturesAccountData() {
        return this.binance.futuresAccount()
    }
    
    public async getFuturesBalanceData() {
        return "super from test double"
    }
    
    public async withdraw(symbol: string = 'ETH', targetWallet: string, amount: number) {
        return "super from test double"
    }
    
    public async buyFuture(pair: string, amount: number) {
        return "super from test double"
    }
    
    public async sellFuture(pair: string, amount: number) {
        return "super from test double"
    }
    
    public async cancelPosition(pair: string) {
        return "super from test double"
    }
    
    public async getSpotBalance(symbol: string): Promise<number> {
        return 42
    }
    
    
    public async getBTCBalance(): Promise<number> {
        return 42
    }
    
    public async getUSDTBalance(): Promise<number> {
        return 42
    }
    
    public async placeStopLossOrder(pair: string, amount: any, maxPrice: any, stopLossPrice: any): Promise<void> {
    }
    
    public async placeFuturesBuyOrder(pair: string, amount: number, limitPrice: number | undefined): Promise<void> {
    }
    
    public transferFromUSDTFuturesToSpotAccount(amount: number): Promise<any> {
        return Promise.resolve("super from test double")
    }
    
    public transferFromSpotAccountToUSDTFutures(amount: number): Promise<any> {
        return Promise.resolve("super from test double")
    }
}

