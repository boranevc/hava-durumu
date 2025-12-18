import { useState, useEffect } from 'react'
import { WiDaySunnyOvercast } from 'react-icons/wi'
import { HiExclamationCircle } from 'react-icons/hi'
import SearchBar from './components/SearchBar'
import WeatherCard from './components/WeatherCard'
import { getWeatherData } from './services/weatherService'
import './App.css'

function App() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchWeather = async (cityName) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getWeatherData(cityName)
      setWeather(data)
    } catch (err) {
      setError(err.message || 'Hava durumu bilgisi alınamadı')
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (cityName) => {
    if (cityName.trim()) {
      fetchWeather(cityName)
    }
  }

  // Hava durumuna göre body class'ını güncelle
  useEffect(() => {
    if (weather) {
      const weatherMain = weather.weather[0].main.toLowerCase()
      const body = document.body
      
      // Önceki class'ları temizle
      body.classList.remove('weather-clear', 'weather-clouds', 'weather-rain', 'weather-snow', 'weather-fog', 'weather-thunderstorm')
      
      // Yeni class ekle
      if (weatherMain === 'clear') {
        body.classList.add('weather-clear')
      } else if (weatherMain === 'clouds') {
        body.classList.add('weather-clouds')
      } else if (weatherMain === 'thunderstorm') {
        body.classList.add('weather-thunderstorm')
      } else if (weatherMain === 'rain' || weatherMain === 'drizzle') {
        body.classList.add('weather-rain')
      } else if (weatherMain === 'snow') {
        body.classList.add('weather-snow')
      } else if (weatherMain === 'mist' || weatherMain === 'fog' || weatherMain === 'haze') {
        body.classList.add('weather-fog')
      }
    }
  }, [weather])

  return (
    <div className="app">
      <div className="container">
        <header>
          <h1>
            <WiDaySunnyOvercast style={{ fontSize: '3rem', verticalAlign: 'middle', marginRight: '12px', color: '#1a1a1a' }} />
            Hava Durumu
          </h1>
          <p className="subtitle">Hava Durumunu Öğrenmek İçin Konum Giriniz</p>
        </header>

        <SearchBar onSearch={handleSearch} loading={loading} />

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Yükleniyor...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <p>
              <HiExclamationCircle style={{ fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '8px', color: '#e74c3c' }} />
              {error}
            </p>
            <p className="error-hint">Lütfen şehir adını kontrol edin ve tekrar deneyin.</p>
          </div>
        )}

        {weather && !loading && <WeatherCard weather={weather} />}
      </div>
    </div>
  )
}

export default App

