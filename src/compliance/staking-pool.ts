
import { IStakeEntry } from "./interfaces";
const fsExtra = require('fs-extra')

export class StakingPool {
    stakeEntries: IStakeEntry[] = []

    
    public static stakeETHBeforeMakingATransaction() {
        return '12345'
    }
}