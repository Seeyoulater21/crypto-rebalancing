# 📈 Bitcoin Portfolio Rebalancer

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Site-blue?style=for-the-badge&logo=github)]([https://seeyoulater21.github.io/crypto-rebalaceing/](https://seeyoulater21.github.io/crypto-rebalancing/))
[![GitHub](https://img.shields.io/github/license/seeyoulater21/crypto-rebalaceing?style=for-the-badge)](https://github.com/seeyoulater21/crypto-rebalaceing)

An interactive backtesting tool that helps you analyze how a Bitcoin rebalancing strategy would have performed historically. Test various allocation ratios and rebalancing thresholds to optimize your crypto portfolio strategy.

## 💹 The 50:50 Rebalancing Strategy

A simple but powerful portfolio management approach that can potentially outperform buy-and-hold strategies during volatile market conditions.

### How It Works

1. **Initial Setup**
   - Split your capital equally: 50% in Bitcoin and 50% in fiat (USD or THB)

2. **Daily Monitoring**
   - Check if your Bitcoin allocation has drifted from the target ratio
   - Target allocation: 50%
   - Rebalance threshold: 5%

3. **Rebalancing Rules**
   - If Bitcoin grows to ≥55% of your portfolio → **SELL** Bitcoin to return to 50:50
   - If Bitcoin falls to ≤45% of your portfolio → **BUY** Bitcoin to return to 50:50 
   - If Bitcoin stays between 45-55% → No action needed

4. **Long-Term Benefits**
   - Automatically sells portions during bull markets (capturing profits)
   - Automatically buys during bear markets (buying the dip)
   - Reduces emotional decision-making
   - Helps manage volatility and risk

## ✨ Features

- **Customizable Parameters**
  - Initial capital amount
  - Bitcoin allocation ratio
  - Rebalancing threshold percentage
  - Date range selection

- **Dual Currency Support**
  - USD (default)
  - THB (Thai Baht)

- **Comprehensive Analysis**
  - Interactive performance chart
  - Rebalancing events visualization
  - Comparison with buy-and-hold strategy
  - Key metrics: CAGR, max drawdown, total rebalances

- **Responsive Design**
  - Works on desktop and mobile devices

## 🚀 Live Demo

Experience the tool yourself: [Bitcoin Portfolio Rebalancer](https://seeyoulater21.github.io/crypto-rebalaceing/)

## 🛠️ Technologies Used

- React
- TypeScript
- Vite
- Recharts
- ShadcnUI
- TailwindCSS

## 🧠 Why Rebalancing Works

Rebalancing is a contrarian strategy that potentially allows you to:

1. **Buy Low, Sell High** - Automatically enforces this discipline
2. **Reduce Risk** - Prevents any single asset from dominating your portfolio
3. **Remove Emotion** - Takes the guesswork out of "timing the market"
4. **Maximize Volatility Harvesting** - Takes advantage of Bitcoin's famous price swings

## 📊 Sample Results

Based on historical data, a 50:50 BTC/USD portfolio with a 5% rebalance threshold has shown:

- Reduced maximum drawdown compared to buy-and-hold
- Competitive returns with lower volatility
- Higher risk-adjusted returns in many market conditions

## 💻 Development

```bash
# Clone repository
git clone https://github.com/seeyoulater21/crypto-rebalaceing.git

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

[MIT](LICENSE)

## 📬 Contact

Project Link: [https://github.com/seeyoulater21/crypto-rebalaceing](https://github.com/seeyoulater21/crypto-rebalaceing)
