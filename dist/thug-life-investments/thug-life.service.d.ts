export declare class ThugLifeService {
    static startTheAutomatedManagedFund(walletToBeOptimized: string, walletPrivateKey: string, gasLimit: number, healthFactorLimitForInvestmentRound: number, healthFactorLimitForRedemptionToStart: number, web3ProviderURL: string, checkEachXMinutes?: number): Promise<any>;
    private static isAnInvestmentRoundReasonable;
    private static shallWeRedeemSomeBorrowingsNow;
}
