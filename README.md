# Decentralized Finance
This package provides several examples to use DeFi features.

## Usage

1. npm i decentralized-finance-defi
2. try some of the following examples in your code


### Get Current Gas Price Info

```ts
const { DeFiService } = require("decentralized-finance-defi")

const gasPriceInfo = await DeFiService.getGasPriceInfo()
console.log(gasPriceInfo.fastest)
```

### Get Compound Account Data
```ts
const { DeFiService } = require("decentralized-finance-defi")

const walletAddress = '0xA63CD0d627c34Ce3958c4a82E6bB12F7b9C1c324'
const accountInfo = await DeFiService.getCompoundAccountData(walletAddress)

console.log(`The collateral value in ETH is: ${accountInfo.total_collateral_value_in_eth.value}.`)

```

### Get Crypto Currency Prices (API Key Required)
```ts
const { DeFiService } = require("decentralized-finance-defi")

const pricesWithTimeStamp = DeFiService.getPriceDataWithTimeStamp()

// There will be ETH :)
console.log(pricesWithTimeStamp[1])

```

### Transfer Ether
```ts
require('dotenv').config()
    
const { DeFiService } = require("decentralized-finance-defi")

const fromWalletAddress = process.env.SENDER_WALLET_ADDRESS
const toWalletAddress = process.env.RECEIVER_WALLET_ADDRESS
const amountInETH = 1
const senderPrivateKey = process.env.SENDER_WALLET_PRIVATE_KEY

await DeFiService.transferEther(fromWalletAddress, toWalletAddress, amountInETH, senderPrivateKey)

```

### Deposit Ether to Compound
```ts
require('dotenv').config()
    
const { DeFiService } = require("decentralized-finance-defi")

const amountOfEtherToBeDeposited = 1
const senderWalletAddress = process.env.SENDER_WALLET_ADDRESS
const senderPrivateKey = process.env.SENDER_WALLET_PRIVATE_KEY
const web3ProviderURL = process.env.PROVIDER_URL

await DeFiService.depositEtherToCompound(amountOfEtherToBeDeposited, senderWalletAddress, senderWalletPrivateKey, web3ProviderURL)

```


