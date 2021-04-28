import { BinanceConnector } from "../binance/binance-connector";
const fse = require('fs-extra')

const express = require('express');
const app = express();

const binanceApiKey = process.argv[2] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[3] // check your profile on binance.com --> API Management

// const binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)

app.get('/', async (req: any, res: any) => {

    // const a = await binanceConnector.getUSDTBalance()
    // const a = await binanceConnector.transferFromSpotAccountToUSDTFutures(200)
    // const a = await binanceConnector.placeBuyOrder("ETHUSDT", 0.01);
    
    // res.send(JSON.stringify(a));

});

app.get('/getpp', async (req: any, res: any) => {

    const path = `${__dirname}/historic-portfolio-prices.json`
    const a = fse.readJsonSync(path)

    res.send(JSON.stringify(a));

});

app.listen(3003, () => console.log(`Example app is listening on port http://localhost:3003.`));