import './WeatherCard.css'
import { 
  WiDaySunny, 
  WiCloudy, 
  WiRain, 
  WiDayRain, 
  WiThunderstorm, 
  WiSnow, 
  WiFog,
  WiDayHaze,
  WiThermometer,
  WiHumidity,
  WiStrongWind,
  WiBarometer,
  WiDaySunnyOvercast,
  WiSunrise,
  WiSunset,
  WiRaindrops
} from 'react-icons/wi'
import { getPrecipitationProbability } from '../services/weatherService'

function WeatherCard({ weather }) {
  const getWeatherIcon = (main, size = '5rem') => {
    const iconStyle = { fontSize: size, color: '#1a1a1a' }
    const icons = {
      Clear: <WiDaySunny style={iconStyle} />,
      Clouds: <WiCloudy style={iconStyle} />,
      Rain: <WiRain style={iconStyle} />,
      Drizzle: <WiDayRain style={iconStyle} />,
      Thunderstorm: <WiThunderstorm style={iconStyle} />,
      Snow: <WiSnow style={iconStyle} />,
      Mist: <WiDayHaze style={iconStyle} />,
      Fog: <WiDayHaze style={iconStyle} />,
      Haze: <WiDayHaze style={iconStyle} />,
    }
    return icons[main] || <WiDaySunnyOvercast style={iconStyle} />
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (timestamp, timezoneOffset = 0) => {
    // API'den gelen timestamp UTC'dir, timezone offset'i ekleyerek doğru saati hesapla
    // timezone offset saniye cinsinden (örn: 10800 = UTC+3, -18000 = UTC-5)
    // UTC timestamp'e timezone offset ekleyerek local time'ı buluyoruz
    const localTimestamp = (timestamp + timezoneOffset) * 1000
    const date = new Date(localTimestamp)
    
    // UTC timezone kullanarak formatla (çünkü zaten offset'i ekledik)
    const hours = String(date.getUTCHours()).padStart(2, '0')
    const minutes = String(date.getUTCMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const getWeatherDescription = (weather) => {
    const main = weather.weather[0].main
    const description = weather.weather[0].description.toLowerCase()
    const temp = Math.round(weather.main.temp)
    const humidity = weather.main.humidity
    const windSpeed = weather.wind?.speed || 0

    let desc = ''

    if (main === 'Clear') {
      if (temp > 25) {
        desc = 'Güneşli ve sıcak bir gün. Dışarıda vakit geçirmek için mükemmel! ☀️'
      } else if (temp > 15) {
        desc = 'Açık ve güzel bir hava. Hafif bir ceket yeterli olabilir. 🌞'
      } else {
        desc = 'Açık ama serin bir gün. Kalın giyinmeyi unutmayın. 🌤️'
      }
    } else if (main === 'Clouds') {
      const precipitationProb = getPrecipitationProbability(weather)
      if (description.includes('few') || description.includes('az')) {
        desc = 'Parçalı bulutlu. Güneş ara sıra görünüyor. ⛅'
      } else if (description.includes('scattered') || description.includes('dağınık')) {
        desc = 'Dağınık bulutlar var. Hava genelde açık. ☁️'
      } else {
        if (precipitationProb > 50) {
          desc = `Bulutlu bir gün. Yağmur ihtimali %${precipitationProb}. Şemsiye almayı unutmayın. ☁️`
        } else if (precipitationProb > 20) {
          desc = `Bulutlu bir gün. Yağmur ihtimali %${precipitationProb}. Hafif bir şemsiye alabilirsiniz. ☁️`
        } else {
          desc = 'Bulutlu bir gün. Yağmur ihtimali düşük. ☁️'
        }
      }
    } else if (main === 'Rain') {
      if (description.includes('light') || description.includes('hafif')) {
        desc = 'Hafif yağmur yağıyor. Şemsiye almayı unutmayın. 🌦️'
      } else if (description.includes('moderate') || description.includes('orta')) {
        desc = 'Orta şiddette yağmur var. Dışarı çıkarken dikkatli olun. 🌧️'
      } else {
        desc = 'Şiddetli yağmur bekleniyor. Mümkünse evde kalın. ⛈️'
      }
    } else if (main === 'Drizzle') {
      desc = 'Çiseleyen yağmur var. Hafif bir şemsiye yeterli. 🌦️'
    } else if (main === 'Thunderstorm') {
      desc = 'Fırtına ve şimşek var! Dışarı çıkmaktan kaçının. ⛈️'
    } else if (main === 'Snow') {
      if (description.includes('light') || description.includes('hafif')) {
        desc = 'Hafif kar yağıyor. Yollar kaygan olabilir. ❄️'
      } else {
        desc = 'Kar yağıyor. Sıcak giyinmeyi ve dikkatli olmayı unutmayın. ❄️'
      }
    } else if (main === 'Mist' || main === 'Fog') {
      desc = 'Sisli bir hava. Görüş mesafesi düşük, araç kullanırken dikkatli olun. 🌫️'
    } else if (main === 'Haze') {
      desc = 'Puslu bir hava. Hava kalitesi düşük olabilir. 🌫️'
    } else {
      desc = weather.weather[0].description.charAt(0).toUpperCase() + weather.weather[0].description.slice(1)
    }

    // Ek bilgiler
    if (windSpeed > 10) {
      desc += ' Güçlü rüzgar var.'
    } else if (windSpeed > 5) {
      desc += ' Orta şiddette rüzgar var.'
    }

    if (humidity > 80) {
      desc += ' Hava oldukça nemli.'
    } else if (humidity < 30) {
      desc += ' Hava kuru.'
    }

    return desc
  }

  const precipitationProb = getPrecipitationProbability(weather)

  return (
    <div className="weather-card">
      <div className="weather-header">
        <div className="location">
          <h2>{weather.name}</h2>
          <p className="country">{weather.sys.country}</p>
        </div>
        <div className="weather-icon">
          {getWeatherIcon(weather.weather[0].main, '5rem')}
        </div>
      </div>

      <div className="weather-main">
        <div className="temperature">
          <span className="temp-value">{Math.round(weather.main.temp)}</span>
          <span className="temp-unit">°C</span>
        </div>
        <div className="description">
          <p className="weather-desc">{getWeatherDescription(weather)}</p>
          <div className="feels-like-container">
            <span className="feels-like-label">Hissedilen sıcaklık</span>
            <span className="feels-like-value">{Math.round(weather.main.feels_like)}°C</span>
          </div>
          
          {weather.dailyForecast && weather.dailyForecast.length > 0 && (
            <div className="weekly-forecast">
              <h3 className="weekly-title">7 Günlük Tahmin</h3>
              <div className="weekly-items">
            {weather.dailyForecast.map((day, index) => {
              const dayName = index === 0 
                ? 'Bugün' 
                : new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' })
              const dateStr = new Date(day.date).toLocaleDateString('tr-TR', { 
                day: 'numeric', 
                month: 'short' 
              })
              
              return (
                <div key={index} className="weekly-item">
                  <div className="weekly-day">{dayName}</div>
                  <div className="weekly-date">{dateStr}</div>
                  <div className="weekly-icon">
                    {getWeatherIcon(day.weather.main, '1.8rem')}
                  </div>
                  <div className="weekly-temp">
                    <span className="weekly-temp-max">{day.tempMax}°</span>
                    <span className="weekly-temp-min">{day.tempMin}°</span>
                  </div>
                  {day.pop > 0 && (
                    <div className="weekly-pop">{day.pop}%</div>
                  )}
                </div>
              )
            })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="weather-details">
        <div className="detail-item">
          <span className="detail-label">
            <WiThermometer style={{ fontSize: '1.2rem', marginRight: '6px', verticalAlign: 'middle' }} />
            Min/Max
          </span>
          <span className="detail-value">
            {Math.round(weather.main.temp_min)}° / {Math.round(weather.main.temp_max)}°
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">
            <WiHumidity style={{ fontSize: '1.2rem', marginRight: '6px', verticalAlign: 'middle' }} />
            Nem
          </span>
          <span className="detail-value">{weather.main.humidity}%</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">
            <WiStrongWind style={{ fontSize: '1.2rem', marginRight: '6px', verticalAlign: 'middle' }} />
            Rüzgar
          </span>
          <span className="detail-value">{weather.wind?.speed || 0} m/s</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">
            <WiBarometer style={{ fontSize: '1.2rem', marginRight: '6px', verticalAlign: 'middle' }} />
            Basınç
          </span>
          <span className="detail-value">{weather.main.pressure} hPa</span>
        </div>
        {weather.visibility !== undefined && (
          <div className="detail-item">
            <span className="detail-label">
              <WiDayHaze style={{ fontSize: '1.2rem', marginRight: '6px', verticalAlign: 'middle' }} />
              Görüş
            </span>
            <span className="detail-value">{(weather.visibility / 1000).toFixed(1)} km</span>
          </div>
        )}
        {precipitationProb > 0 && (
          <div className="detail-item detail-item-precipitation">
            <span className="detail-label">
              <WiRaindrops style={{ fontSize: '1.2rem', marginRight: '6px', verticalAlign: 'middle' }} />
              Yağmur İhtimali
            </span>
            <span className="detail-value">{precipitationProb}%</span>
          </div>
        )}
        <div className="detail-item">
          <span className="detail-label">
            <WiSunrise style={{ fontSize: '1.2rem', marginRight: '6px', verticalAlign: 'middle' }} />
            Gündoğumu
          </span>
          <span className="detail-value">{formatTime(weather.sys.sunrise, weather.timezone)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">
            <WiSunset style={{ fontSize: '1.2rem', marginRight: '6px', verticalAlign: 'middle' }} />
            Günbatımı
          </span>
          <span className="detail-value">{formatTime(weather.sys.sunset, weather.timezone)}</span>
        </div>
      </div>

      <div className="weather-footer">
        <p className="update-time">
          Son güncelleme: {formatTime(weather.dt, weather.timezone)}
        </p>
      </div>
    </div>
  )
}

export default WeatherCard

