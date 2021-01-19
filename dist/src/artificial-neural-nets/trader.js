"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trader = void 0;
const axios_1 = require("axios");
const fsExtra = require('fs-extra');
const brainFactory = require('brain.js');
class Trader {
    constructor(earningWindowInMinutes, binaryThresh, hiddenLayers, activation, leakyReluAlpha) {
        const hyperParameters = {
            binaryThresh,
            hiddenLayers,
            activation,
            leakyReluAlpha,
        };
        this.brain = new brainFactory.NeuralNetwork(hyperParameters);
        this.earningWindowInMinutes = earningWindowInMinutes;
        this.relativePathToTrainingData = './src/artificial-neural-nets/example-data-history.json';
    }
    async trainModel(trainingData) {
        if (trainingData === undefined) {
            const exampleDataHistory = await fsExtra.readJson(this.relativePathToTrainingData);
            let previousEtherPrice = 0;
            const neuralNetInputArray = [];
            for (const entry of exampleDataHistory) {
                const bitcoin = entry.data[0];
                const ether = entry.data[1];
                if (previousEtherPrice === 0 || previousEtherPrice === ether.quote.USD.price) {
                    // relax
                }
                else if (previousEtherPrice < ether.quote.USD.price) {
                    const neuralNetInputArrayEntry = { input: [bitcoin.quote.USD.price, ether.quote.USD.price], output: [1] };
                    neuralNetInputArray.push(neuralNetInputArrayEntry);
                }
                else if (previousEtherPrice > ether.quote.USD.price) {
                    const neuralNetInputArrayEntry = { input: [bitcoin.quote.USD.price, ether.quote.USD.price], output: [0] };
                    neuralNetInputArray.push(neuralNetInputArrayEntry);
                }
                previousEtherPrice = ether.quote.USD.price;
            }
            console.log(`training the model with ${neuralNetInputArray.length} concrete entries.`);
            this.brain.train(neuralNetInputArray);
        }
        else {
            this.brain.train(trainingData);
        }
    }
    async giveMeYourGuess() {
        setInterval(async () => {
            const currentData = (await axios_1.default.get('https://openforce.de/getPrice')).data.coinmarketcapResult;
            const bitcoin = currentData.data[0];
            const ether = currentData.data[1];
            const result = this.brain.run([bitcoin.quote.USD.price, ether.quote.USD.price]);
            const action = (result[0] > 0.5) ? 'rise' : 'dip';
            console.log(`At the moment (${currentData.status.timestamp}) I guess the Ether price will ${action} within the upcoming ${this.earningWindowInMinutes} minutes. Insight: ${result[0]}`);
        }, 1000 * 60 * this.earningWindowInMinutes);
    }
    observe() {
        console.log(`Observing prices to give you some guesses. I'll give you my next guess in ${this.earningWindowInMinutes} minutes.`);
        let exampleDataHistory = [];
        setInterval(async () => {
            try {
                exampleDataHistory = await fsExtra.readJson(this.relativePathToTrainingData);
            }
            catch (error) {
                await fsExtra.writeFileSync(this.relativePathToTrainingData, JSON.stringify(exampleDataHistory));
            }
            const currentData = (await axios_1.default.get('https://openforce.de/getPrice')).data.coinmarketcapResult;
            exampleDataHistory.push(currentData);
            await fsExtra.writeFileSync(this.relativePathToTrainingData, JSON.stringify(exampleDataHistory));
            const bitcoin = currentData.data[0];
            const ether = currentData.data[1];
            await this.trainModel();
        }, 1000 * 60 * 0.1); // every 10 seconds
    }
}
exports.Trader = Trader;
