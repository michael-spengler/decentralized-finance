import { BinanceConnector } from "../binance/binance-connector";

const express = require('express');
const app = express();

const binanceApiKey = process.argv[2] // check your profile on binance.com --> API Management
const binanceApiSecret = process.argv[3] // check your profile on binance.com --> API Management

const binanceConnector = new BinanceConnector(binanceApiKey, binanceApiSecret)

app.get('/', async (req: any, res: any) => {

    const a = await binanceConnector.transferFromSpotAccountToUSDTFutures(200)
    console.log(a)
    res.send(JSON.stringify(a));
});

app.listen(3000, () => console.log(`Example app is listening on port http://localhost:3000.`));