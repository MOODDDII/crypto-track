import { Navbar } from './Components'
import {Routes, Route} from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Coins } from './Pages/Coins/Coins'

export const App = () => {
  const [coins, setCoins] = useState([])
  const API_ALL_COINS = "https://api.coinpaprika.com/v1/tickers"
  const API_SINGLE_COIN = "https://api.coinpaprika.com/v1/tickers/"

  const fetchAllCoins = async () => {
    try {
      const response = await fetch(API_ALL_COINS)
      const data = await response.json()
      setCoins(data)
    } catch (error) {
      console.error('Error fetching coins:', error)
    }
  }

  useEffect(() => {
    fetchAllCoins()
  }, [])

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Coins coins={coins} />} />
      </Routes>
    </>
  )
}
