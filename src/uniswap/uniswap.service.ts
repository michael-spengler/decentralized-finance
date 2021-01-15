
import { Fetcher, Percent, Route, TokenAmount, Trade, TradeType, WETH } from "@uniswap/sdk"
import { ethers } from "ethers"
import { uniswapJSONInterface, erc20Abi } from "./constants"

const underlyingAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'

export class UniSwapService {

    public static async swapDAIToETH(amountOfDAIToBeSwapped: number, walletAddress: string, walletPrivateKey: string, web3ProviderURL: string): Promise<void> {
        const dai = (await Fetcher.fetchTokenData(1, underlyingAddress))
        const pair = await Fetcher.fetchPairData(dai, WETH[1])
        const route = new Route([pair], dai)
        const signer = new ethers.Wallet(walletPrivateKey)
        const provider = ethers.getDefaultProvider('mainnet', { infura: web3ProviderURL })
        const account = signer.connect(provider)

        const daiSmartContract = new ethers.Contract(underlyingAddress, erc20Abi, account)
        const balanceOfDaiOnAccount = await daiSmartContract.balanceOf(walletAddress)

        const balanceScaledDown = balanceOfDaiOnAccount / 1000000000000000000
        console.log(`balance of DAI on account: ${balanceScaledDown}`)

        if (balanceScaledDown < amountOfDAIToBeSwapped) {
            throw new Error(`The balance of DAI on this account is ${balanceScaledDown}. How would I swap ${amountOfDAIToBeSwapped} DAI with that?`)
        }

        const amountOfDAIToBeSwappedScaledUp = amountOfDAIToBeSwapped * 1000000000000000000 

        const trade = new Trade(route, new TokenAmount(dai, amountOfDAIToBeSwappedScaledUp.toString()), TradeType.EXACT_INPUT)
        console.log(route.midPrice.toSignificant(6))
        console.log(trade.executionPrice.toSignificant(6))

        const slippageTolerance = new Percent('50', '10000')
        const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw

        console.log(amountOutMin.toString())

        console.log(ethers.BigNumber.from("42"))

        const path = [underlyingAddress, WETH[1].address]

        const deadline = Math.floor(Date.now() / 1000) + 60 * 2

        const uniswapSmartContract = new ethers.Contract('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', uniswapJSONInterface, account)

        const tx = await uniswapSmartContract.swapExactTokensForETH(
            balanceOfDaiOnAccount,
            amountOutMin.toString(),
            path,
            walletAddress,
            deadline
        )

        console.log(`Check your uniswap swap transaction at https://etherscan.io/tx/${tx.hash}`)
    }
}