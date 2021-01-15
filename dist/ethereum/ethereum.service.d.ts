export declare class EthereumService {
    static getGasPriceInfo(): Promise<any>;
    static transferEther(fromWallet: string, toWallet: string, amountInETH: number, senderPrivateKey: string): Promise<any>;
    static signAndSend(transactionObject: any, senderPrivateKey: string): Promise<void>;
    static getTransactionObject(from: string, to: string, amountInWei: number): Promise<{
        nonce: any;
        gasLimit: any;
        gasPrice: any;
        from: string;
        to: string;
        value: number;
        chainId: string;
    }>;
    private static checkEnvironmentIsConfiguredProperly;
}
