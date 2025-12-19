// OpenWeatherMap API servisi
// API Key'inizi https://openweathermap.org/api adresinden ücretsiz alabilirsiniz

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || 'YOUR_API_KEY_HERE'
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast'
const DAILY_FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast/daily'
const GEOCODING_URL = 'https://api.openweathermap.org/geo/1.0/direct'
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

// Cache için basit bir Map
const cache = new Map()
const CACHE_TTL = 10 * 60 * 1000 // 10 dakika (mevcut hava durumu için)
const DAILY_CACHE_TTL = 3 * 60 * 60 * 1000 // 3 saat (7 günlük tahmin için - API her 3 saatte bir güncelliyor)

// Debug: API anahtarının okunup okunmadığını kontrol et
console.log('API Key kontrol:', API_KEY ? 'Bulundu' : 'Bulunamadı')
console.log('API Key uzunluk:', API_KEY?.length || 0)

// Günün tarihini al (sadece tarih, saat değil)
const getTodayKey = () => {
  const today = new Date()
  return `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
}

// Cache kontrolü - günlük cache kontrolü ile
const getCachedData = (key, isDailyForecast = false) => {
  const cached = cache.get(key)
  if (!cached) return null
  
  const now = Date.now()
  const ttl = isDailyForecast ? DAILY_CACHE_TTL : CACHE_TTL
  
  // Günlük tahmin için: Eğer bugünün cache'i varsa ve TTL içindeyse kullan
  if (isDailyForecast) {
    const todayKey = getTodayKey()
    if (cached.dateKey === todayKey && now - cached.timestamp < ttl) {
      return cached.data
    }
    // Eğer farklı bir günse veya TTL dolmuşsa cache'i temizle
    cache.delete(key)
    return null
  }
  
  // Normal cache kontrolü
  if (now - cached.timestamp < ttl) {
    return cached.data
  }
  
  cache.delete(key)
  return null
}

// Cache'e kaydet - günlük cache ile
const setCachedData = (key, data, isDailyForecast = false) => {
  const todayKey = getTodayKey()
  cache.set(key, {
    data,
    timestamp: Date.now(),
    dateKey: todayKey // Hangi güne ait olduğunu kaydet
  })
}

export const getWeatherData = async (cityName) => {
  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE' || API_KEY.trim() === '') {
    throw new Error(
      'API anahtarı bulunamadı. Lütfen .env dosyasına VITE_WEATHER_API_KEY değişkenini ekleyin ve dev server\'ı yeniden başlatın.'
    )
  }

  // Cache kontrolü - günlük tahmin için özel kontrol
  const cacheKey = `weather_${cityName.toLowerCase()}`
  const todayKey = getTodayKey()
  
  // Önce normal cache'i kontrol et
  const cachedData = getCachedData(cacheKey, false)
  if (cachedData) {
    // Eğer cache'deki veri bugünün verisi değilse, günlük tahmin için yeniden istek yap
    const cachedDateKey = cache.get(cacheKey)?.dateKey
    if (cachedDateKey === todayKey) {
      return cachedData
    }
  }

  try {
    const response = await fetch(
      `${BASE_URL}?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric&lang=tr`
    )

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Şehir bulunamadı. Lütfen şehir adını kontrol edin.')
      } else if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `API anahtarı geçersiz veya aktif değil. Lütfen https://openweathermap.org/api adresinden yeni bir API anahtarı alın. Hata: ${errorData.message || 'Invalid API key'}`
        )
      } else if (response.status === 429) {
        // Rate limit hatası
        throw new Error('Çok fazla istek yapıldı. Lütfen birkaç dakika sonra tekrar deneyin. (Rate limit aşıldı)')
      } else {
        throw new Error('Hava durumu bilgisi alınamadı. Lütfen daha sonra tekrar deneyin.')
      }
    }

    const data = await response.json()
    
    // Forecast verilerini de al (yağmur ihtimali için)
    try {
      const forecastResponse = await fetch(
        `${FORECAST_URL}?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric&lang=tr&cnt=5`
      )
      if (forecastResponse.ok) {
        const forecastData = await forecastResponse.json()
        // Forecast verilerini ana veriye ekle
        data.forecast = forecastData.list
      } else if (forecastResponse.status === 429) {
        console.log('Forecast rate limit - atlanıyor')
      }
    } catch (forecastError) {
      // Forecast hatası kritik değil, sadece logla
      console.log('Forecast verisi alınamadı:', forecastError)
    }
    
    // 7 günlük tahmin verilerini al
    try {
      // Daily forecast API'si ücretli plan gerektirebilir, bu yüzden hourly forecast'ten günlük verileri çıkarıyoruz
      // Maksimum 40 veri alabiliriz (5 gün x 8 veri/gün), bugünün verisini de ekleyerek 7 günü tamamlıyoruz
      const dailyForecastResponse = await fetch(
        `${FORECAST_URL}?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric&lang=tr&cnt=40`
      )
      if (dailyForecastResponse.ok) {
        const dailyForecastData = await dailyForecastResponse.json()
        // Her gün için bir veri seç (günlük ortalama) - bugünün verisini de ekle
        const dailyData = getDailyForecast(dailyForecastData.list, data)
        data.dailyForecast = dailyData
      } else if (dailyForecastResponse.status === 429) {
        console.log('Daily forecast rate limit - atlanıyor')
      }
    } catch (dailyError) {
      console.log('7 günlük tahmin verisi alınamadı:', dailyError)
    }
    
    // Cache'e kaydet - bugünün tarihi ile
    setCachedData(cacheKey, data, true) // 7 günlük tahmin için günlük cache
    
    return data
  } catch (error) {
    if (error.message) {
      throw error
    }
    throw new Error('Bağlantı hatası. İnternet bağlantınızı kontrol edin.')
  }
}

// Yağmur ihtimalini hesapla
export const getPrecipitationProbability = (weather) => {
  // Eğer forecast verisi varsa, ilk birkaç saat için ortalama pop değerini al
  if (weather.forecast && weather.forecast.length > 0) {
    const popValues = weather.forecast
      .slice(0, 3) // İlk 3 saat
      .map(item => item.pop || 0)
      .filter(pop => pop > 0)
    
    if (popValues.length > 0) {
      const avgPop = popValues.reduce((sum, pop) => sum + pop, 0) / popValues.length
      return Math.round(avgPop * 100)
    }
  }
  
  // Forecast yoksa, mevcut duruma göre tahmin yap
  const main = weather.weather[0].main
  const clouds = weather.clouds?.all || 0
  const humidity = weather.main.humidity
  
  if (main === 'Rain' || main === 'Drizzle' || main === 'Thunderstorm') {
    return 90 // Zaten yağıyor
  }
  
  if (main === 'Snow') {
    return 85
  }
  
  // Bulutlu ve nemli ise yağmur ihtimali yüksek
  if (main === 'Clouds' && clouds > 70 && humidity > 70) {
    return Math.min(70, Math.round((clouds + humidity) / 2))
  }
  
  // Bulutlu ama nem düşük
  if (main === 'Clouds' && clouds > 50) {
    return Math.min(40, Math.round(clouds / 2))
  }
  
  // Açık hava
  return 0
}

// Şehir önerilerini al - Nominatim API kullanarak (daha kapsamlı ve ücretsiz)
export const getCitySuggestions = async (query) => {
  if (!query || query.trim().length < 2) {
    return []
  }

  try {
    // Nominatim API - Ücretsiz ve sınırsız, daha kapsamlı sonuçlar
    // Genel arama yap (featuretype kısıtlaması yok)
    const response = await fetch(
      `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=10&addressdetails=1&extratags=1`,
      {
        headers: {
          'User-Agent': 'HavaDurumuApp/1.0' // Nominatim için User-Agent gerekli
        }
      }
    )

    if (!response.ok) {
      // Nominatim başarısız olursa OpenWeatherMap'i dene
      return await getCitySuggestionsFallback(query)
    }

    const data = await response.json()
    
    // Nominatim sonuçlarını formatla - daha esnek filtreleme
    const suggestions = data
      .map(item => {
        const address = item.address || {}
        const type = item.type || ''
        const classType = item.class || ''
        
        // Şehir adını belirle - öncelik sırasına göre
        let name = item.name || ''
        if (!name || name.length === 0) {
          name = address.city || address.town || address.village || address.municipality || address.county || ''
        }
        
        // Eğer hala isim yoksa, display_name'den al
        if (!name || name.length === 0) {
          const displayName = item.display_name || ''
          const parts = displayName.split(',')
          if (parts.length > 0) {
            name = parts[0].trim()
          }
        }
        
        let country = address.country || ''
        // Ülke kodunu al (ISO 3166-1 alpha-2 formatı için)
        const countryCode = address.country_code?.toUpperCase() || ''
        const state = address.state || address.region || address.province || address.county || ''
        
        // Önem derecesi (importance) - daha önemli şehirler önce gelsin
        const importance = item.importance || 0
        
        // OpenWeatherMap için uygun format: "city,country_code" veya sadece "city"
        const searchQuery = countryCode 
          ? `${name}, ${countryCode}`
          : name
        
        return {
          name: name,
          country: country,
          countryCode: countryCode,
          state: state,
          type: type,
          classType: classType,
          importance: importance,
          fullName: state 
            ? `${name}, ${state}, ${country}`
            : `${name}, ${country}`,
          displayName: state 
            ? `${name}, ${state}`
            : name,
          searchQuery: searchQuery // OpenWeatherMap için optimize edilmiş format
        }
      })
      .filter(item => {
        // Geçerli şehir adı ve ülke olmalı
        if (!item.name || item.name.length === 0 || !item.country) {
          return false
        }
        
        // Yerleşim yeri olmalı (çok katı filtreleme yapmıyoruz)
        const type = item.type || ''
        const classType = item.classType || ''
        
        // Kabul edilebilir tipler
        const acceptableTypes = [
          'city', 'town', 'village', 'municipality', 
          'administrative', 'suburb', 'district', 'county'
        ]
        
        return (
          acceptableTypes.includes(type) || 
          classType === 'place' ||
          classType === 'boundary'
        )
      })
      .sort((a, b) => {
        // Önem derecesine göre sırala (yüksek önem önce)
        return (b.importance || 0) - (a.importance || 0)
      })
      .slice(0, 5) // Maksimum 5 sonuç
      .map(item => ({
        name: item.name,
        country: item.country,
        countryCode: item.countryCode,
        state: item.state,
        fullName: item.fullName,
        displayName: item.displayName,
        searchQuery: item.searchQuery // OpenWeatherMap için optimize edilmiş format
      }))

    // Eğer Nominatim'den sonuç gelmezse OpenWeatherMap'i dene
    if (suggestions.length === 0) {
      return await getCitySuggestionsFallback(query)
    }

    return suggestions
  } catch (error) {
    console.log('Nominatim API hatası, OpenWeatherMap deneniyor:', error)
    // Hata durumunda OpenWeatherMap'i dene
    return await getCitySuggestionsFallback(query)
  }
}

// OpenWeatherMap fallback (yedek)
const getCitySuggestionsFallback = async (query) => {
  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE' || API_KEY.trim() === '') {
    return []
  }

  try {
    const response = await fetch(
      `${GEOCODING_URL}?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.map(city => {
      // OpenWeatherMap için optimize edilmiş format
      const searchQuery = city.country 
        ? `${city.name}, ${city.country}`
        : city.name
      
      return {
        name: city.name,
        country: city.country,
        countryCode: city.country, // OpenWeatherMap zaten ülke kodu döndürüyor
        state: city.state,
        fullName: city.state 
          ? `${city.name}, ${city.state}, ${city.country}`
          : `${city.name}, ${city.country}`,
        displayName: city.state 
          ? `${city.name}, ${city.state}`
          : city.name,
        searchQuery: searchQuery // OpenWeatherMap için optimize edilmiş format
      }
    })
  } catch (error) {
    console.log('OpenWeatherMap fallback hatası:', error)
    return []
  }
}

// 7 günlük tahmin verilerini günlük olarak grupla
function getDailyForecast(forecastList, currentWeather = null) {
  if (!forecastList || forecastList.length === 0) return []
  
  const dailyMap = new Map()
  
  // Bugünün verisini de ekle (eğer varsa ve forecast'te yoksa)
  if (currentWeather) {
    const today = new Date(currentWeather.dt * 1000)
    const todayKey = today.toDateString()
    
    // Eğer bugün forecast listesinde yoksa ekle
    const todayInForecast = forecastList.some(item => {
      const itemDate = new Date(item.dt * 1000)
      return itemDate.toDateString() === todayKey
    })
    
    if (!todayInForecast) {
      dailyMap.set(todayKey, {
        date: today,
        temps: [currentWeather.main.temp],
        weather: currentWeather.weather[0],
        pop: 0,
        tempMin: currentWeather.main.temp_min,
        tempMax: currentWeather.main.temp_max
      })
    }
  }
  
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000)
    const dayKey = date.toDateString()
    
    if (!dailyMap.has(dayKey)) {
      dailyMap.set(dayKey, {
        date: date,
        temps: [],
        weather: item.weather[0],
        pop: item.pop || 0,
        tempMin: item.main.temp,
        tempMax: item.main.temp
      })
    }
    
    const dayData = dailyMap.get(dayKey)
    dayData.temps.push(item.main.temp)
    // Min/Max sıcaklıkları güncelle
    if (item.main.temp < dayData.tempMin) {
      dayData.tempMin = item.main.temp
    }
    if (item.main.temp > dayData.tempMax) {
      dayData.tempMax = item.main.temp
    }
    // En yüksek pop değerini al
    if (item.pop > dayData.pop) {
      dayData.pop = item.pop
      dayData.weather = item.weather[0]
    }
  })
  
  // Tarihe göre sırala
  const sortedDays = Array.from(dailyMap.values())
    .sort((a, b) => a.date - b.date)
  
  // Eğer 7 günden az varsa, son günlerin trend'ini kullanarak 7. günü ekle
  let dailyForecast = sortedDays
  if (sortedDays.length < 7 && sortedDays.length > 0) {
    const lastDay = sortedDays[sortedDays.length - 1]
    const lastDate = new Date(lastDay.date)
    lastDate.setDate(lastDate.getDate() + 1)
    
    // Son günün ortalama sıcaklığını hesapla
    const lastDayAvgTemp = lastDay.temps.reduce((a, b) => a + b, 0) / lastDay.temps.length
    
    // Eğer 2 veya daha fazla gün varsa, trend hesapla
    let tempTrend = 0
    let minTrend = 0
    let maxTrend = 0
    let popTrend = 0
    
    if (sortedDays.length >= 2) {
      const secondLastDay = sortedDays[sortedDays.length - 2]
      const secondLastAvgTemp = secondLastDay.temps.reduce((a, b) => a + b, 0) / secondLastDay.temps.length
      
      // Trend hesapla (son gün - önceki gün)
      tempTrend = lastDayAvgTemp - secondLastAvgTemp
      minTrend = lastDay.tempMin - secondLastDay.tempMin
      maxTrend = lastDay.tempMax - secondLastDay.tempMax
      popTrend = (lastDay.pop || 0) - (secondLastDay.pop || 0)
    }
    
    // 7. günü trend'e göre tahmin et
    const forecastAvgTemp = lastDayAvgTemp + (tempTrend * 0.7) // Trend'in %70'ini uygula
    const forecastMinTemp = lastDay.tempMin + (minTrend * 0.7)
    const forecastMaxTemp = lastDay.tempMax + (maxTrend * 0.7)
    const forecastPop = Math.max(0, Math.min(1, (lastDay.pop || 0) + (popTrend * 0.5)))
    
    // Hava durumu için son gününkini kullan (daha iyi bir tahmin yapamayız)
    dailyForecast = [
      ...sortedDays,
      {
        date: lastDate,
        temps: [forecastAvgTemp],
        temp: forecastAvgTemp,
        tempMin: forecastMinTemp,
        tempMax: forecastMaxTemp,
        weather: lastDay.weather,
        pop: forecastPop
      }
    ]
  }
  
  // İlk 7 günü al ve formatla
  return dailyForecast
    .slice(0, 7)
    .map(day => {
      // Ortalama sıcaklık hesapla
      const avgTemp = day.temp || (day.temps && day.temps.length > 0 
        ? day.temps.reduce((a, b) => a + b, 0) / day.temps.length 
        : 0)
      
      // Min/Max sıcaklık hesapla
      const minTemp = day.tempMin !== undefined 
        ? day.tempMin 
        : (day.temps && day.temps.length > 0 ? Math.min(...day.temps) : 0)
      const maxTemp = day.tempMax !== undefined 
        ? day.tempMax 
        : (day.temps && day.temps.length > 0 ? Math.max(...day.temps) : 0)
      
      // Pop değeri 0-1 arası, yüzdeye çevir
      const popPercent = day.pop !== undefined ? Math.round(day.pop * 100) : 0
      
      return {
        date: day.date,
        temp: Math.round(avgTemp),
        tempMin: Math.round(minTemp),
        tempMax: Math.round(maxTemp),
        weather: day.weather,
        pop: popPercent
      }
    })
}

