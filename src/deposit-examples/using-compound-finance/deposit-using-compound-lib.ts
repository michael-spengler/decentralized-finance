
// // dotenv is an external dependency and would need to be installed for your project
// // e.g. npm i -s dotenv
// require("dotenv").config() // this ensures process.env. ... contains your .env file configuration values

// const Web3 = require('web3')
// const web3 = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER_URL))

// const Compound = require('@compound-finance/compound-js')

// const {
//     cEthAbi,
//     comptrollerAbi,
//     priceFeedAbi,
//     cErcAbi,
//     erc20Abi,
// } = require('./contracts.json')

// const gasPriceLimit = 73418401982 // could be flexibilized

// let amountOfDAIToBeBorrowedInThisRound = 0

// web3.eth.accounts.wallet.add('0x' + process.env.PRIVATE_KEY)
// const myWalletAddress = web3.eth.accounts.wallet[0].address

// const cEthAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5'
// const cEthContract = new web3.eth.Contract(cEthAbi, cEthAddress)

// async function depositETHToCompound(amountToBeDeposited: number) {
//     await cEthContract.methods.mint().send({
//         from: myWalletAddress,
//         gasLimit: web3.utils.toHex(150000),
//         gasPrice: await web3.eth.getGasPrice(),
//         value: web3.utils.toHex(amountToBeDeposited * 1e18)
//     })

//     console.log(`deposited ${amountToBeDeposited} Ether to compound`)
// }


// ensureEnvironmentIsReasonablyConfigured()

// let compound = new Compound(process.env.PROVIDER_URL, {
//     privateKey: process.env.PRIVATE_KEY
// })


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