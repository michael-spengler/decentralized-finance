// http://65.21.110.40:3000/getpp

import axios from "axios"
const brain = require('brain.js')

const a = Number(process.argv[2]) // e.g. 0.9
const b = Number(process.argv[3]) // e.g. 0.4


setTimeout(async () => {
    const trainingData = JSON.parse((await axios.get('http://65.21.110.40:3003/getpp')).data)


    const preparedArray = []

    for (const e of trainingData) {
        preparedArray.push(Math.round(e))
    }

    const net = new brain.recurrent.LSTMTimeStep();

    net.train([preparedArray.splice(0, 3)]);

    const output = net.run([a, b]);

    console.log(output)
}, 1000)




// const net = new brain.recurrent.LSTMTimeStep();
// console.log(trainingData)

// net.train([trainingData]);

// const output = net.run([trainingData[trainingData.length-2], trainingData[trainingData.length-1]]); 
