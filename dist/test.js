"use strict";
require('dotenv').config(); // this ensures process.env. ... contains your .env file configuration values
const { DeFiService } = require("decentralized-finance-defi");
const amountOfDAIToBeSwapped = 50;
const walletAddress = process.env.SENDER_WALLET_ADDRESS;
const walletPrivateKey = process.env.SENDER_WALLET_PRIVATE_KEY;
const web3ProviderURL = process.env.PROVIDER_URL; // e.g. https://mainnet.infura.io/v3/yourinfuraprojectid
DeFiService.swapDAIToETH(amountOfDAIToBeSwapped, walletAddress, walletPrivateKey, web3ProviderURL)
    .then((r) => { console.log(r); });
