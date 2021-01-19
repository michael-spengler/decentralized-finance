export declare class AaveService {
    static aaveProviderContract: any;
    static lendingPoolAddress: any;
    static aaveLendingPoolContract: any;
    static web3Connection: any;
    private static isReadyToPerform;
    static getAccountData(walletAddress: string, web3ProviderURL: string): Promise<any>;
    static depositEtherToAave(amountOfEtherToBeDeposited: number, senderWalletPrivateKey: string, gasLimit: number, web3ProviderURL: string): Promise<void>;
    static borrowDAIFromAave(amountOfDAIToBeBorrowed: number, walletPrivateKey: string, gasLimit: number, web3ProviderURL: string): Promise<void>;
    static redeemAsset(walletAddress: string, senderWalletPrivateKey: string, gasLimit: number, web3ProviderURL: string, amount?: number): Promise<void>;
    private static initialize;
}
