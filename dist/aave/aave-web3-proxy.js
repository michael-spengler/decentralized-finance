"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AaveWeb3Proxy = void 0;
const Web3 = require('web3');
const constants_1 = require("../constants");
class AaveWeb3Proxy {
    static async initialize(web3ProviderURL) {
        if (AaveWeb3Proxy.isReadyToPerform) {
            // everything is already set up
        }
        else {
            AaveWeb3Proxy.web3Connection = new Web3(new Web3.providers.HttpProvider(web3ProviderURL));
            AaveWeb3Proxy.aaveProviderContract = new AaveWeb3Proxy.web3Connection.eth.Contract(constants_1.addressProviderABI, "0x24a42fD28C976A61Df5D00D0599C34c4f90748c8");
            AaveWeb3Proxy.lendingPoolAddress = await AaveWeb3Proxy.aaveProviderContract.methods.getLendingPool().call();
            AaveWeb3Proxy.aaveLendingPoolContract = new AaveWeb3Proxy.web3Connection.eth.Contract(constants_1.aaveLendingPoolABI, AaveWeb3Proxy.lendingPoolAddress);
            AaveWeb3Proxy.isReadyToPerform = true;
        }
    }
}
exports.AaveWeb3Proxy = AaveWeb3Proxy;
AaveWeb3Proxy.isReadyToPerform = false;