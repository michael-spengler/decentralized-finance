"use strict";
// // dotenv is an external dependency and would need to be installed for your project
// // e.g. npm i -s dotenv
// require("dotenv").config() // this ensures process.env. ... contains your .env file configuration values
// const Web3 = require('web3')
// const web3 = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER_URL))
// const ethers = require('ethers');
// const provider = ethers.getDefaultProvider(process.env.PROVIDER_URL);
// const Compound = require('@compound-finance/compound-js')
// const {
//   cEthAbi,
//   comptrollerAbi,
//   priceFeedAbi,
//   cErcAbi,
//   erc20Abi,
// } = require('./contracts.json')
// const gasPriceLimit = 73418401982 // could be flexibilized
// let amountOfDAIToBeBorrowedInThisRound = 0
// console.log("under construction")
// function ensureEnvironmentIsReasonablyConfigured() {
//     if (process.env.PROVIDER_URL === undefined ||
//         process.env.WALLET_ADDRESS === undefined ||
//         process.env.WALLET_PRIVATE_KEY === undefined ||
//         process.env.CHECK_EACH_X_MINUTES === undefined) {
//         throw new Error(`Please copy the .env.example file to .env and add your data for the wallet you want to optimize.`)
//     } else {
//         console.log(`optimizing crypto investments for wallet: ${process.env.WALLET_ADDRESS} on a regular basis`)
//     }
// }
// ensureEnvironmentIsReasonablyConfigured()
// // web3.eth.accounts.wallet.add('0x' + process.env.PRIVATE_KEY)
// // const myWalletAddress = web3.eth.accounts.wallet[0].address
// // const cEthAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5'
// // const cEthContract = new web3.eth.Contract(cEthAbi, cEthAddress)
// // async function depositETHToCompound(amountToBeDeposited: number) {
// //   await cEthContract.methods.mint().send({
// //     from: myWalletAddress,
// //     gasLimit: web3.utils.toHex(150000),
// //     gasPrice: await web3.eth.getGasPrice(),
// //     value: web3.utils.toHex(amountToBeDeposited * 1e18)
// //   })
// //   console.log(`deposited ${amountToBeDeposited} Ether to compound`)
// // }
// // ensureEnvironmentIsReasonablyConfigured()
// // let compound = new Compound(process.env.PROVIDER_URL, {
// //     privateKey: process.env.PRIVATE_KEY
// // })
// // async function invest() {
// //     setInterval(async () => {
// //         const accountInfo = await Compound.api.account({
// //             "addresses": process.env.WALLET_ADDRESS,
// //             "network": "mainnet"
// //         });
// //         const currentGasPrice = (await provider.getGasPrice()).toNumber()
// //         const freeValueInETH = accountInfo.accounts[0].total_collateral_value_in_eth - accountInfo.accounts[0].total_borrow_value_in_eth
// //         if (await isAnInvestmentRoundReasonable(accountInfo.accounts[0].health.value, currentGasPrice)) {
// //             console.log("starting an investmentround.")
// //             // await borrowDAIFromCompound(amountOfDAIToBeBorrowedInThisRound)
// //             // await swapDAIToETH()
// //             // await depositETHToCompound(freeValueInETH * 0.7) // times 0.7 ensuring there stays ETH for gas in wallet
// //         } else if (await isItReasonableToRepaySomeDebtsATM(accountInfo.accounts[0].health.value, currentGasPrice)) {
// //             // await repayDebts()
// //         } else {
// //             console.log("At the moment we just relax and wait for rising Ether prices.")
// //         }
// //     }, 1000 * 60 * Number(process.env.CHECK_EACH_X_MINUTES))
// // }
// // function ensureEnvironmentIsReasonablyConfigured() {
// //     if (process.env.PROVIDER_URL === undefined ||
// //         process.env.WALLET_ADDRESS === undefined ||
// //         process.env.WALLET_PRIVATE_KEY === undefined ||
// //         process.env.CHECK_EACH_X_MINUTES === undefined) {
// //         throw new Error(`Please copy the .env.example file to .env and add your data for the wallet you want to optimize.`)
// //     } else {
// //         console.log(`optimizing crypto investments for wallet: ${process.env.WALLET_ADDRESS} on a regular basis`)
// //     }
// // }
// // async function isAnInvestmentRoundReasonable(healthFactor, currentGasPrice) {
// //     const account = await Compound.api.account({
// //         "addresses": process.env.WALLET_ADDRESS,
// //         "network": "mainnet"
// //     });
// //     const minimumHealthFactorForInvestmentRound = 2 // depending on your risk preferences
// //     if (currentGasPrice > gasPriceLimit) {
// //         console.log(`The gas Price ${currentGasPrice} seems too high as your limit is set to ${gasPriceLimit}.`)
// //         return false
// //     }
// //     if (healthFactor < minimumHealthFactorForInvestmentRound) {
// //         console.log(`The health factor ${healthFactor} is below your investment limit ${minimumHealthFactorForInvestmentRound}.`)
// //         return false
// //     }
// //     //   gasPrice = await web3.eth.getGasPrice()
// //     //   const apiResult = (await axios.get(`https://api.compound.finance/api/v2/account?addresses[]=${process.env.WALLET_ADDRESS}`)).data
// //     //   const totalCollateralValueInETH = apiResult.accounts[0].total_collateral_value_in_eth.value
// //     //   const totalBorrowValueInETH = apiResult.accounts[0].total_borrow_value_in_eth.value
// //     //   healthFactor = apiResult.accounts[0].health.value
// //     //   console.log(`The worth of your current "collaterals" is about ${totalCollateralValueInETH} ETH.`)
// //     //   console.log(`The sum of your borrowings is about ${totalBorrowValueInETH} ETH.`)
// //     //   freeValueInETH = (totalCollateralValueInETH * 0.8) - totalBorrowValueInETH
// //     //   if (gasPrice > gasPriceLimit) {
// //     //     console.log(`The gas Price ${gasPrice} seems too high as your limit is set to ${gasPriceLimit}.`)
// //     //     return false
// //     //   }
// //     //   if (healthFactor < 2) {
// //     //     console.log(`The health factor of ${healthFactor} is below your limit of 2.`)
// //     //     return false
// //     //   }
// //     //   console.log(`The gas price of ${gasPrice} is fine as your limit is set to ${gasPriceLimit}.`)
// //     //   console.log(`The health factor of ${healthFactor} also allows for an additional investment round.`)
// //     //   amountOfDAIToBeBorrowedInThisRound = await getAmountOfDAIWhichCanBeBorrowed()
// //     //   console.log(`We could borrow ${amountOfDAIToBeBorrowedInThisRound}.`)
// //     return true
// // }
// // function isItReasonableToRepaySomeDebtsATM(healthFactor, currentGasPrice) {
// //     const minimumHealthFactorForBeforeRedemption = 1.10 // depending on your risk preferences
// //     if (healthFactor > minimumHealthFactorForBeforeRedemption) {
// //         return false
// //     }
// //     if (currentGasPrice > gasPriceLimit) {
// //         console.log(`The gas Price ${currentGasPrice} seems too high as your limit is set to ${gasPriceLimit}. Otherwise I would have repaid some debts.`)
// //         return false
// //     }
// //     console.log('It makes sense to repay some debts right now.')
// //     return true
// // }
// // invest()
// // // import {
// // //   Fetcher,
// // //   Percent,
// // //   Route,
// // //   TokenAmount,
// // //   Trade,
// // //   TradeType,
// // //   WETH,
// // // } from "@uniswap/sdk"
// // // import { ethers } from "ethers"
// // // import { uniswapJSONInterface } from "./constants/uniswap-json-interface"
// // // const axios = require('axios')
// // // const Web3 = require('web3')
// // // const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`))
// // // const {
// // //   cEthAbi,
// // //   comptrollerAbi,
// // //   priceFeedAbi,
// // //   cErcAbi,
// // //   erc20Abi,
// // // } = require('../contracts.json')
// // // web3.eth.accounts.wallet.add('0x' + process.env.PRIVATE_KEY)
// // // const myWalletAddress = web3.eth.accounts.wallet[0].address
// // // const cEthAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5'
// // // const cEthContract = new web3.eth.Contract(cEthAbi, cEthAddress)
// // // const comptrollerAddress = '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b'
// // // const comptroller = new web3.eth.Contract(comptrollerAbi, comptrollerAddress)
// // // const priceFeedAddress = '0x922018674c12a7f0d394ebeef9b58f186cde13c1'
// // // const priceFeed = new web3.eth.Contract(priceFeedAbi, priceFeedAddress)
// // // const underlyingAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
// // // const cTokenAddress = '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643'
// // // const cToken = new web3.eth.Contract(cErcAbi, cTokenAddress)
// // // const assetName = 'DAI'
// // // const underlyingDecimals = 18
// // // // I would love to publish a deno.land module containing the following functions :)
// // // async function getAmountOfDAIWhichCanBeBorrowed(): Promise<number> {
// // //   const priceFeedAddress = '0x922018674c12a7f0d394ebeef9b58f186cde13c1'
// // //   const priceFeed = new web3.eth.Contract(priceFeedAbi, priceFeedAddress)
// // //   let priceInUsd = (await priceFeed.methods.price('ETH').call()) / 1000000
// // //   console.log(`According to the price feed address: The price for Ether is about ${priceInUsd} USD.`)
// // //   return freeValueInETH * priceInUsd * 0.9 // the "* 0.9" just ensures we handle the investment carefully
// // // }
// // // async function borrowDAIFromCompound(amountOfDAIToBeBorrowed: number) {
// // //   const fromMyWallet = {
// // //     from: myWalletAddress,
// // //     gasLimit: web3.utils.toHex(500000),
// // //     gasPrice: await web3.eth.getGasPrice()
// // //   }
// // //   let markets = [cEthAddress]
// // //   await comptroller.methods.enterMarkets(markets).send(fromMyWallet)
// // //   console.log('Calculating your liquid assets in the protocol...')
// // //   let { 1: liquidity } = await comptroller.methods.getAccountLiquidity(myWalletAddress).call()
// // //   liquidity = liquidity / 1e18
// // //   console.log('Fetching cETH collateral factor...')
// // //   let { 1: collateralFactor } = await comptroller.methods.markets(cEthAddress).call()
// // //   collateralFactor = (collateralFactor / 1e18) * 100
// // //   console.log(`Fetching ${assetName} price from the price feed...`)
// // //   let underlyingPriceInUsd = await priceFeed.methods.price(assetName).call()
// // //   underlyingPriceInUsd = underlyingPriceInUsd / 1e6 // Price feed provides price in USD with 6 decimal places
// // //   console.log(`Fetching borrow rate per block for ${assetName} borrowing...`)
// // //   let borrowRate = await cToken.methods.borrowRatePerBlock().call()
// // //   borrowRate = borrowRate / Math.pow(10, underlyingDecimals)
// // //   console.log(`Now attempting to borrow ${amountOfDAIToBeBorrowed} ${assetName}...`)
// // //   const scaledUpBorrowAmount = (amountOfDAIToBeBorrowed * Math.pow(10, underlyingDecimals)).toString()
// // //   const trx = await cToken.methods.borrow(scaledUpBorrowAmount).send(fromMyWallet)
// // //   console.log('Borrow Transaction', trx)
// // //   console.log(`\nFetching ${assetName} borrow balance from c${assetName} contract...`)
// // //   let balance = await cToken.methods.borrowBalanceCurrent(myWalletAddress).call()
// // //   balance = balance / Math.pow(10, underlyingDecimals)
// // //   console.log(`Borrow balance is ${balance} ${assetName}`)
// // // }
// // // async function swapDAIToETH(): Promise<void> {
// // //   const dai = (await Fetcher.fetchTokenData(1, underlyingAddress))
// // //   const pair = await Fetcher.fetchPairData(dai, WETH[1])
// // //   const route = new Route([pair], dai)
// // //   const signer = new ethers.Wallet(process.env.PRIVATE_KEY)
// // //   const provider = ethers.getDefaultProvider('mainnet', { infura: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}` })
// // //   const account = signer.connect(provider)
// // //   const daiSmartContract = new ethers.Contract(underlyingAddress, erc20Abi, account)
// // //   const balanceOfDaiOnAccount = await daiSmartContract.balanceOf(process.env.WALLET_ADDRESS)
// // //   console.log(balanceOfDaiOnAccount)
// // //   const trade = new Trade(route, new TokenAmount(dai, balanceOfDaiOnAccount), TradeType.EXACT_INPUT)
// // //   console.log(route.midPrice.toSignificant(6))
// // //   console.log(trade.executionPrice.toSignificant(6))
// // //   const slippageTolerance = new Percent('50', '10000')
// // //   const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw
// // //   console.log(amountOutMin.toString())
// // //   console.log(ethers.BigNumber.from("42"))
// // //   const path = [underlyingAddress, WETH[1].address]
// // //   const deadline = Math.floor(Date.now() / 1000) + 60 * 2
// // //   const uniswapSmartContract = new ethers.Contract('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', uniswapJSONInterface, account)
// // //   const tx = await uniswapSmartContract.swapExactTokensForETH(
// // //     balanceOfDaiOnAccount,
// // //     amountOutMin.toString(),
// // //     path,
// // //     process.env.WALLET_ADDRESS,
// // //     deadline
// // //   )
// // //   console.log(`Check your swap transaction at https://etherscan.io/tx/${tx.hash}`)
// // // }
// // // async function depositETHToCompound(amountToBeDeposited: number) {
// // //   await cEthContract.methods.mint().send({
// // //     from: myWalletAddress,
// // //     gasLimit: web3.utils.toHex(150000),
// // //     gasPrice: await web3.eth.getGasPrice(),
// // //     value: web3.utils.toHex(amountToBeDeposited * 1e18)
// // //   })
// // //   console.log(`deposited ${amountToBeDeposited} Ether to compound`)
// // // }
// // // async function repayDebts() {
// // // }
