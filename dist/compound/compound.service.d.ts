export declare class CompoundService {
    static getAccountData(walletAddress: string): Promise<any>;
    static depositEtherToCompound(amountOfEtherToBeDeposited: number, senderWalletAddress: string, senderWalletPrivateKey: string, web3ProviderURL: string): Promise<void>;
}
