  
    

# Decentralized Finance
This package provides distributed ledger based banking features like payments, deposits, loans and automated investment patterns.

Connect your TypeScript based projects with smart contracts on the Ethereum Blockchain by checking the following usage examples.


[![NPM Downloads](https://img.shields.io/npm/dw/decentralized-finance-defi)](https://www.npmjs.com/package/decentralized-finance-defi)  [![NPM Downloads](https://img.shields.io/discord/799926751039979520)](https://discord.gg/6mAtkXMf3Z)


## Usage Examples

### Payments
#### Transfer Ether
```ts
require('dotenv').config() // this ensures process.env. ... contains your .env file configuration values
    
const { DeFiService } = require("decentralized-finance-defi")

const fromWalletAddress = process.env.SENDER_WALLET_ADDRESS
const toWalletAddress = process.env.RECEIVER_WALLET_ADDRESS
const amountInETH = 1
const senderPrivateKey = process.env.SENDER_WALLET_PRIVATE_KEY

await DeFiService.transferEther(fromWalletAddress, toWalletAddress, amountInETH, senderPrivateKey)

```

### Deposits

#### Deposit Ether to Compound
You can also test this feature via the [compound.finance](https://compound.finance) user interface.
```ts
require('dotenv').config() // this ensures process.env. ... contains your .env file configuration values
    
const { DeFiService } = require("decentralized-finance-defi")

const amountOfEtherToBeDeposited = 1
const senderPrivateKey = process.env.SENDER_WALLET_PRIVATE_KEY
const gasLimit = 250000 // GWEI --> 0.00025 ETH --> currently January 15th 2021 about 
const web3ProviderURL = process.env.PROVIDER_URL // e.g. https://mainnet.infura.io/v3/yourinfuraprojectid

await DeFiService.depositEtherToCompound(amountOfEtherToBeDeposited, senderWalletPrivateKey, gasLimit web3ProviderURL)

```

### Loans
#### Borrow Ether from Compound
You can also test this feature via the [compound.finance](https://compound.finance) user interface.
```ts
require('dotenv').config() // this ensures process.env. ... contains your .env file configuration values
    
const { DeFiService } = require("decentralized-finance-defi")

const amountOfDAIToBeBorrowed = 100
const walletPrivateKey = process.env.SENDER_WALLET_PRIVATE_KEY
const gasLimit = 250000
const web3ProviderURL = process.env.PROVIDER_URL // e.g. https://mainnet.infura.io/v3/yourinfuraprojectid

await DeFiService.borrowDAIFromCompound(amountOfDAIToBeBorrowed, walletPrivateKey, gasLimit, web3ProviderURL)

```

#### Redeem Asset from Compound 
You can also test this feature via the [compound.finance](https://compound.finance) user interface.
```ts

require('dotenv').config() // this ensures process.env. ... contains your .env file configuration values
    
const { DeFiService } = require("decentralized-finance-defi")
    
const walletAddress = process.env.SENDER_WALLET_ADDRESS
const walletPrivateKey = process.env.SENDER_WALLET_PRIVATE_KEY
const gasLimit = 250000
const web3ProviderURL = process.env.PROVIDER_URL // e.g. https://mainnet.infura.io/v3/yourinfuraprojectid
const amount = 1 // redeem 1 cETH
    
await DeFiService.redeemAssetFromCompound(walletAddress,  walletPrivateKey, gasLimit, web3ProviderURL, amount)

```


### Account Management
#### Get Compound Account Data
You can also test this feature via the [compound.finance](https://compound.finance) user interface.
```ts
const { DeFiService } = require("decentralized-finance-defi")

const walletAddress = '0xA63CD0d627c34Ce3958c4a82E6bB12F7b9C1c324'
const accountInfo = await DeFiService.getCompoundAccountData(walletAddress)

console.log(`The collateral value in ETH is: ${accountInfo.total_collateral_value_in_eth.value}.`)

```

### Exchange Features
#### Swap DAI to Ether via Uniswap
You can also test this feature via the [uniswap.org](https://uniswap.org) user interface.
```ts
require('dotenv').config() // this ensures process.env. ... contains your .env file configuration values
    
const { DeFiService } = require("decentralized-finance-defi")

const amountOfDAIToBeSwapped = 50
const walletAddress = process.env.SENDER_WALLET_ADDRESS
const walletPrivateKey = process.env.SENDER_WALLET_PRIVATE_KEY
const web3ProviderURL = process.env.PROVIDER_URL // e.g. https://mainnet.infura.io/v3/yourinfuraprojectid

await DeFiService.swapDAIToETH(amountOfDAIToBeSwapped, walletAddress, walletPrivateKey, web3ProviderURL)

```


### Crypto Currency Insights 
#### Get Price Data with Timestamp from Coinmarketcap (API Key Required)
You can compare the results via the [coinmarketcap.com](https://coinmarketcap.com) user interface.
```ts
require('dotenv').config() // this ensures process.env. ... contains your .env file configuration values

const { DeFiService } = require("decentralized-finance-defi")

const pricesWithTimeStamp = DeFiService.getPriceDataWithTimeStamp(process.env.COINMARKETCAP_API_KEY)

// There will be ETH :)
console.log(pricesWithTimeStamp[1])

```

### Distributed Ledger Insights
#### Get Current Gas Price Info

```ts
const { DeFiService } = require("decentralized-finance-defi")

const gasPriceInfo = await DeFiService.getGasPriceInfo()
console.log(gasPriceInfo.fastest)
```


## Further Features

You can find many more simple and general examples in the [DeFi Service](https://github.com/michael-spengler/decentralized-finance/blob/main/src/defi.service.ts file. If you are looking for anything more specific, feel free to check the corresponding folders and class definitions within the [src](https://github.com/michael-spengler/decentralized-finance/tree/main/src) folder.

If you have not found what you are looking for, feel free to raise an issue or even better raise a Pull Request. 


## Smart Contract Development
You can find some simple examples for solidity based smart contract development projects within the [smart-contracts-development](https://github.com/michael-spengler/decentralized-finance/tree/main/src/smart-contracts-development) folder.


## General Recommendations
You might also check [aave.com](https://aave.com/), [klopapier.exchange](https://klopapier.exchange/) and [compound.finance](https://compound.finance). 

## Distributed Domain Name Services
To provide your user interfaces in a sustainable way you might check [ens.domains](https://ens.domains). If you want to try it, you might check [this tutorial](https://www.youtube.com/watch?v=oA4oOY5zgU0).

## Blockchain based Deployments
For Permaweb deployments you might check [argoapp.live](https://argoapp.live). I tested it for a vuejs frontend project. It works pretty straight forward already.

## Fund Contributions
If you see an issue in the DeFi space which you want to see solved, consider funding the solution via [gitcoin.co](https://gitcoin.co).

## Deno based DeFi
I prepared [the corresponding Deno module](https://deno.land/x/defi) and wait until the dependencies of the package at hand are ready for Deno.

## Support my Open Source Contributions

If you like my work, you might download the Brave Browser via my
promotion link: [https://brave.com/fan464](https://brave.com/fan464).

![![](https://brave.com/)](https://brave.com/wp-content/uploads/2019/01/logotype-full-color.svg)