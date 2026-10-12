import { Navbar } from './Components'
import {Routes, Route} from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Coins } from './Pages/Coins/Coins'

export const App = () => {
  const [coins, setCoins] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  // API endpoints
  const API_ALL_COINS = "https://api.coinpaprika.com/v1/tickers"
  const API_SINGLE_COIN = "https://api.coinpaprika.com/v1/tickers/"

  // Fetch all coins from the API and set the state
  const fetchAllCoins = async () => {
    try {
      const response = await fetch(API_ALL_COINS)
      const data = await response.json()
      setCoins(data)
    } catch (error) {
      console.error('Error fetching coins:', error)
    }
  }

  // Filter coins based on the search term
  const filteredCoins = coins.filter((coin) =>
    coin.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    fetchAllCoins()
  }, [])

  return (
    <>
      <Navbar filterCoins={setSearchTerm} />
      <Routes>
        <Route path="/" element={<Coins coins={filteredCoins} />} />
      </Routes>
    </>
  )
}
