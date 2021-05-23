  
# Decentralized Finance &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [<img src="https://raw.githubusercontent.com/michael-spengler/decentralized-finance/main/logo-v2.svg" alt="drawing" width="200"/>](https://www.npmjs.com/package/decentralized-finance-defi)
This package provides distributed ledger based banking features like payments, deposits, loans and automated investment patterns.

Connect your TypeScript based projects with smart contracts on the Ethereum Blockchain by checking the usage examples below.

This package shall increase freedom for those who increase freedom. As such it supports the [klopapier.exchange](https://toiletpaper.eth.link).

[![NPM Downloads](https://img.shields.io/npm/dw/decentralized-finance-defi)](https://www.npmjs.com/package/decentralized-finance-defi)  [![Chat](https://img.shields.io/discord/799926751039979520)](https://discord.gg/6mAtkXMf3Z)  [![Maintained](https://img.shields.io/maintenance/maintained/2021)](https://github.com/michael-spengler/decentralized-finance)  

## Usage Examples

### [Payments](https://github.com/michael-spengler/decentralized-finance/wiki#feature-areas)
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

### [Deposits](https://github.com/michael-spengler/decentralized-finance/wiki#feature-areas)

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

### [Loans](https://github.com/michael-spengler/decentralized-finance/wiki#feature-areas)
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


### [Account Management](https://github.com/michael-spengler/decentralized-finance/wiki#feature-areas)
#### Get Compound Account Data
You can also test this feature via the [compound.finance](https://compound.finance) user interface.
```ts
const { DeFiService } = require("decentralized-finance-defi")

const walletAddress = '0xA63CD0d627c34Ce3958c4a82E6bB12F7b9C1c324'
const accountInfo = await DeFiService.getCompoundAccountData(walletAddress)

console.log(`The collateral value in ETH is: ${accountInfo.total_collateral_value_in_eth.value}.`)

```

### [Exchange Features](https://github.com/michael-spengler/decentralized-finance/wiki#feature-areas)
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

### [Leverage Investing](https://github.com/michael-spengler/decentralized-finance/wiki#feature-areas)

#### Binance based Leverage Investment

```ts

require('dotenv').config() // this ensures process.env. ... contains your .env file configuration values

const { Gambler } = require("decentralized-finance-defi")

const liquidityRatioToBuy = 0.95 // just as an example
const liquidityRatioToSell = 0.45 // just as an example
const reinvestAt = 10 // just as an example
const investmentAmount = 20 // just as an example
const binanceApiKey = process.env.BINANCE_API_KEY // check your profile on binance.com --> API Management
const binanceApiSecret = process.env.BINANCE_API_SECRET // check your profile on binance.com --> API Management

Gambler.gamble(lrToBuy, lrToSell, reinvestAt, investmentAmount, binanceApiKey, binanceApiSecret)

```


#### Get account info from DyDx.exchange
You can also test this feature via the [dydx.exchange](https://dydx.exchange/) user interface.
```ts

require('dotenv').config() // this ensures process.env. ... contains your .env file configuration values
    
const { DeFiService } = require("decentralized-finance-defi")
    
const walletAddress = process.env.SENDER_WALLET_ADDRESS

const result = await DeFiService.getDyDxPerpetualAccountBalances(walletAddress)

console.log(result)

```

### [Neural Networks](https://github.com/michael-spengler/decentralized-finance/wiki#feature-areas)
#### Explore FeedForward Neural Nets with Backpropagation
```ts

// This one is in experimental mode - check the code to check whether it is fine for you.
const { DeFiService } = require("decentralized-finance-defi")

DeFiService.charterATrader() // observe the console output

```

### [Crypto Currency Insights](https://github.com/michael-spengler/decentralized-finance/wiki#feature-areas)
#### Get Price Data with Timestamp from Coinmarketcap (API Key Required)
You can compare the results via the [coinmarketcap.com](https://coinmarketcap.com) user interface.
```ts
require('dotenv').config() // this ensures process.env. ... contains your .env file configuration values

const { DeFiService } = require("decentralized-finance-defi")

const pricesWithTimeStamp = DeFiService.getPriceDataWithTimeStamp(process.env.COINMARKETCAP_API_KEY)

// There will be ETH :)
console.log(pricesWithTimeStamp[1])

```

### [Distributed Ledger Insights](https://github.com/michael-spengler/decentralized-finance/wiki#feature-areas)
#### Get Current Gas Price Info

```ts
const { DeFiService } = require("decentralized-finance-defi")

const gasPriceInfo = await DeFiService.getGasPriceInfo()
console.log(gasPriceInfo.fastest)
```


## Further Features

You can find further examples in the [DeFi Service](https://github.com/michael-spengler/decentralized-finance/blob/main/src/defi.service.ts) file. If you are looking for anything more specific, feel free to check the corresponding folders and class definitions within the [src](https://github.com/michael-spengler/decentralized-finance/tree/main/src) folder.

If you have not found what you are looking for, feel free to [raise an issue](https://github.com/michael-spengler/decentralized-finance/issues/new) or even better raise a Pull Request. 


## Smart Contract Development
You can find some simple examples for solidity based smart contract development projects within the [smart-contracts-development](https://github.com/michael-spengler/decentralized-finance/tree/main/src/smart-contracts-development) folder.


## General Recommendations
You might also check [aave.com](https://aave.com/), [klopapier.exchange](https://toiletpaper.eth.link/) and [compound.finance](https://compound.finance). If you want to get a general overview on DeFi Services, you might check the [defipulse.com](https://defipulse.com/).

## Distributed Domain Name Services
To provide your user interfaces in a sustainable way you might check [ens.domains](https://ens.domains). If you want to try it, you might check [this tutorial](https://www.youtube.com/watch?v=oA4oOY5zgU0).

## Blockchain based Deployments
For Permaweb deployments you might check [argoapp.live](https://argoapp.live). I tested it for a vuejs frontend project. It works pretty straight forward already. If you are in general a fan of the decentralized web (dWeb), you might also check the new (2021) [IPFS browser standard](https://brave.com/brave-integrates-ipfs/).

## Fund Contributions
If you see an issue in the DeFi space which you want to see solved, consider funding the solution via [gitcoin.co](https://gitcoin.co).

## OpenBits based Open Source Incentive Engineering
With this package we also explore the features of [openbits.world](https://openbits.world).  
If you want to support this adventure, consider installing the package via:
```sh
openbits install decentralized-finance-defi
```
You can find background information on that via:   
https://openbits.world/#/explore-openbit/decentralized-finance-defi


## Deno based DeFi
I prepared [the corresponding Deno module](https://deno.land/x/defi) and wait until the dependencies of the package at hand are ready for [Deno](https://deno.land) resp. [nest.land](https://nest.land).


## GDPR related Data Privacy
In order to comply to general data protection guidelines, you might consider providing built in transaction anonymization as a service to your users.  
One option to do so is described in [this tutorial](https://www.youtube.com/watch?v=Dv9jiOc8kOY) leveraging [tornadocash.eth.link](https://tornadocash.eth.link/).  
Depending on your specific jurisdiction you might check [tornadocash.eth.link/compliance](https://tornadocash.eth.link/compliance).

## Security
See [Security Policy](https://github.com/michael-spengler/decentralized-finance/blob/main/SECURITY.md).

### Protect against Postinstall Exploits
To be on the safe side even if a dependency of a dependency of a dependency .... tries to exploit the [potential postinstall weak spot]([here](https://github.com/michael-spengler/decentralized-finance/issues/2)) we recommend to adhere to the following pattern: 
```sh
npm config set ignore-scripts true
npm install
npm config set ignore-scripts false
```


## Reference Projects
Some of the most famous projects using this package 
[<img src="https://user-images.githubusercontent.com/43786652/106395210-475db300-6401-11eb-857a-492c52b1c837.jpg" alt="drawing" width="200"/>](https://toiletpaper.eth.link)

## Philosophy
This package shall increase freedom for those who increase freedom. Actions of the weak shall be private. Actions of the powerful shall be transparent.

## Open Source DeFi Coin
Under Construction
### Tokenomics
**Challenges**
If we define a max supply, the problem might be that at one point there will be less and less transactions if many of the owners decide just to hodl.
Clearly define the incentives.
Who will add Liquidity Pools?
How could the process of collecting wallet addresses who want to participate look like?

## Support our Open Source Contributions
If you like our work, you might download the Brave Browser via our
promotion link: [https://brave.com/fan464](https://brave.com/fan464) and enjoy the new (2021) [IPFS browser standard](https://brave.com/brave-integrates-ipfs/).

![![](https://brave.com/)](https://brave.com/wp-content/uploads/2019/01/logotype-full-color.svg)
