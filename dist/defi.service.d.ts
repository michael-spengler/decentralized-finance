export declare class DeFiService {
    static getGasPriceInfo(): Promise<any>;
    static transferEther(fromWallet: string, toWallet: string, amountInETH: number): Promise<any>;
    static getCompoundAccountData(walletAddress: string): Promise<any>;
    static depositEtherToCompound(amountOfEtherToBeDeposited: number, senderWalletPrivateKey: string, gasLimit: number, web3ProviderURL: string): Promise<void>;
    static borrowDAIFromCompound(amountOfDAIToBeBorrowed: number, walletPrivateKey: string, gasLimit: number, web3ProviderURL: string): Promise<void>;
    static redeem(amountOfDAIToBeBorrowed: number, walletPrivateKey: string, gasLimit: number, web3ProviderURL: string): Promise<void>;
    static getPriceDataWithTimeStamp(): Promise<any>;
    static swapDAIToETH(amountOfDAIToBeSwapped: number, walletAddress: string, walletPrivateKey: string, web3ProviderURL: string): Promise<void>;
}
