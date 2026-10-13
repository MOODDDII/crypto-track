import {Link} from "react-router-dom"
import './Coins.css'

export const Coins = ({coins}) => {
  return (
    <>
      <h1 className="coins-title">List of the most popular crypto coins</h1>
      <div className="coins">
        {coins.map((coin) => (
          <div key={coin.id} className="coin">
            <h2>{coin.name}</h2>
            <p>{coin.symbol}</p>
            <p>${coin.quotes.USD.price.toFixed(2)}</p>
            <Link to={`/coin/${coin.id}`}>View Details</Link>
          </div>
        ))}
      </div>
    </>
  )
}
