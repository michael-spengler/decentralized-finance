# Decentralized Finance
This package provides several examples to use DeFi features.

## Usage

1. npm i decentralized-finance-defi
2. try some of the following examples in your code


```ts
import { DeFiService} from "decentralized-finance-defi"

const walletAddress = '0xA63CD0d627c34Ce3958c4a82E6bB12F7b9C1c324'
const accountInfo = await DeFiService.getCompoundAccountData(walletAddress as string)

console.log(`The collateral value in ETH is: ${account.accounts[0].total_collateral_value_in_eth.value}.`)

```

## Payment Examples
```ts

```

## Deposit Example
In order to earn interests you can deposit some assets.
```ts

```

## Borrow Examples
If you provide some assets as collateral you can borrow other assets.
```ts

```

## Compliance Examples
```ts

```

## Investment Examples
```ts

```


