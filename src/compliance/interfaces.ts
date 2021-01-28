export interface IStakeEntry {
    referenceTransactionId: string,
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


export enum VOTING_DIRECTION {
    UP = 1,
    DOWN = 2
} 

export enum STAKING_POOL_TYPE {
    SOLIDITY_SMART_CONTRACT = 1,
    TYPESCRIPT_PROGRAM = 2
} 