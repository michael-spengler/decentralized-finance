"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThugLifeService = void 0;
const compound_service_1 = require("../compound/compound.service");
const erc20_service_1 = require("../ethereum/erc20.service");
const ethereum_service_1 = require("../ethereum/ethereum.service");
const uniswap_service_1 = require("../uniswap/uniswap.service");
class ThugLifeService {
    static async startTheAutomatedManagedFund(walletToBeOptimized, walletPrivateKey, gasLimit, healthFactorLimitForInvestmentRound, healthFactorLimitForRedemptionToStart, web3ProviderURL, checkEachXMinutes) {
        setInterval(async () => {
            const gasPriceInfo = await ethereum_service_1.EthereumService.getGasPriceInfo();
            const compoundAccountInfo = await compound_service_1.CompoundService.getAccountData(walletToBeOptimized);
            const totalCollateralValueInETH = compoundAccountInfo.total_collateral_value_in_eth.value;
            const totalBorrowValueInETH = compoundAccountInfo.total_borrow_value_in_eth.value;
            const healthFactor = compoundAccountInfo.health.value;
            const freeValueInETH = (totalCollateralValueInETH * 0.8) - totalBorrowValueInETH;
            if (await ThugLifeService.isAnInvestmentRoundReasonable(gasLimit, gasPriceInfo, healthFactor, healthFactorLimitForInvestmentRound)) {
                console.log("starting an investmentround.");
                const etherPriceInDAI = await ethereum_service_1.EthereumService.getEtherPriceInDAI();
                const amountOfDAIToBeBorrowedInThisRound = freeValueInETH * etherPriceInDAI * 0.9; // the "* 0.9" just ensures we handle the investment carefully
                await compound_service_1.CompoundService.borrowDAIFromCompound(amountOfDAIToBeBorrowedInThisRound, walletPrivateKey, gasLimit, web3ProviderURL);
                const balanceOfDAIInWallet = await erc20_service_1.ERC20Service.getBalanceOfDAIInWallet(walletToBeOptimized, walletPrivateKey, web3ProviderURL);
                await uniswap_service_1.UniSwapService.swapDAIToETH(balanceOfDAIInWallet, walletToBeOptimized, walletPrivateKey, web3ProviderURL);
                const amoutOfEtherToBeDepositedToCompound = freeValueInETH * 0.7; // times 0.7 ensuring there stays more than enough ETH for gas in wallet
                await compound_service_1.CompoundService.depositEtherToCompound(amoutOfEtherToBeDepositedToCompound, walletPrivateKey, gasLimit, web3ProviderURL);
            }
            else if (ThugLifeService.shallWeRedeemSomeBorrowingsNow(gasLimit, gasPriceInfo, healthFactor, healthFactorLimitForRedemptionToStart)) {
                await compound_service_1.CompoundService.redeemAsset(walletToBeOptimized, walletPrivateKey, gasLimit, web3ProviderURL, undefined);
            }
            else {
                console.log("At the moment it does not make sense to trigger another investment round.");
            }
        }, 1000 * 60 * checkEachXMinutes);
    }
    static async isAnInvestmentRoundReasonable(gasLimit, gasPriceInfo, healthFactor, healthFactorLimitForInvestmentRound) {
        console.log(`The current gas price on the Ethereum Blockchain is about ${gasPriceInfo.fastest} for the fastest transaction speed.`);
        if (gasPriceInfo.fastest > gasLimit) {
            console.log(`The gas Price ${gasPriceInfo.fastest} seems too high as your limit is set to ${gasLimit}.`);
            return false;
        }
        if (healthFactor < healthFactorLimitForInvestmentRound) {
            console.log(`The health factor of ${healthFactor} is below your limit of 2.`);
            return false;
        }
        console.log(`The gas price of ${gasPriceInfo.fastest} is fine as your limit is set to ${gasLimit}.`);
        console.log(`The health factor of ${healthFactor} also allows for an additional investment round.`);
        return true;
    }
    ;
    static shallWeRedeemSomeBorrowingsNow(gasLimit, gasPriceInfo, healthFactor, healthFactorLimitForRedemptionToStart) {
        if (healthFactor > healthFactorLimitForRedemptionToStart) {
            console.log(`We do not need to redeem our assets from compound at the moment. Our healthfactor is: ${healthFactor} - the limit for redemption is: ${healthFactorLimitForRedemptionToStart}`);
            return false;
        }
        if (gasLimit <= gasPriceInfo.fastest) {
            console.log(`We would start a redemption if our gasPrice of ${gasPriceInfo.fastest} was not higher than our gas limit of ${gasLimit}.`);
            return false;
        }
        console.log("A redemption seems reasonable now and will be triggered.");
        return true;
    }
}
exports.ThugLifeService = ThugLifeService;
