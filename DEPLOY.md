# 🚀 Deployment Rehberi

Bu uygulamayı herhangi bir hosting sağlayıcısında yayınlayabilirsiniz. İşte adım adım rehber:

## 📋 Ön Hazırlık

### 1. Production Build Oluşturma

```bash
npm run build
```

Bu komut `dist` klasöründe production-ready dosyalar oluşturur.

### 2. API Key'i Production'da Ayarlama

**ÖNEMLİ:** `.env` dosyası build sırasında Vite tarafından işlenir ve API key client-side'da görünecek. Bu normal ve güvenlidir çünkü OpenWeatherMap API key'leri client-side kullanım için tasarlanmıştır.

## 🌐 Hosting Seçenekleri

### 1. Vercel (Önerilen - En Kolay) ⭐

1. [Vercel](https://vercel.com) hesabı oluşturun
2. GitHub'a projeyi push edin
3. Vercel'de "New Project" seçin
4. GitHub repo'nuzu seçin
5. **Environment Variables** bölümüne ekleyin:
   - Key: `VITE_WEATHER_API_KEY`
   - Value: API anahtarınız
6. "Deploy" butonuna tıklayın
7. ✅ Hazır! Otomatik olarak deploy edilir

**Avantajlar:**
- Ücretsiz
- Otomatik HTTPS
- Otomatik deploy (Git push ile)
- Hızlı CDN

### 2. Netlify

1. [Netlify](https://netlify.com) hesabı oluşturun
2. "Add new site" > "Import an existing project"
3. GitHub repo'nuzu bağlayın
4. Build ayarları:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **Environment variables** ekleyin:
   - `VITE_WEATHER_API_KEY` = API anahtarınız
6. "Deploy site" butonuna tıklayın

**Avantajlar:**
- Ücretsiz
- Otomatik HTTPS
- Form handling desteği

### 3. GitHub Pages

1. `package.json`'a ekleyin:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  },
  "devDependencies": {
    "gh-pages": "^6.0.0"
  }
}
```

2. GitHub'da repo ayarlarından Pages'i aktif edin
3. `npm run deploy` komutunu çalıştırın

**Not:** API key için GitHub Secrets kullanın veya build script'inde environment variable ekleyin.

### 4. Firebase Hosting

1. Firebase CLI yükleyin: `npm install -g firebase-tools`
2. Firebase'e login: `firebase login`
3. Firebase projesi oluşturun: `firebase init hosting`
4. Build klasörünü `dist` olarak ayarlayın
5. Deploy: `firebase deploy`

### 5. Heroku

1. Heroku CLI yükleyin
2. `heroku create your-app-name`
3. Buildpack ekleyin: `heroku buildpacks:set heroku/nodejs`
4. Environment variable ekleyin: `heroku config:set VITE_WEATHER_API_KEY=your_key`
5. Deploy: `git push heroku main`

### 6. AWS S3 + CloudFront

1. S3 bucket oluşturun
2. `dist` klasörünü S3'e yükleyin
3. CloudFront distribution oluşturun
4. Environment variable'ları build sırasında ayarlayın

## 🔑 API Key Yönetimi

### Vercel/Netlify gibi Platformlarda:

1. Dashboard'a gidin
2. Project Settings > Environment Variables
3. `VITE_WEATHER_API_KEY` ekleyin
4. Deploy'u yeniden başlatın

### Manuel Build'de:

`.env.production` dosyası oluşturun:
```
VITE_WEATHER_API_KEY=your_api_key_here
```

Sonra build yapın:
```bash
npm run build
```

## ⚠️ Önemli Notlar

1. **API Key Güvenliği:**
   - API key client-side'da görünecek (bu normal)
   - OpenWeatherMap API key'leri client-side kullanım için tasarlanmıştır
   - Rate limiting için API key'inizi koruyun

2. **CORS:**
   - OpenWeatherMap API CORS destekliyor, sorun olmaz

3. **Build Optimizasyonu:**
   - Vite otomatik olarak kodları optimize eder
   - Production build'de minify ve tree-shaking aktif

4. **Environment Variables:**
   - Sadece `VITE_` ile başlayan değişkenler client-side'da kullanılabilir
   - Bu güvenlik özelliğidir

## 🧪 Production'da Test

Deploy'dan sonra:
1. Uygulamanızı açın
2. Bir şehir arayın (örn: Istanbul)
3. Tüm özelliklerin çalıştığını kontrol edin

## 📊 Performans İpuçları

- Vercel/Netlify gibi CDN kullanan platformlar daha hızlıdır
- Build dosyaları genellikle 1-2 MB arasındadır
- İlk yükleme hızlıdır (Vite optimize eder)

## 🆘 Sorun Giderme

**API key çalışmıyor:**
- Environment variable'ın doğru adı kontrol edin: `VITE_WEATHER_API_KEY`
- Deploy'u yeniden başlatın
- API key'in aktif olduğundan emin olun (10-15 dakika beklemiş olmalı)

**Build hatası:**
- `npm install` çalıştırın
- Node.js versiyonunu kontrol edin (v16+ gerekli)

**CORS hatası:**
- OpenWeatherMap API CORS destekliyor, sorun olmamalı
- Eğer sorun varsa, API key'inizi kontrol edin

## 📝 Özet

En kolay yol: **Vercel**
1. GitHub'a push edin
2. Vercel'e bağlayın
3. Environment variable ekleyin
4. Deploy edin
5. ✅ Hazır!

Başarılar! 🎉

