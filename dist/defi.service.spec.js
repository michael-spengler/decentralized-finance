"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defi_service_1 = require("./defi.service");
describe("Processor", () => {
    beforeEach(async () => {
        // not needed yet
    });
    it("processes direct match", async () => {
        const walletAddress = '0xA63CD0d627c34Ce3958c4a82E6bB12F7b9C1c324';
        const accountInfo = await defi_service_1.DeFiService.getCompoundAccountData(walletAddress);
        expect(Number(accountInfo.total_collateral_value_in_eth.value)).toBeGreaterThan(1);
    });
});
