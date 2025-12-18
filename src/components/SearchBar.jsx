import { useState } from 'react'
import { HiMagnifyingGlass } from 'react-icons/hi2'
import { ImSpinner2 } from 'react-icons/im'
import './SearchBar.css'

function SearchBar({ onSearch, loading }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && !loading) {
      onSearch(input.trim())
      setInput('')
    }
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        className="search-input"
        placeholder="Şehir veya ilçe adı girin (örn: Istanbul, London, New York)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={loading}
      />
      <button type="submit" className="search-button" disabled={loading}>
        {loading ? (
          <ImSpinner2 style={{ fontSize: '1.2rem', animation: 'spin 1s linear infinite' }} />
        ) : (
          <HiMagnifyingGlass style={{ fontSize: '1.2rem' }} />
        )}
      </button>
    </form>
  )
}

export default SearchBar

