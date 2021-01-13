

import { DeFiProvider } from "./defi-provider"

describe("Processor", () => {
    beforeEach(async () => {
        // not needed yet
       
    })

    it("processes direct match", async () => {
        const walletAddress = '0xA63CD0d627c34Ce3958c4a82E6bB12F7b9C1c324'
        const accountInfo = await DeFiProvider.getCompoundAccountData(walletAddress as string)

        expect(Number(accountInfo.total_collateral_value_in_eth.value)).toBeGreaterThan(1)
    })
})