export declare class CompoundService {
    static getAccountData(walletAddress: string): Promise<any>;
    static depositEtherToCompound(amountOfEtherToBeDeposited: number, senderWalletPrivateKey: string, gasLimit: number, web3ProviderURL: string): Promise<void>;
    static borrowDAIFromCompound(amountOfDAIToBeBorrowed: number, walletPrivateKey: string, gasLimit: number, web3ProviderURL: string): Promise<void>;
    static redeemAsset(walletAddress: string, senderWalletPrivateKey: string, gasLimit: number, web3ProviderURL: string, amount?: number): Promise<void>;
}
