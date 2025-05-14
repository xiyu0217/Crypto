# CryptoPulse Dashboard

A lightweight real-time cryptocurrency price scanner and filter built with Vercel API.


## 🚀 Quick Start

1. **Clone the repository**  
   ```bash
   git clone https://github.com/xiyu0217/CryptoPulse.git
   cd CryptoPulse
   ````

2. **Create & activate a Python virtual environment**

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate      # macOS/Linux
   # .venv\Scripts\activate       # Windows
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Run the app**

   ```bash
   streamlit run app.py
   ```

5. **Open in browser**
   Visit [http://localhost:8501](http://localhost:8501) to view the dashboard.

---

## 📑 Features

* **Watchlist**: Sidebar multi-select for coins, defaulting to top 20 by market cap

* **Metrics per coin**
  * Current price (USD)
  * 24h change (%)
  * Market cap (USD)
  * 24h volume (USD)

---

## 🔧 Project Structure

```
CryptoPulse/
├── .venv/             # Python virtual environment (not checked into Git)
├── app.py             # Streamlit application script
├── requirements.txt   # Dependencies: streamlit, pycoingecko, pandas
└── README.md          # This file
```

---

## 🛠️ Possible Extensions

* **Price Alerts**: Let users set upper/lower price thresholds and trigger browser notifications
* **Additional Filters**: Add filters for volume, market cap ranking, or custom metrics
* **Enhanced Charts**: Integrate Plotly for interactive charts and multiple timeframes
* **Deployment**: Deploy to Streamlit Community Cloud or Docker for easy sharing

---

## 🤝 Contributing & License

* Feel free to open issues or submit pull requests.
* Licensed under the [MIT License](LICENSE).

---

**Happy crypto tracking with CryptoPulse!**


