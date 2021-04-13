import { Observer } from "./observer"

setTimeout(async () => {
    const intervalLengthInSeconds = 5
    const maxNumberOfPatienceIntervals = 10
    // const minVolumeOverlap = 

    // the following parameters need to be supplied in case of a restart scenario
    // const currentInvestmentSymbol = "OAXBTC"
    // const currentlyInvestedUnits = 178
    // await Observer.observe(intervalLengthInSeconds, maxNumberOfPatienceIntervals, currentInvestmentSymbol, currentlyInvestedUnits)

    await Observer.observe(intervalLengthInSeconds, maxNumberOfPatienceIntervals)
})
