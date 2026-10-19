import {Link} from "react-router-dom"
import CoinFallback from './../../assets/coin-svgrepo-com.svg'
import './Coins.css'

export const Coins = ({coins}) => {
  return (
    <>
      <h1 className="coins-title">List of the most popular crypto coins</h1>
      <div className="coins">
        {coins.map((coin) => (
          <div key={coin.id} className="coin">
            <div className="coin-header">
              <img
                src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${coin.symbol.toLowerCase()}.png`}
                alt={coin.symbol}
                width="32"
                height="32"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = CoinFallback
                }}
              />
            <p className="coin-rank">#{coin.rank}</p>
            </div>
            <p className="coin-name">Name: <span className="coinName">{coin.name}</span></p>
            <p className="coin-price">Price: <span className="coinPrice">${coin.quotes?.USD?.price?.toFixed(2) ?? '—'}</span></p>
            <p className="coin-change">
              Percent Change (24h): 
              <span className={coin.quotes.USD.percent_change_24h >= 0 ? 'up' : 'down'}>
                {coin.quotes.USD.percent_change_24h?.toFixed(2)}%
              </span>
            </p>

            <p className="coin-mcap">
              Market Cap: <span className="coinMcap">${(coin.quotes.USD.market_cap / 1e9).toFixed(2)}B</span>
            </p>
            <Link to={`/coin/${coin.id}`} className="coin-link">
              View Details
            </Link>
          </div>
        ))}
      </div>
    </>
  )
}
