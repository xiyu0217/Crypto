import { useEffect, useState } from 'react'
import axios from 'axios'
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js'
import { Line } from 'react-chartjs-2'
import './App.css'

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale)

type Coin = {
  id: string
  symbol: string
  current_price: number
  market_cap: number
  price_change_percentage_24h: number
  total_volume: number
  sparkline_in_7d: { price: number[] }
}

function App() {
  const [coins, setCoins] = useState<Coin[]>([])
  const [selected, setSelected] = useState<string[]>(['bitcoin','ethereum','cardano'])

  useEffect(() => {
    if (selected.length === 0) return
    axios
      .get<Coin[]>(
        `https://api.coingecko.com/api/v3/coins/markets`,
        {
          params: {
            vs_currency: 'usd',
            ids: selected.join(','),
            sparkline: true,
            price_change_percentage: '24h'
          }
        }
      )
      .then(res => setCoins(res.data))
  }, [selected])

  return (
    <div className="App">
      <h1>CryptoPulse Dashboard</h1>
      <div className="controls">
        <label>Watchlist (comma‐separated):</label>
        <input
          type="text"
          value={selected.join(',')}
          onChange={e => setSelected(e.target.value.split(',').map(s=>s.trim()))}
          style={{width: '300px'}}
        />
      </div>

      <div className="grid">
        {coins.map(coin => (
          <div key={coin.id} className="card">
            <h2>{coin.symbol.toUpperCase()} ${coin.current_price.toFixed(2)}</h2>
            <p>24h: {coin.price_change_percentage_24h.toFixed(2)}%</p>
            <p>Market Cap: ${coin.market_cap.toLocaleString()}</p>
            <Line
              data={{
                labels: coin.sparkline_in_7d.price.map((_, i) => i),
                datasets: [{
                  data: coin.sparkline_in_7d.price,
                  borderColor: 'blue',
                  borderWidth: 1
                }]
              }}
              options={{ scales: { x: { display: false }, y: { display: false } }, elements: { point: { radius: 0 } } }}
              style={{ height: '80px' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
