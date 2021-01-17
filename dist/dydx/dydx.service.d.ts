export declare class DyDxService {
    private static isReadyToServe;
    private static dydxPerpetual;
    static initialize(walletAddress: string, walletPrivateKey: string, web3ProviderURL: string): Promise<void>;
    static getPerpetualAccountBalances(walletAddress: string, walletPrivateKey: string, web3ProviderURL: string): Promise<any>;
    static getPerpetualBalanceUpdates(walletAddress: string, walletPrivateKey: string, web3ProviderURL: string): Promise<void>;
    static depositToPerpetualAccount(walletAddress: string, walletPrivateKey: string, web3ProviderURL: string): Promise<void>;
    static withdrawFromPerpetualAccount(walletAddress: string, walletPrivateKey: string, web3ProviderURL: string): Promise<void>;
}
