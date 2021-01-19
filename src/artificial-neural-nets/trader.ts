
import axios from "axios"

const fsExtra = require('fs-extra')
const brainFactory = require('brain.js')

export class Trader {

    private brain: any // an artificial feedforward neural net with backpropagation 

    private earningWindowInMinutes: number

    private relativePathToTrainingData: string


    public constructor(earningWindowInMinutes: number, binaryThresh: number, hiddenLayers: any[], activation: string, leakyReluAlpha: number) {

        const hyperParameters = {
            binaryThresh,
            hiddenLayers, // array of ints for the sizes of the hidden layers in the network
            activation, // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
            leakyReluAlpha, // supported for activation type 'leaky-relu'
        }

        this.brain = new brainFactory.NeuralNetwork(hyperParameters)

        this.earningWindowInMinutes = earningWindowInMinutes

        this.relativePathToTrainingData = './src/artificial-neural-nets/example-data-history.json'
    }


    public async trainModel(trainingData?: any[]) {

        if (trainingData === undefined) {
            const exampleDataHistory = await fsExtra.readJson(this.relativePathToTrainingData)

            let previousEtherPrice: number = 0

            const neuralNetInputArray = []
            for (const entry of exampleDataHistory) {

                const bitcoin = entry.data[0]
                const ether = entry.data[1]

                
                if (previousEtherPrice === 0 || previousEtherPrice === ether.quote.USD.price) {
                    // relax
                } else if (previousEtherPrice < ether.quote.USD.price) {
                    const neuralNetInputArrayEntry = { input: [bitcoin.quote.USD.price, ether.quote.USD.price], output: [1] }
                    neuralNetInputArray.push(neuralNetInputArrayEntry)
                } else if (previousEtherPrice > ether.quote.USD.price) {
                    const neuralNetInputArrayEntry = { input: [bitcoin.quote.USD.price, ether.quote.USD.price], output: [0] }
                    neuralNetInputArray.push(neuralNetInputArrayEntry)
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

        setInterval(async () => {

            try {
                exampleDataHistory = await fsExtra.readJson(this.relativePathToTrainingData)
            } catch (error) {
                await fsExtra.writeFileSync(this.relativePathToTrainingData, JSON.stringify(exampleDataHistory))
            }

            const currentData = (await axios.get('https://openforce.de/getPrice')).data.coinmarketcapResult

            exampleDataHistory.push(currentData)

            await fsExtra.writeFileSync(this.relativePathToTrainingData, JSON.stringify(exampleDataHistory))

            const bitcoin = currentData.data[0]
            const ether = currentData.data[1]

            await this.trainModel()

        }, 1000 * 60 * 0.1) // every 10 seconds

    }
}

