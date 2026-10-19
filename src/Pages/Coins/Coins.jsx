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
            <h2 className="coin-rank">#{coin.rank}</h2>
            </div>
            <h2 className="coin-name">{coin.name}</h2>
            <p className="coin-price">${coin.quotes?.USD?.price?.toFixed(2) ?? '—'}</p>
            <Link to={`/coin/${coin.id}`} className="coin-link">
              View Details
            </Link>
          </div>
        ))}
      </div>
    </>
  )
}
