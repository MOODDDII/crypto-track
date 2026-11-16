import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import CoinFallback from './../../assets/coin-svgrepo-com.svg'
import './Coin.css'

const API = 'https://api.coinpaprika.com/v1/tickers'

const RANGES = {
  '24h': { binance: ['15m', 96], cc: ['histominute', 96, 15], gecko: 1 },
  '7d': { binance: ['1h', 168], cc: ['histohour', 168, 1], gecko: 7 },
  '30d': { binance: ['6h', 120], cc: ['histohour', 120, 6], gecko: 30 },
  '1y': { binance: ['1d', 365], cc: ['histoday', 365, 1], gecko: 365 },
}

const PERIODS = [
  ['1h', 'percent_change_1h'],
  ['24h', 'percent_change_24h'],
  ['7d', 'percent_change_7d'],
  ['30d', 'percent_change_30d'],
  ['1y', 'percent_change_1y'],
]

async function getJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function fromBinance(symbol, range) {
  const [interval, limit] = RANGES[range].binance
  const json = await getJson(
    `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=${interval}&limit=${limit}`
  )
  // [openTime, open, high, low, close, ...]
  return json.map((k) => ({ time: k[0], price: Number(k[4]) }))
}

async function fromCryptoCompare(symbol, range) {
  const [endpoint, limit, aggregate] = RANGES[range].cc
  const json = await getJson(
    `https://min-api.cryptocompare.com/data/v2/${endpoint}?fsym=${symbol}&tsym=USD&limit=${limit}&aggregate=${aggregate}`
  )
  if (json.Response === 'Error') throw new Error(json.Message)
  return json.Data.Data.filter((p) => p.close > 0).map((p) => ({
    time: p.time * 1000,
    price: p.close,
  }))
}

async function fromCoinGecko(symbol, range) {
  const search = await getJson(
    `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(symbol)}`
  )
  const match = search.coins
    .filter((c) => c.symbol.toLowerCase() === symbol.toLowerCase())
    .sort((a, b) => (a.market_cap_rank ?? 1e9) - (b.market_cap_rank ?? 1e9))[0]

  if (!match) throw new Error('Coin not found on CoinGecko')

  const json = await getJson(
    `https://api.coingecko.com/api/v3/coins/${match.id}/market_chart?vs_currency=usd&days=${RANGES[range].gecko}`
  )
  return json.prices.map(([time, price]) => ({ time, price }))
}

const LOADERS = [fromBinance, fromCryptoCompare, fromCoinGecko]

const usd = (n, digits = 2) =>
  n == null
    ? '—'
    : n.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: n < 1 ? 6 : digits,
      })

const compact = (n) =>
  n
    ? n.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 2 })
    : '—'

const pct = (n) => (n == null ? '—' : `${n.toFixed(2)}%`)

const formatTick = (ts, range) => {
  const d = new Date(ts)
  return range === '24h'
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { day: 'numeric', month: 'short' })
}

export const Coin = ({ coins }) => {
  const { id } = useParams()

  // монета
  const [coin, setCoin] = useState(() => coins.find((c) => c.id === id) ?? null)
  const [coinError, setCoinError] = useState(false)

  // графік
  const [range, setRange] = useState('7d')
  const [chartData, setChartData] = useState([])
  const [chartLoading, setChartLoading] = useState(true)
  const [chartError, setChartError] = useState(false)

  useEffect(() => {
    let ignore = false
    setCoinError(false)

    fetch(`${API}/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data) => !ignore && setCoin(data))
      .catch(() => !ignore && setCoinError(true))

    return () => {
      ignore = true
    }
  }, [id])

  useEffect(() => {
    if (!coin) return

    let ignore = false
    setChartLoading(true)
    setChartError(false)

    ;(async () => {
      let points = null

      for (const load of LOADERS) {
        try {
          const result = await load(coin.symbol, range)
          if (result.length > 1) {
            points = result
            break
          }
        } catch (err) {
          console.warn(`[chart] ${load.name} failed:`, err.message)
        }
      }

      if (ignore) return

      if (points) {
        setChartData(points)
      } else {
        setChartError(true)
      }
      setChartLoading(false)
    })()

    return () => {
      ignore = true
    }
  }, [coin?.symbol, range])

  if (!coin && coinError) return <div className="coin-page">Coin not found</div>
  if (!coin) return <div className="coin-page">Loading…</div>

  const q = coin.quotes?.USD ?? {}

  const chartUp =
    chartData.length > 1 &&
    chartData[chartData.length - 1].price >= chartData[0].price
  const chartColor = chartUp ? '#16a34a' : '#dc2626'

  return (
    <div className="coin-page">
      <Link to="/" className="coin-back">← Back to list</Link>

      <header className="coin-page-header">
        <img
          src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${coin.symbol.toLowerCase()}.png`}
          alt={coin.symbol}
          width="56"
          height="56"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = CoinFallback
          }}
        />
        <div>
          <h1>
            {coin.name} <span className="coin-symbol">{coin.symbol}</span>
          </h1>
          <p className="coin-rank">Rank #{coin.rank}</p>
        </div>
      </header>

      <section className="coin-price-block">
        <p className="coin-big-price">{usd(q.price)}</p>
        <p className={q.percent_change_24h >= 0 ? 'up' : 'down'}>
          {pct(q.percent_change_24h)} (24h)
        </p>
      </section>

      <section className="chart">
        <div className="chart-tabs">
          {Object.keys(RANGES).map((key) => (
            <button
              key={key}
              className={key === range ? 'chart-tab active' : 'chart-tab'}
              onClick={() => setRange(key)}
            >
              {key}
            </button>
          ))}
        </div>

        <div className="chart-body">
          {chartLoading && <p className="chart-message">Loading chart…</p>}

          {!chartLoading && chartError && (
            <p className="chart-message">
              Chart data is not available for this period
            </p>
          )}

          {!chartLoading && !chartError && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColor} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                <XAxis
                  dataKey="time"
                  type="number"
                  scale="time"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(ts) => formatTick(ts, range)}
                  tick={{ fontSize: 12 }}
                  minTickGap={40}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => usd(v)}
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <Tooltip
                  labelFormatter={(ts) => new Date(ts).toLocaleString()}
                  formatter={(v) => [usd(v), 'Price']}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={chartColor}
                  strokeWidth={2}
                  fill="url(#chartFill)"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="coin-periods">
        {PERIODS.map(([label, key]) => (
          <div key={key} className="coin-period">
            <span>{label}</span>
            <strong className={q[key] >= 0 ? 'up' : 'down'}>{pct(q[key])}</strong>
          </div>
        ))}
      </section>

      <section className="coin-stats">
        <div><span>Market cap</span><strong>{usd(q.market_cap, 0)}</strong></div>
        <div><span>Volume (24h)</span><strong>{usd(q.volume_24h, 0)}</strong></div>
        <div><span>Circulating supply</span><strong>{compact(coin.circulating_supply)}</strong></div>
        <div><span>Total supply</span><strong>{compact(coin.total_supply)}</strong></div>
        <div><span>Max supply</span><strong>{coin.max_supply ? compact(coin.max_supply) : '∞'}</strong></div>
        <div><span>All-time high</span><strong>{usd(q.ath_price)}</strong></div>
        <div>
          <span>ATH date</span>
          <strong>{q.ath_date ? new Date(q.ath_date).toLocaleDateString() : '—'}</strong>
        </div>
        <div><span>From ATH</span><strong className="down">{pct(q.percent_from_price_ath)}</strong></div>
      </section>
    </div>
  )
}