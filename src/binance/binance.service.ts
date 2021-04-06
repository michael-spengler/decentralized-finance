// const Binance = require('node-binance-api');

// export class BinanceService {

//     public static activateSocket() {
//         const binance = new Binance().options({
//             APIKEY: '<key>',
//             APISECRET: '<secret>'
//         });

//         binance.websockets.chart("BNBBTC", "1m", (symbol: any, interval: any, chart: any) => {
//             let tick = binance.last(chart);
//             const last = chart[tick].close;
//             console.info(chart);
//             // Optionally convert 'chart' object to array:
//             // let ohlc = binance.ohlc(chart);
//             // console.info(symbol, ohlc);
//             console.info(symbol + " last price: " + last)
//         });

//     }

// }