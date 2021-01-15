"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniSwapService = void 0;
const sdk_1 = require("@uniswap/sdk");
const ethers_1 = require("ethers");
const constants_1 = require("../constants");
const underlyingAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
class UniSwapService {
    static async swapDAIToETH(amountOfDAIToBeSwapped, walletAddress, walletPrivateKey, web3ProviderURL) {
        const dai = (await sdk_1.Fetcher.fetchTokenData(1, underlyingAddress));
        const pair = await sdk_1.Fetcher.fetchPairData(dai, sdk_1.WETH[1]);
        const route = new sdk_1.Route([pair], dai);
        const signer = new ethers_1.ethers.Wallet(walletPrivateKey);
        const provider = ethers_1.ethers.getDefaultProvider('mainnet', { infura: web3ProviderURL });
        const account = signer.connect(provider);
        const daiSmartContract = new ethers_1.ethers.Contract(underlyingAddress, constants_1.erc20Abi, account);
        const balanceOfDaiOnAccount = await daiSmartContract.balanceOf(walletAddress);
        const balanceScaledDown = balanceOfDaiOnAccount / 1000000000000000000;
        console.log(`balance of DAI on account: ${balanceScaledDown}`);
        if (balanceScaledDown < amountOfDAIToBeSwapped) {
            throw new Error(`The balance of DAI on this account is ${balanceScaledDown}. How would I swap ${amountOfDAIToBeSwapped} DAI with that?`);
        }
        const amountOfDAIToBeSwappedScaledUp = amountOfDAIToBeSwapped * 1000000000000000000;
        const trade = new sdk_1.Trade(route, new sdk_1.TokenAmount(dai, amountOfDAIToBeSwappedScaledUp.toString()), sdk_1.TradeType.EXACT_INPUT);
        console.log(route.midPrice.toSignificant(6));
        console.log(trade.executionPrice.toSignificant(6));
        const slippageTolerance = new sdk_1.Percent('50', '10000');
        const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw;
        console.log(amountOutMin.toString());
        console.log(ethers_1.ethers.BigNumber.from("42"));
        const path = [underlyingAddress, sdk_1.WETH[1].address];
        const deadline = Math.floor(Date.now() / 1000) + 60 * 2;
        const uniswapSmartContract = new ethers_1.ethers.Contract('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', constants_1.uniswapJSONInterface, account);
        const tx = await uniswapSmartContract.swapExactTokensForETH(balanceOfDaiOnAccount, amountOutMin.toString(), path, walletAddress, deadline);
        console.log(`Check your uniswap swap transaction at https://etherscan.io/tx/${tx.hash}`);
    }
}
exports.UniSwapService = UniSwapService;
