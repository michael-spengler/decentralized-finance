
export function getLowestPriceOfRecentXIntervals(historicData: number[], numberOfIntervalsToBeRegarded: number, randomizerMax?: number): number {
    let lowestPrice = 1000000000000
    let counter = 0
    const limit = (randomizerMax === undefined) ? numberOfIntervalsToBeRegarded : Math.floor(Math.random()*(randomizerMax-numberOfIntervalsToBeRegarded+1)+numberOfIntervalsToBeRegarded);

    const startPosition = historicData.length - limit

    for (const e of historicData) {
        counter++
        if (counter >= startPosition) {
            if (e < lowestPrice) {
                lowestPrice = e
            }
        }
    }

    return lowestPrice
}

export function getHighestPriceOfRecentXIntervals(historicData: number[], numberOfIntervalsToBeRegarded: number, randomizerMax?: number): number {

    let highestPrice = 0
    let counter = 0
    const limit = (randomizerMax === undefined) ? numberOfIntervalsToBeRegarded : Math.floor(Math.random()*(randomizerMax-numberOfIntervalsToBeRegarded+1)+numberOfIntervalsToBeRegarded);

    const startPosition = historicData.length - limit

    for (const e of historicData) {
        counter++
        if (counter >= startPosition) {
            if (e > highestPrice) {
                highestPrice = e
            }
        }
    }

    return highestPrice
}
