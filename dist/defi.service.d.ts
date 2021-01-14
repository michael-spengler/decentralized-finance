export declare class DeFiService {
    static getGasPriceInfo(): Promise<any>;
    static getCompoundAccountData(walletAddress: string): Promise<any>;
    static getPriceDataWithTimeStamp(): Promise<any>;
    static transferEther(fromWallet: string, toWallet: string, amountInETH: number): Promise<any>;
}
