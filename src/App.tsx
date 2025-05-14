import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip } from 'chart.js'
import { Line } from 'react-chartjs-2'
import './App.css'

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip)

type Coin = {
  id: string
  symbol: string
  name: string
  current_price: number
  market_cap: number
  price_change_percentage_24h: number
  total_volume: number
  sparkline_in_7d: { price: number[] }
}

function App() {
  const [coins, setCoins] = useState<Coin[]>([])
  const [allCoins, setAllCoins] = useState<Coin[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Coin[]>([])
  const [selected, setSelected] = useState<string[]>(['bitcoin','ethereum','cardano'])
  const [selectedChart, setSelectedChart] = useState<Coin | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // 获取所有可用的加密货币列表
  useEffect(() => {
    axios
      .get<Coin[]>(
        'https://api.coingecko.com/api/v3/coins/markets',
        {
          params: {
            vs_currency: 'usd',
            per_page: 250,
            sparkline: false
          }
        }
      )
      .then(res => setAllCoins(res.data))
  }, [])

  // 获取选定加密货币的详细数据
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

  // 处理点击外部关闭搜索建议
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    if (!value.trim()) {
      setSearchResults([])
      setShowSuggestions(false)
      return
    }

    const results = allCoins.filter(coin => 
      coin.name.toLowerCase().includes(value.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(value.toLowerCase()) ||
      coin.id.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 5) // 限制显示前5个结果

    setSearchResults(results)
    setShowSuggestions(true)
  }

  // 添加加密货币到显示列表
  const addCoin = (coin: Coin) => {
    if (!selected.includes(coin.id)) {
      setSelected(prev => [...prev, coin.id])
    }
    setSearchTerm('')
    setShowSuggestions(false)
  }

  // 移除加密货币
  const removeCoin = (coinId: string) => {
    setSelected(prev => prev.filter(id => id !== coinId))
  }

  const getChartOptions = (isModal: boolean) => ({
    responsive: true,
    maintainAspectRatio: !isModal,
    scales: {
      x: { 
        display: isModal,
        grid: { display: isModal },
        title: isModal ? { display: true, text: 'Days' } : undefined
      },
      y: { 
        display: isModal,
        grid: { display: isModal },
        title: isModal ? { display: true, text: 'Price (USD)' } : undefined
      }
    },
    elements: { 
      point: { radius: isModal ? 2 : 0 }
    },
    plugins: {
      tooltip: { enabled: isModal }
    }
  })

  return (
    <div className="App">
      <h1>CryptoPulse Dashboard</h1>
      <div className="controls">
        <div className="search-container" ref={searchRef}>
          <input
            className="search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search by name or symbol (e.g. Bitcoin, BTC)"
          />
          {showSuggestions && searchResults.length > 0 && (
            <div className="search-suggestions">
              {searchResults.map(coin => (
                <div
                  key={coin.id}
                  className="suggestion-item"
                  onClick={() => addCoin(coin)}
                >
                  <span className="coin-name">{coin.name}</span>
                  <span className="coin-symbol">{coin.symbol.toUpperCase()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid">
        {coins.map(coin => (
          <div key={coin.id} className="card">
            <div className="card-header">
              <h2>
                <span>{coin.symbol.toUpperCase()}</span>
                <span>${coin.current_price.toFixed(2)}</span>
              </h2>
              <button 
                className="remove-button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeCoin(coin.id)
                }}
              >
                ×
              </button>
            </div>
            <div className="card-content" onClick={() => setSelectedChart(coin)}>
              <p className={coin.price_change_percentage_24h >= 0 ? 'price-change-positive' : 'price-change-negative'}>
                24h: {coin.price_change_percentage_24h.toFixed(2)}%
              </p>
              <p>Market Cap: ${coin.market_cap.toLocaleString()}</p>
              <div className="chart-container">
                <Line
                  data={{
                    labels: coin.sparkline_in_7d.price.map((_, i) => i),
                    datasets: [{
                      data: coin.sparkline_in_7d.price,
                      borderColor: coin.price_change_percentage_24h >= 0 ? '#2ecc71' : '#e74c3c',
                      borderWidth: 2,
                      fill: false,
                      tension: 0.1
                    }]
                  }}
                  options={getChartOptions(false)}
                  style={{ height: '80px' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedChart && (
        <div className="modal" onClick={() => setSelectedChart(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedChart(null)}>×</button>
            <h2>{selectedChart.name} ({selectedChart.symbol.toUpperCase()})</h2>
            <Line
              data={{
                labels: selectedChart.sparkline_in_7d.price.map((_, i) => `Day ${i + 1}`),
                datasets: [{
                  label: 'Price (USD)',
                  data: selectedChart.sparkline_in_7d.price,
                  borderColor: selectedChart.price_change_percentage_24h >= 0 ? '#2ecc71' : '#e74c3c',
                  borderWidth: 2,
                  fill: false,
                  tension: 0.1
                }]
              }}
              options={{
                ...getChartOptions(true),
                plugins: {
                  tooltip: {
                    enabled: true,
                    callbacks: {
                      label: (context) => `$${context.parsed.y.toFixed(2)}`
                    }
                  }
                }
              }}
              style={{ height: '60vh' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
