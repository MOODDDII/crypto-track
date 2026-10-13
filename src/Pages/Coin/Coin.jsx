import { useParams } from "react-router-dom"

export const Coin = ({coins}) => {
  const { id } = useParams()
  const coin = coins.find((c) => c.id === id)

  if (!coin) {
    return <div>Coin not found</div>
  }

  return (
    <div className="coin">
      <h1>{coin.name}</h1>
      <p>{coin.symbol}</p>
      <p>${coin.quotes.USD.price.toFixed(2)}</p>
    </div>
  )
}
