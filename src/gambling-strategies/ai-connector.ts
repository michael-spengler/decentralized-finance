

// Check https://github.com/DHBWMannheim/MachineLearning/blob/master/machineLearning.ipynb 

import axios from "axios"

export class AIConnector {

    public static async isThereASeriousVetoFromATAPerspective(currentEtherPrice: number, pair: string): Promise<boolean> {

        try {
            const taForecastEntry = (await axios.get(`https://ml.aaronschweig.dev/technical/${pair.substr(0, 3)}-USD?days=1`)).data[1][0]
            if (new Date() < new Date(taForecastEntry.date)) { // there was an error in the dependency - that's why I introduced this
                const predictedETHPriceBasedOnTA = taForecastEntry.value
                const percentage = ((predictedETHPriceBasedOnTA - currentEtherPrice) / currentEtherPrice) * 100
                if (percentage > 0) {
                    // console.log(`The technical analysis indicates that the ${pair} price will rise by about ${percentage} percent`)
                } else if (percentage < -4) {
                    // console.log(`The technical analysis indicates that the ${pair} price will decline by about ${percentage} percent. Even considering a buffer I suggest to sell the long position.`)
                    return true
                }

                return false
            }

        } catch (error) {

            console.log(`shit happened retrieving technical analysis results: ${error.message}`)

        }

        return false
    }

    public static async isThereASeriousVetoFromASAPerspective(): Promise<boolean> {
        // sentiment analysis has some errors regarding quota leverage optimization
        // let sentiment
        // try {
        //     sentiment = (await axios.get('https://ml.aaronschweig.dev/sentiment/twitter')).data

        //     const referenceDate24HoursAgo = new Date(new Date().getTime() - 24 * 3600 * 1000)

        //     let counter = 0
        //     let sumSMA = 0
        //     let sumValue = 0

        //     while (counter < sentiment.length) {
        //         sumSMA = sumSMA + sentiment[counter].sma
        //         sumValue = sumValue + sentiment[counter].value
        //         counter++
        //     }

        //     const averageSMA = sumSMA / sentiment.length
        //     const averageValue = sumValue / sentiment.length

        //     // console.log(`averageSMA: ${averageSMA} - averageValue: ${averageValue}`)

        //     let magicFactorSMA
        //     let magicFactorValue
        //     if (sentiment[0].date < referenceDate24HoursAgo) {
        //         console.log(`${sentiment[0].date} is before ${referenceDate24HoursAgo} - which means not so many quality accounts post about it`)
        //         magicFactorSMA = averageSMA - 0, 1
        //         magicFactorValue = averageValue - 0, 1
        //     } else {
        //         magicFactorSMA = averageSMA + 0, 1
        //         magicFactorValue = averageValue + 0, 1
        //     }

        //     if (magicFactorValue < 0.5 || magicFactorSMA < 0.5) {
        //         console.log(`The sentiment analysis indicates that being long is a bad idea atm based on magicFactorSMA: ${magicFactorSMA} and magicFactorValue: ${magicFactorValue}`)
        //         return true
        //     }

        // } catch (error) {
        //     console.log(`shit happened retrieving sentiment analysis results: ${error.message}`)
        // }
        
        return false
    }
}