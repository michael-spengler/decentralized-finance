var fs = require('fs-extra');

Feature('win');

Scenario('collect training data', async ({ I }) => {

    I.amOnPage('https://www.google.com/finance/quote/BTC-USD')
    I.wait(5)

    let html = await I.grabHTMLFrom('main');

    const currentPrice = html.split('data-last-price="')[1].split('"')[0]


    const previousFileName = await fs.readFile(`${__dirname}/prev.txt`, 'utf8')

    console.log(previousFileName);

    const previousPrice = previousFileName.split('-')[1].split('.png')[0]


    const renameTo = (previousPrice > currentPrice) ? `${__dirname}/output/sell-signal-${previousFileName.split('.png')[0]}.png` : `${__dirname}/output/buy-signal-${previousFileName.split('.png')[0]}.png`
    I.wait(3)
    I.say(`Ich will die Datei ${previousFileName} umbenennen in: ${renameTo}`)

    await fs.rename(`${__dirname}/output/${previousFileName}`, renameTo)

    currentFileName = `${new Date().valueOf()}-${currentPrice}.png`

    I.saveScreenshot(currentFileName);

    await fs.writeFile(`${__dirname}/prev.txt`, currentFileName)

});
