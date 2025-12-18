# 🔑 API Anahtarı Alma Talimatları

## Sorun
Mevcut API anahtarınız geçersiz veya aktif değil. Yeni bir API anahtarı almanız gerekiyor.

## Adım Adım Çözüm

### 1. OpenWeatherMap'e Kaydolun
1. [OpenWeatherMap](https://openweathermap.org/api) sitesine gidin
2. Sağ üst köşedeki **"Sign Up"** veya **"Sign In"** butonuna tıklayın
3. Yeni hesap oluşturun (ücretsiz)

### 2. API Anahtarı Alın
1. Giriş yaptıktan sonra, üst menüden **"API keys"** sekmesine gidin
2. Veya doğrudan şu adrese gidin: https://home.openweathermap.org/api_keys
3. **"Create Key"** butonuna tıklayın
4. Key name için bir isim girin (örn: "Hava Durumu App")
5. **"Generate"** butonuna tıklayın
6. **ÖNEMLİ**: Yeni oluşturulan API anahtarı aktif olması için **10-15 dakika** bekleyin!

### 3. API Anahtarını Uygulamaya Ekleyin

1. Proje klasörünüzde `.env` dosyasını açın
2. İçeriğini şu şekilde güncelleyin:
   ```
   VITE_WEATHER_API_KEY=yeni_api_anahtariniz_buraya
   ```
3. Dev server'ı durdurun (Ctrl+C)
4. Dev server'ı yeniden başlatın:
   ```bash
   npm run dev
   ```

### 4. Test Edin
Tarayıcıda uygulamayı açın ve bir şehir arayın (örn: Istanbul)

## ⚠️ Önemli Notlar

- API anahtarı oluşturulduktan sonra **10-15 dakika** aktif olması için bekleyin
- API anahtarınızı kimseyle paylaşmayın
- Ücretsiz plan günde **60 çağrı/dakika** limitine sahiptir
- API anahtarınızı `.env` dosyasında saklayın (bu dosya `.gitignore`'da olduğu için Git'e yüklenmez)

## Sorun Devam Ederse

1. API anahtarının doğru kopyalandığından emin olun (boşluk olmamalı)
2. `.env` dosyasının proje kök dizininde olduğundan emin olun
3. Dev server'ı mutlaka yeniden başlatın
4. Tarayıcı konsolunu kontrol edin (F12 > Console)

