export declare class DeFiService {
    static getGasPriceInfo(): Promise<any>;
    static transferEther(fromWallet: string, toWallet: string, amountInETH: number): Promise<any>;
    static getCompoundAccountData(walletAddress: string): Promise<any>;
    static depositEtherToCompound(amountOfEtherToBeDeposited: number, senderWalletPrivateKey: string, gasLimit: number, web3ProviderURL: string): Promise<void>;
    static borrowDAIFromCompound(amountOfDAIToBeBorrowed: number, walletPrivateKey: string, gasLimit: number, web3ProviderURL: string): Promise<void>;
    static redeemAssetFromCompound(walletAddress: string, walletPrivateKey: string, gasLimit: number, web3ProviderURL: string, amount?: number): Promise<void>;
    static getAaveAccountData(walletAddress: string, web3ProviderURL: string): Promise<any>;
    static depositEtherToAave(amountOfEtherToBeDeposited: number, senderWalletPrivateKey: string, gasLimit: number, web3ProviderURL: string): Promise<void>;
    static borrowDAIFromAave(amountOfDAIToBeBorrowed: number, walletPrivateKey: string, gasLimit: number, web3ProviderURL: string): Promise<void>;
    static redeemAssetFromAave(walletAddress: string, walletPrivateKey: string, gasLimit: number, web3ProviderURL: string, amount?: number): Promise<void>;
    static getPriceDataWithTimeStamp(coinMarketCapAPIKey: string): Promise<any>;
    static swapDAIToETH(amountOfDAIToBeSwapped: number, walletAddress: string, walletPrivateKey: string, web3ProviderURL: string): Promise<void>;
    static startTheAutomatedManagedFund(walletAddress: string, walletPrivateKey: string, web3ProviderURL: string, healthFactorLimitForInvestmentRound: number, healthFactorLimitForRedemptionToStart: number, gasLimit: number, checkEachXMinutes: number): Promise<any>;
}
