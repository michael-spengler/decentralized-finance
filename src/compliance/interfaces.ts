export interface IStakeEntry {

    stakingWalletAddress: string,
    amountStaked: number,
    timestamp: any
}


export interface IWalletReputation {
    walletAddress: string,
    reputation: number,
}


export interface IP2PExchangeTransaction {
        initiatingWalletAddress: string,
        transactionId: string,
        timeStampTriggered: string,
        timestampFinalized: string,
        transactionInput: any,
        votes: [
            {
                ups: number,
                downs: number
            }
        ]
}