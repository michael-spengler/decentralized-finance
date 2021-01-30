

import { WallStreetBetsExchange } from "./wallstreetbets.exchange"

describe("WallStreetBetsExchange", () => {

    let wallStreetBetsExchange: WallStreetBetsExchange

    beforeEach(async () => {
        wallStreetBetsExchange = new WallStreetBetsExchange()
    })

    it("test getMarketCapInEther", async () => {
        expect(wallStreetBetsExchange.getMarketCapInEther(100)).toBe(0.1)
    })

    it("test getWSBCFromETH", async () => {
        const expectedTransactionID = 'aksdfjöaksdf'
        expect(await wallStreetBetsExchange.getWSBCFromETH(100, "0xsdkfiowklkfj")).toBe("transactionID")
    })

    it("test getETHFromWSBC", async () => {
        const expectedTransactionID = 'aksdfjöaksdf'
        expect(await wallStreetBetsExchange.getETHFromWSBC(100, "0xsdkfiowklkfj")).toBe("transactionID")
    })
})