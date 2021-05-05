Feature('win');

Scenario('test something', ({ I }) => {
    I.amOnPage('https://coinmarketcap.com/currencies/bitcoin/')
    I.wait(3)
    I.click('#react-tabs-0')
    I.wait(5)
    const d = new Date()
    I.saveScreenshot(`${d}.png`);
    I.wait(5)
});
