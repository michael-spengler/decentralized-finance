

// just a draft - will probably be replaced by a corresponding smart contract
export class WallStreetBetsExchange {

    private readonly etherPriceInWallStreetBetsCoins = 1000

    
    public getMarketCapInEther(freeFloatAmount: number) {
        return freeFloatAmount / this.etherPriceInWallStreetBetsCoins
    }

    public async getWSBCFromETH(amountOfEtherBeingSent: number, wallet: string): Promise<string> {
        const amountOfWSBCToBeSent = amountOfEtherBeingSent * this.etherPriceInWallStreetBetsCoins
        console.log(`Triggering the transfer of ${amountOfWSBCToBeSent} WSBC to wallet ${wallet} as I received ${amountOfEtherBeingSent} Ether from this wallet.`)
        
        return "transactionID"
    }

    public async getETHFromWSBC(amountOfWSBCBeingSent: number, wallet: string): Promise<string> {
        const amountOfETHToBeSent = amountOfWSBCBeingSent / this.etherPriceInWallStreetBetsCoins
        console.log(`Triggering the transfer of ${amountOfETHToBeSent} ETH to wallet ${wallet} as I received ${amountOfWSBCBeingSent} WSBC from this wallet.`)
        
        return "transactionID"
    }
    
}
