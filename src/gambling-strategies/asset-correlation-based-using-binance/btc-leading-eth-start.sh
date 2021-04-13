import { BinanceConnector } from "../binance-connector"


let currentPrices: any[] = []
let previousPrices: any[] = []
const intervalLengthInSeconds = Number(process.argv[2])

setInterval(async () => {
    //    currentPrices = await BinanceConnector.getCurrentPrices()

    // await Observer.applyPumpExploitStrategy(maxNumberOfPatienceIntervals, currentInvestmentSymbol, currentlyInvestedUnits)

    // await Observer.applyBTCLeadExploitStrategy(maxNumberOfPatienceIntervals, size, difference, currentInvestmentSymbol, currentlyInvestedUnits)
    // await Observer.TradingTeamStrategy(maxNumberOfPatienceIntervals, currentInvestmentSymbol, currentlyInvestedUnits)
    // await Observer.SAPHackathonStrategy1(maxNumberOfPatienceIntervals, currentInvestmentSymbol, currentlyInvestedUnits)
    // await Observer.applyBenesBTCLeadExploitStrategy(maxNumberOfPatienceIntervals, currentInvestmentSymbol, currentlyInvestedUnits)

    console.log('ok')
    previousPrices = [...currentPrices]
}, intervalLengthInSeconds * 1000)
