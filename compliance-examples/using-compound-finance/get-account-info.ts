
require("dotenv").config() // this ensures process.env. ... contains your .env file configuration values

const Compound = require('@compound-finance/compound-js');


async function readAccountInfo() {

    const account = await Compound.api.account({
        "addresses": process.env.WALLET_ADDRESS, // you might add & require("dotenv").config() - using environment variables
        "network": "mainnet"
    });
    
    console.log(`The borrow value in ETH is: ${account.accounts[0].total_borrow_value_in_eth.value}.`)
   
}

readAccountInfo()
