export declare class DeFiService {
    static getGasPriceInfo(): Promise<any>;
    static transferEther(fromWallet: string, toWallet: string, amountInETH: number): Promise<any>;
    static getCompoundAccountData(walletAddress: string): Promise<any>;
    static depositEtherToCompound(amountOfEtherToBeDeposited: number, senderWalletAddress: string, senderWalletPrivateKey: string, web3ProviderURL: string): Promise<void>;
    static getPriceDataWithTimeStamp(): Promise<any>;
}
