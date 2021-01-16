const Web3 = require('web3');

import { aaveLendingPoolABI, addressProviderABI } from '../constants'

export class AaveWeb3Proxy {

    public static aaveProviderContract: any
    public static lendingPoolAddress: any
    public static aaveLendingPoolContract: any
    public static web3Connection: any

    private static isReadyToPerform: boolean = false

    public static async initialize(web3ProviderURL: string): Promise<void> {
        if (AaveWeb3Proxy.isReadyToPerform) {
            // everything is already set up
        } else {
            AaveWeb3Proxy.web3Connection = new Web3(new Web3.providers.HttpProvider(web3ProviderURL));
            AaveWeb3Proxy.aaveProviderContract = new AaveWeb3Proxy.web3Connection.eth.Contract(addressProviderABI, "0x24a42fD28C976A61Df5D00D0599C34c4f90748c8");
            AaveWeb3Proxy.lendingPoolAddress = await AaveWeb3Proxy.aaveProviderContract.methods.getLendingPool().call()
            AaveWeb3Proxy.aaveLendingPoolContract = new AaveWeb3Proxy.web3Connection.eth.Contract(aaveLendingPoolABI, AaveWeb3Proxy.lendingPoolAddress);
            AaveWeb3Proxy.isReadyToPerform = true
        }
    }
}