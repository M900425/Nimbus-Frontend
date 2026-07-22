# Nimbus Weather — Frontend

A modern, responsive weather application with real-time data, water temperature tracking, and multi-language support.

**🌐 Live Demo:** [nimbus-frontend-khaki.vercel.app](https://nimbus-frontend-khaki.vercel.app)

**Backend API:** [nimbus-backend-zg3x.onrender.com](https://nimbus-backend-zg3x.onrender.com/docs/)

---

## ✨ Features

### Weather Dashboard

- Real-time weather data (temperature, feels like, humidity, wind, UV index, pressure, cloud cover)
- 24‑hour hourly forecast with horizontal scroll
- 7‑day forecast with day navigation
- Arrow buttons and touch/swipe support for day switching

### Water Temperature 🌊

- **Sea** — real-time data from Marine API
- **Lake & River** — calculated using smart formula based on:
  - Air temperature (max/min average)
  - Humidity
  - Wind speed
  - Solar radiation
  - Latitude
- Informative tooltips explaining data source for each water type

### Multi‑Language Support 🌍

- 25 languages (all European languages + Turkish, without Russian)
- Flag‑based language switcher in header
- Persistent language selection (localStorage)
- Translated weather conditions (Clear, Partly cloudy, Rain, etc.)
- Date formatting follows selected language

### Geocoding Tool 🗺️

- Find coordinates by city name
- Find city name by coordinates (reverse geocoding)
- Powered by OpenStreetMap Nominatim (free, no API key)
- Quick "View Weather" action

### User Experience

- Sticky header with integrated search bar
- Search by city name or coordinates (lat,lon)
- Fully responsive (mobile/desktop)
- Loading states with centered spinner
- URL reflects current city/page

---

## 🛠️ Tech Stack

| Technology                | Purpose                |
| ------------------------- | ---------------------- |
| React 18                  | UI framework           |
| TypeScript                | Type safety            |
| Redux Toolkit + RTK Query | State & API caching    |
| Ant Design                | UI components          |
| SCSS                      | Styling                |
| React Router v6           | Routing                |
| i18next + react-i18next   | Internationalization   |
| Lingo.dev CLI             | Automatic translations |
| Vite                      | Build tool             |
| react-flagkit             | Flag icons             |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── header/
│   │   ├── Header.tsx
│   │   └── Header.scss
│   ├── LanguageSwitcher/
│   ├── Loader/
│   └── WaterTempHelp/
├── pages/
│   ├── HomePage/
│   ├── WeatherPage/
│   └── GeocodePage/
├── store/
│   ├── api/
│   │   └── weatherApi.ts
│   └── store.ts
├── context/
│   └── LocaleContext.tsx
├── utils/
│   ├── string.ts
│   └── weatherConditions.ts
├── types/
├── i18n.ts
└── App.tsx
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nimbus-frontend.git
cd nimbus-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

> **Note:** The frontend expects the backend to be running at `https://nimbus-backend-zg3x.onrender.com`. Update `BASE_URL` in `src/store/api/weatherApi.ts` if needed.

---

## 🌍 Translation Workflow

```bash
# Add/update keys in public/locales/en/translation.json
# Then run:
lingo push
```

Translations are automatically generated for all 25 languages.

### Supported Languages

`en, uk, pl, de, fr, es, it, pt, nl, sv, no, da, fi, et, lv, lt, cs, sk, hu, ro, bg, el, tr, hr, sl, sr`

---

## 🔗 API Endpoints

| Endpoint                 | Description            |
| ------------------------ | ---------------------- |
| `GET /weather/{city}`    | Weather by city name   |
| `GET /weather?lat=&lon=` | Weather by coordinates |

---

## 📱 Screens

### Weather Page

- City name with map pin
- Current temperature + condition
- Water temperature tags with tooltips
- 24‑hour hourly forecast
- Day details with stats
- 7‑day list with min/max temps

### Geocoding Page

- Tabbed: City Name or Coordinates
- Results table
- "View Weather" action

### Home Page

- Welcome message
- Feature cards

---

## 🧪 Development Commands

```bash
npm run dev         # Development
npm run build       # Production build
npm run preview     # Preview production
npm run lint        # Lint
npm run type-check  # Type check
```

---

## 📄 License

MIT

---

## 🙏 Acknowledgments

- [Open-Meteo](https://open-meteo.com/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Ant Design](https://ant.design/)
- [Lingo.dev](https://lingo.dev/)

---
