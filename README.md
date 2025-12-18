# 🌤️ Hava Durumu Uygulaması

Dünyanın her yerinden şehir ve ilçelerin hava durumu bilgilerini gösteren modern bir web uygulaması.

## ✨ Özellikler

- 🌍 Dünya genelinde şehir/ilçe arama
- 📊 Detaylı hava durumu bilgileri (sıcaklık, nem, rüzgar, basınç, vb.)
- 🌅 Gündoğumu ve günbatımı saatleri
- 📱 Responsive tasarım (mobil uyumlu)
- 🎨 Modern ve kullanıcı dostu arayüz
- ⚡ Hızlı ve performanslı

## 🚀 Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. API Anahtarı Alın

1. [OpenWeatherMap](https://openweathermap.org/api) sitesine gidin
2. Ücretsiz hesap oluşturun
3. API Keys bölümünden API anahtarınızı alın

### 3. Ortam Değişkenlerini Ayarlayın

`.env.example` dosyasını `.env` olarak kopyalayın:

```bash
cp .env.example .env
```

`.env` dosyasını açın ve API anahtarınızı ekleyin:

```
VITE_WEATHER_API_KEY=your_actual_api_key_here
```

### 4. Uygulamayı Çalıştırın

```bash
npm run dev
```

Tarayıcınızda `http://localhost:5173` adresine gidin.

## 📦 Build

Production build için:

```bash
npm run build
```

Build dosyaları `dist` klasöründe oluşturulacaktır.

## 🛠️ Teknolojiler

- **React 18** - UI framework
- **Vite** - Build tool ve dev server
- **OpenWeatherMap API** - Hava durumu verileri

## 📝 Kullanım

1. Uygulamayı açın
2. Arama kutusuna şehir veya ilçe adı girin (örn: Istanbul, London, New York)
3. Enter tuşuna basın veya arama butonuna tıklayın
4. Hava durumu bilgilerini görüntüleyin

## 🌍 Desteklenen Formatlar

- Şehir adı: `Istanbul`
- Şehir, Ülke: `Istanbul, TR`
- İlçe adı: `Kadıköy`
- İngilizce şehir adları: `London`, `New York`, `Tokyo`

## 📄 Lisans

Bu proje açık kaynaklıdır ve özgürce kullanılabilir.

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen pull request göndermekten çekinmeyin.

