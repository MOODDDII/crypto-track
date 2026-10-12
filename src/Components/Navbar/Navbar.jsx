import { Link } from 'react-router-dom'

export const Navbar = () => {
  return (
    <div className="navbar">
      <h1 className="navbar-title">🪙 Crypto Tracker</h1>
      <input type="text" placeholder="Search for a coin..." className="navbar-search" />
    </div>
  )
}
