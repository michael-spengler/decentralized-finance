export declare class AaveWeb3Proxy {
    static aaveProviderContract: any;
    static lendingPoolAddress: any;
    static aaveLendingPoolContract: any;
    static web3Connection: any;
    private static isReadyToPerform;
    static initialize(web3ProviderURL: string): Promise<void>;
}
