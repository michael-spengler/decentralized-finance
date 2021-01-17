

import { DeFiService } from "./defi.service"

describe("DeFiService", () => {
    beforeEach(async () => {
        // not needed yet

    })

    it("provides wallet info from compound", async () => {
        const walletAddress = '0xA63CD0d627c34Ce3958c4a82E6bB12F7b9C1c324'
        const accountInfo = await DeFiService.getCompoundAccountData(walletAddress as string)

        expect(Number(accountInfo.total_collateral_value_in_eth.value)).toBeGreaterThan(1)
    })

    it("provides current gas price info", async () => {
        const gasPriceInfo = await DeFiService.getGasPriceInfo()
        expect(Number(gasPriceInfo.fastest)).toBeGreaterThan(1)
    })

    it("provides price data with timestamp from coinmarketcap", async () => {
        const coinMarketCapAPIKey = process.env.COINMARKETCAP_API_KEY
        // for the following jest would need to be configurable properly
        // const priceInfoWithTimeStamp = await DeFiService.getPriceDataWithTimeStamp(coinMarketCapAPIKey)
    })

})