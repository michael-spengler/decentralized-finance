// const WebSocket = require('ws');

// export class DyDxWebSocketConnector {

//     private static readonly DYDX_WS_URL = "wss://api.dydx.exchange/v1/ws"

//     public static subscribeToWS() {


//         // const ws = new WebSocket('ws://www.host.com/path');
//         const ws = new WebSocket(DyDxWebSocketConnector.DYDX_WS_URL);

//         ws.subscribe({
//             "type": "subscribe",
//             "channel": "orders",
//             "id": "walletaddress"
//         })
//         // ws.on('open', function open() {
//         //     ws.send('something');
//         // });

//         ws.on('message', function incoming(data: any) {
//             console.log(data);
//         });
//     }

// }

// DyDxWebSocketConnector.subscribeToWS()