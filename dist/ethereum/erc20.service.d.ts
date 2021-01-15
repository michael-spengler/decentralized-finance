export declare class ERC20Service {
    static getBalanceOfERC20TokenInWallet(walletAddress: string, walletPrivateKey: string, tokenAddress: string, web3ProviderURL: string): Promise<number>;
    static getBalanceOfDAIInWallet(walletAddress: string, walletPrivateKey: string, web3ProviderURL: string): Promise<number>;
    static getBalanceOfcETHInWallet(walletAddress: string, walletPrivateKey: string, web3ProviderURL: string): Promise<number>;
}
