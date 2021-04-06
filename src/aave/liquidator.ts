// import DaiTokenABI from "./DAItoken.json"
// import LendingPoolAddressesProviderABI from "./LendingPoolAddressesProvider.json"
// import LendingPoolABI from "./LendingPool.json"

export class Liquidator {

    public static async liquidate(web3: any, lendingPoolABI: any, addressProviderABI: any) {
        // Import the ABIs, see: https://docs.aave.com/developers/developing-on-aave/deployed-contract-instances

        // ... The rest of your code ...

        // Input variables
        const collateralAddress = 'THE_COLLATERAL_ASSET_ADDRESS'
        const daiAmountInWei = web3.utils.toWei("1000", "ether").toString()
        const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F' // mainnet DAI
        const user = 'USER_ACCOUNT'
        const receiveATokens = true

        const lpAddressProviderAddress = '0x24a42fD28C976A61Df5D00D0599C34c4f90748c8' // mainnet
        const lpAddressProviderContract = new web3.eth.Contract(addressProviderABI, lpAddressProviderAddress)

        // Get the latest LendingPoolCore address
        const lpCoreAddress = await lpAddressProviderContract.methods
            .getLendingPoolCore()
            .call()
            .catch((e: any) => {
                throw Error(`Error getting lendingPool address: ${e.message}`)
            })

        // Approve the LendingPoolCore address with the DAI contract
        const daiContract = new web3.eth.Contract("DaiTokenABI", daiAddress)
        await daiContract.methods
            .approve(
                lpCoreAddress,
                daiAmountInWei
            )
            .send()
            .catch((e: any) => {
                throw Error(`Error approving DAI allowance: ${e.message}`)
            })

        // Get the latest LendingPool contract address
        const lpAddress = await lpAddressProviderContract.methods
            .getLendingPool()
            .call()
            .catch((e: any) => {
                throw Error(`Error getting lendingPool address: ${e.message}`)
            })

        // Make the deposit transaction via LendingPool contract
        const lpContract = new web3.eth.Contract(lendingPoolABI, lpAddress)
        await lpContract.methods
            .liquidationCall(
                collateralAddress,
                daiAddress,
                user,
                daiAmountInWei,
                receiveATokens,
            )
            .send()
            .catch((e: any) => {
                throw Error(`Error liquidating user with error: ${e.message}`)
            })
    }
}