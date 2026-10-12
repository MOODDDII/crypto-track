export const Coins = ({coins}) => {
  return (
    <div className="coins">
      <h1>Coins</h1>
      {coins.map((coin) => (
        <div key={coin.id} className="coin">
          <h2>{coin.name}</h2>
          <p>{coin.symbol}</p>
          <p>${coin.quotes.USD.price.toFixed(2)}</p>
        </div>
      ))}
    </div>
  )
}
