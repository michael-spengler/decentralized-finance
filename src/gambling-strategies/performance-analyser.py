import pandas as pd
import matplotlib.pyplot as plt

dataframe = pd.read_csv("./src/gambling-strategies/statistics.csv", names=["balance_in_usdt", "portfolio_in_usdt"])

balance_in_usdt = dataframe['balance_in_usdt'].to_numpy()
portfolio_in_usdt = dataframe['portfolio_in_usdt'].to_numpy()

plt.plot(balance_in_usdt, 'blue', label='USDT Balance')
plt.plot(portfolio_in_usdt, 'red', label='Portfolio in USDT')
plt.title('Gambler Performer')
plt.xlabel('Intervals')
plt.ylabel('USDT')
plt.legend()

plt.show()