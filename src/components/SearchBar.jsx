import { useState, useEffect, useRef } from 'react'
import { HiMagnifyingGlass } from 'react-icons/hi2'
import { ImSpinner2 } from 'react-icons/im'
import { getCitySuggestions } from '../services/weatherService'
import './SearchBar.css'

function SearchBar({ onSearch, loading }) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const searchBarRef = useRef(null)
  const suggestionsRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBarRef.current && 
        !searchBarRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (input.trim().length >= 2) {
        setLoadingSuggestions(true)
        try {
          const results = await getCitySuggestions(input.trim())
          setSuggestions(results)
          setShowSuggestions(results.length > 0)
        } catch (error) {
          setSuggestions([])
          setShowSuggestions(false)
        } finally {
          setLoadingSuggestions(false)
        }
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }

    // Debounce süresini artırdık (300ms -> 500ms) - daha az API çağrısı
    const debounceTimer = setTimeout(fetchSuggestions, 500)
    return () => clearTimeout(debounceTimer)
  }, [input])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && !loading) {
      onSearch(input.trim())
      setInput('')
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    // OpenWeatherMap için optimize edilmiş formatı kullan
    // searchQuery varsa onu kullan, yoksa şehir adını kullan
    const searchQuery = suggestion.searchQuery || suggestion.name
    onSearch(searchQuery)
    setInput('')
    setShowSuggestions(false)
  }

  return (
    <div className="search-container" ref={searchBarRef}>
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          className="search-input"
          placeholder="Şehir veya ilçe adı girin (Istanbul, London, New York)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
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

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-list" ref={suggestionsRef}>
          {loadingSuggestions ? (
            <div className="suggestion-item">
              <span>Yükleniyor...</span>
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <span className="suggestion-name">{suggestion.displayName || suggestion.name}</span>
                <span className="suggestion-location">
                  {suggestion.country}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar

