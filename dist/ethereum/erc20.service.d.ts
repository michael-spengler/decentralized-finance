export declare class ERC20Service {
    static getBalanceOfERC20TokenInWallet(walletAddress: string, walletPrivateKey: string, underlyingAddress: string): Promise<number>;
    static getBalanceOfDAIInWallet(walletAddress: string, walletPrivateKey: string): Promise<number>;
}
