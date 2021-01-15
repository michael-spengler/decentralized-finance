import { CompoundService } from "../compound/compound.service";
import { ERC20Service } from "../ethereum/erc20.service";
import { EthereumService } from "../ethereum/ethereum.service";
import { UniSwapService } from "../uniswap/uniswap.service";

export class ThugLifeService {

    public static async startTheAutomatedManagedFund(walletToBeOptimized: string, walletPrivateKey: string, gasLimit: number, healthFactorLimitForInvestmentRound: number, healthFactorLimitForRedemptionToStart: number, web3ProviderURL: string): Promise<void> {

        setInterval(async () => {

            const gasPriceInfo = await EthereumService.getGasPriceInfo()

            const compoundAccountInfo = await CompoundService.getAccountData(walletToBeOptimized)
            const totalCollateralValueInETH = compoundAccountInfo.total_collateral_value_in_eth.value
            const totalBorrowValueInETH = compoundAccountInfo.total_borrow_value_in_eth.value
            const healthFactor = compoundAccountInfo.health.value
            const freeValueInETH = (totalCollateralValueInETH * 0.8) - totalBorrowValueInETH

            if (await ThugLifeService.isAnInvestmentRoundReasonable(gasLimit, gasPriceInfo, healthFactor, healthFactorLimitForInvestmentRound)) {
                
                console.log("starting an investmentround.");

                const etherPriceInDAI = await EthereumService.getEtherPriceInDAI()

                const amountOfDAIToBeBorrowedInThisRound = freeValueInETH * etherPriceInDAI * 0.9 // the "* 0.9" just ensures we handle the investment carefully
                await CompoundService.borrowDAIFromCompound(amountOfDAIToBeBorrowedInThisRound, walletPrivateKey, gasLimit, web3ProviderURL)

                const balanceOfDAIInWallet = await ERC20Service.getBalanceOfDAIInWallet(walletToBeOptimized, walletPrivateKey)
                await  UniSwapService.swapDAIToETH(balanceOfDAIInWallet, walletToBeOptimized, walletPrivateKey, web3ProviderURL)

                const amoutOfEtherToBeDepositedToCompound = freeValueInETH * 0.7 // times 0.7 ensuring there stays more than enough ETH for gas in wallet
                await CompoundService.depositEtherToCompound(amoutOfEtherToBeDepositedToCompound, walletPrivateKey, gasLimit, web3ProviderURL); 

            } else if (ThugLifeService.shallWeRedeemSomeBorrowingsNow(gasLimit, gasPriceInfo, healthFactor, healthFactorLimitForRedemptionToStart)){
                await CompoundService.redeem(0.5, walletPrivateKey, gasLimit, web3ProviderURL)
            } else {
                console.log("At the moment it does not make sense to trigger another investment round.");
            }
        }, 1000 * 60 * Number(process.env.CHECK_EACH_X_MINUTES));
    }




    private static async isAnInvestmentRoundReasonable(gasLimit: number, gasPriceInfo: any, healthFactor: number, healthFactorLimitForInvestmentRound: number): Promise<boolean> {

        console.log(`The current gas price on the Ethereum Blockchain is about ${gasPriceInfo.fastest} for the fastest transaction speed.`)


        if (gasPriceInfo.fastest > gasLimit) {
            console.log(`The gas Price ${gasPriceInfo.fastest} seems too high as your limit is set to ${gasLimit}.`)

            return false
        }

        if (healthFactor < healthFactorLimitForInvestmentRound) {
            console.log(`The health factor of ${healthFactor} is below your limit of 2.`)

            return false
        }

        console.log(`The gas price of ${gasPriceInfo.fastest} is fine as your limit is set to ${gasLimit}.`)
        console.log(`The health factor of ${healthFactor} also allows for an additional investment round.`)

        return true
    };


    private static shallWeRedeemSomeBorrowingsNow(gasLimit: number, gasPriceInfo: any, healthFactor: number, healthFactorLimitForRedemptionToStart: number) {
        return ((gasLimit < gasPriceInfo.fastest) && (healthFactor < healthFactorLimitForRedemptionToStart))
    }
}