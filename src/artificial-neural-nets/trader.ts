
import axios from "axios"

const fsExtra = require('fs-extra')
const brainFactory = require('brain.js')

export class Trader {

    private brain: any // an artificial feedforward neural net with backpropagation 

    private earningWindowInMinutes: number

    private observationRateInMinutes: number

    private pathToTrainingData: string


    public constructor(earningWindowInMinutes: number, observationRateInMinutes: number, binaryThresh: number, hiddenLayers: any[], activation: string, leakyReluAlpha: number) {

        const hyperParameters = {
            binaryThresh,
            hiddenLayers, // array of ints for the sizes of the hidden layers in the network
            activation, // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
            leakyReluAlpha, // supported for activation type 'leaky-relu'
        }

        this.brain = new brainFactory.NeuralNetwork(hyperParameters)

        this.earningWindowInMinutes = earningWindowInMinutes

        this.observationRateInMinutes = observationRateInMinutes

        this.pathToTrainingData = `${__dirname}/example-data-history.json`

        if ((earningWindowInMinutes / observationRateInMinutes) < 2) {
            throw new Error("Please make sure that the earningWindowInMinutes is at least twice as high as the observationRateInMinutes.")
        }
    }


    public async trainModel(trainingData?: any[]) {

        if (trainingData === undefined) {
            const exampleDataHistory = await fsExtra.readJson(this.pathToTrainingData)

            let previousEtherPrice: number = 0

            const neuralNetInputArray = []
            for (const entry of exampleDataHistory) {

                const bitcoin = entry.data[0]
                const ether = entry.data[1]


                if (previousEtherPrice === ether.quote.USD.price) {
                    console.log(`not adding entry related to timestamp ${entry.status.timestamp} and ether price ${ether.quote.USD.price}`)
                } else if (previousEtherPrice < ether.quote.USD.price) {
                    const neuralNetInputArrayEntry = { input: [bitcoin.quote.USD.price, ether.quote.USD.price], output: [1] }
                    neuralNetInputArray.push(neuralNetInputArrayEntry)
                    console.log(`pushing a new concrete rise pattern.`)
                } else if (previousEtherPrice > ether.quote.USD.price) {
                    const neuralNetInputArrayEntry = { input: [bitcoin.quote.USD.price, ether.quote.USD.price], output: [0] }
                    neuralNetInputArray.push(neuralNetInputArrayEntry)
                    console.log(`pushing a new concrete dip pattern.`)
                }

                previousEtherPrice = ether.quote.USD.price
            }

            console.log(`training the model with ${neuralNetInputArray.length} concrete entries.`)
            this.brain.train(neuralNetInputArray)

        } else {

            this.brain.train(trainingData)

        }

    }


    public async giveMeYourGuess(): Promise<void> {
        setInterval(async () => {

            await this.trainModel()
            const currentData = (await axios.get('https://openforce.de/getPrice')).data.coinmarketcapResult

            const bitcoin = currentData.data[0]
            const ether = currentData.data[1]

            const result = this.brain.run([bitcoin.quote.USD.price, ether.quote.USD.price])

            const action = (result[0] > 0.5) ? 'rise' : 'dip'

            console.log(`At the moment (${currentData.status.timestamp}) I guess the Ether price will ${action} within the upcoming ${this.earningWindowInMinutes} minutes. Insight: ${result[0]}`)

        }, 1000 * 60 * this.earningWindowInMinutes)
    }



    public observe() {

        console.log(`Observing prices to give you some guesses. I'll give you my next guess in ${this.earningWindowInMinutes} minutes.`)

        let exampleDataHistory: any[] = []

        let previousTimeStamp: string

        setInterval(async () => {

            try {
                exampleDataHistory = await fsExtra.readJson(this.pathToTrainingData)
            } catch (error) {

                const dataFromDenoRepo = (await axios.get('https://github.com/michael-spengler/defi-deno/blob/main/feedforward-net-with-backpropagation/test-data.json')).data

                await fsExtra.writeFileSync(this.pathToTrainingData, JSON.stringify(dataFromDenoRepo))
                // await fsExtra.writeFileSync(this.pathToTrainingData, JSON.stringify(exampleDataHistory))
            }

            const currentData = (await axios.get('https://openforce.de/getPrice')).data.coinmarketcapResult

            console.log(previousTimeStamp)
            console.log(currentData.status.timestamp)

            if (previousTimeStamp === undefined || (new Date(currentData.status.timestamp) > new Date(previousTimeStamp))) {
                exampleDataHistory.push(currentData)
                previousTimeStamp = currentData.status.timestamp
            }

            await fsExtra.writeFileSync(this.pathToTrainingData, JSON.stringify(exampleDataHistory))

        }, 1000 * 60 * this.observationRateInMinutes) // every observationRateInMinutes minutes

    }
}

