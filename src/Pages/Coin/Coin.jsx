import { useParams } from "react-router-dom"

export const Coin = ({coins}) => {
  const { id } = useParams()
  const coin = coins.find((c) => c.id === id)

  if (!coin) {
    return <div>Coin not found</div>
  }

  return (
    <div className="coin-details">
      <h1>{coin.name} ({coin.symbol})</h1>
      <p>Price: ${coin.quotes.USD.price.toFixed(2)}</p>
      <p>Rank: {coin.rank}</p>
      <p>Market cap: ${coin.quotes.USD.market_cap.toLocaleString()}</p>
      <p>24h change: {coin.quotes.USD.percent_change_24h}%</p>
    </div>
  )
}
