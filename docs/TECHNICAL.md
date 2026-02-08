# AT Thru-Hike Planner - Technical Documentation

## Architecture Overview

This is a client-side React application with all trail data bundled into the frontend. There is no required backend for core functionality — the weather feature calls the free Open-Meteo API directly from the browser.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Animations | Framer Motion |
| Icons | Lucide React |
| Fonts | DM Sans (sans), Instrument Serif (serif) |
| Weather API | Open-Meteo (free, no key required) |
| Runtime | Bun (preferred) or Node.js 20.19+/22.12+ |

### Data Architecture

All trail data is compiled into TypeScript files and bundled with the frontend. No database is needed for the core app.

| Data File | Records | Size | Content |
|-----------|---------|------|---------|
| `shelters.ts` | 252 | 114 KB | Shelters with GPS, amenities, capacity, water |
| `resupply.ts` | 112 | 118 KB | Resupply locations with quality tier and services |
| `contacts.ts` | 891 | 465 KB | Businesses with phone, address, hours, notes |
| `elevation.ts` | ~22,000 | 1.4 MB | Elevation profile at 0.1-mile resolution |
| `features.ts` | ~50 | 11 KB | Notable landmarks |
| `index.ts` | - | 6 KB | Utility functions and exports |

Total bundled data: approximately 2.1 MB uncompressed, significantly smaller with Vite's production build and gzip.

### Component Architecture

```
App.tsx (tab routing, global state)
├── HikePlanner (planner tab)
│   ├── PlannerControls (inputs: mile, date, direction, mileage)
│   ├── PlannerStats (summary numbers)
│   ├── MiniMap (elevation profile visualization)
│   └── DayCard[] (daily itinerary)
│       └── ItineraryItem[] (shelters, resupply, features)
├── ResupplyPlanner (resupply tab)
│   ├── ResupplyExpandedCard[] (location cards)
│   ├── ResupplyDirectory (business browser)
│   │   ├── CategoryFilterTabs
│   │   └── BusinessListCard[]
│   │       └── BusinessDetailModal
│   └── ContactCard (contact info display)
├── WeatherForecast (weather tab)
│   ├── WeatherLocationPicker (unified search + GPS)
│   ├── HourlyForecastCard (24-hour scroll)
│   └── DailyForecastList (7-day forecast)
└── TrailProgress (footer stats)
```

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useHikePlanner` | Plan generation: takes mile, direction, days, mileage and produces day-by-day itinerary |
| `useWeather` | Weather state management: fetches from Open-Meteo, applies elevation adjustment |
| `useGeolocation` | GPS positioning with Haversine distance to nearest trail point |
| `useTheme` | Light/dark toggle with localStorage persistence |
| `useWaypointFilters` | Waypoint filtering by type, state, mile range |
| `useIsMobile` | Responsive breakpoint detection (768px) |

### Design System

The app uses CSS custom properties defined in `index.css` for all colors, with complete light and dark mode support.

**Key color tokens:**
- `--primary` - Forest green (interactive elements)
- `--accent` - Meadow green (highlights)
- `--background` - Cream (light) / Dark forest (dark)
- `--foreground` - Dark text / Light text
- `--warning` - Sunset orange (alerts, wind gusts)
- `--info` - Sky blue (informational)

**Waypoint colors:** Shelters (forest green), Resupply (trail orange), Towns (sky blue), Water (aqua), Features (gray)

---

## Project Structure

```
/
├── webapp/                    # Frontend application
│   ├── src/
│   │   ├── components/        # React components (26 total)
│   │   │   ├── planner/       # Planner sub-components
│   │   │   ├── resupply/      # Resupply directory components
│   │   │   ├── weather/       # Weather forecast components
│   │   │   └── ui/            # UI primitives (ThemeToggle, Skeleton)
│   │   ├── hooks/             # 6 custom React hooks
│   │   ├── data/              # All trail data (bundled)
│   │   ├── types/             # TypeScript type definitions
│   │   ├── lib/               # Utilities (weather API, formatting)
│   │   ├── index.css          # Design system
│   │   └── App.tsx            # Root component
│   ├── index.html             # HTML entry point
│   ├── vite.config.ts         # Vite configuration
│   ├── tailwind.config.ts     # Tailwind configuration
│   ├── tsconfig.json          # TypeScript configuration
│   └── package.json           # Frontend dependencies
├── backend/                   # Backend server (Vibecode scaffold)
│   ├── src/
│   │   ├── index.ts           # Hono server with CORS
│   │   ├── env.ts             # Environment config
│   │   └── routes/            # API routes (sample only)
│   ├── scripts/               # Startup scripts
│   └── package.json           # Backend dependencies
├── docs/                      # Documentation
│   ├── USER_GUIDE.md          # Complete user guide
│   ├── QUICK_START.md         # Quick start guide
│   ├── WEATHER_HELP.md        # Weather feature guide
│   ├── WEATHER_QUICK_START.md # Weather quick start
│   ├── TECHNICAL.md           # This file
│   └── archive/               # Historical audit docs
└── README.md                  # Project overview
```

---

## Building and Running

### Local Development

```bash
cd webapp
bun install          # Install dependencies
bun dev              # Start dev server at http://localhost:8000
```

### Production Build

```bash
cd webapp
bun run build        # TypeScript check + Vite build
```

Output goes to `webapp/dist/` — this is a fully static site ready for any hosting.

### Preview Production Build

```bash
cd webapp
bun run preview      # Serve the built files locally
```

---

## Deployment Options

### Vibecode (Current Platform)

Click **Deploy** on vibecode.dev. Handles build, SSL, and domain routing automatically.

### Free Static Hosting

Since the app is a fully static Vite build with no backend dependency (weather calls Open-Meteo directly from the browser), it can be deployed to any static hosting service for free:

#### Vercel

```bash
# Install Vercel CLI
bun add -g vercel

# From the webapp directory
cd webapp
bun run build
vercel deploy --prod
```

Or connect your Git repo at vercel.com for automatic deploys on push. Free tier includes custom domains, SSL, and CDN.

#### Netlify

```bash
# Install Netlify CLI
bun add -g netlify-cli

# From the webapp directory
cd webapp
bun run build
netlify deploy --prod --dir=dist
```

Or drag-and-drop the `dist/` folder at app.netlify.com. Free tier includes custom domains and SSL.

For automatic deploys, connect your Git repo and set:
- **Build command:** `cd webapp && bun run build`
- **Publish directory:** `webapp/dist`

#### GitHub Pages

1. Build the app: `cd webapp && bun run build`
2. Set `base` in `vite.config.ts` if deploying to a subpath (e.g., `base: '/at-planner/'`)
3. Push the `dist/` contents to a `gh-pages` branch
4. Enable Pages in your repo settings

Or use the `gh-pages` npm package:
```bash
bun add -D gh-pages
bunx gh-pages -d dist
```

#### Cloudflare Pages

1. Connect your Git repo at pages.cloudflare.com
2. Set build configuration:
   - **Build command:** `cd webapp && bun run build`
   - **Build output directory:** `webapp/dist`
3. Deploy. Free tier includes unlimited bandwidth and custom domains.

### Self-Hosting

Since the output is static HTML/CSS/JS, any web server works:

```bash
cd webapp && bun run build

# Nginx, Apache, Caddy, etc. — just serve the dist/ directory
# Example with a simple static server:
bunx serve dist
```

### Environment Notes

- **No API keys needed.** The weather feature uses Open-Meteo's free API which requires no authentication.
- **No backend needed.** All trail data is bundled into the frontend build. The backend scaffold exists for Vibecode compatibility but is not used by the app.
- **No database needed.** User preferences (theme, etc.) are stored in localStorage.

---

## External API

### Open-Meteo Weather API

- **Base URL:** `https://api.open-meteo.com/v1/forecast`
- **Auth:** None (free, open API)
- **Rate limits:** Generous for personal use (10,000 requests/day)
- **Data:** Hourly (48h) + daily (7-day) forecasts
- **Parameters requested:** temperature, apparent_temperature, precipitation, wind, humidity, UV, visibility, cloud_cover, weather_code, sunrise/sunset
- **Units:** Fahrenheit, mph, inches
- **Timezone:** America/New_York (hardcoded for AT corridor)

The elevation adjustment is calculated client-side using the standard environmental lapse rate (3.5°F per 1,000 ft difference between trail elevation and weather station elevation).

---

## Data Sources and Verification

| Source | What It Provides | Last Updated |
|--------|-----------------|--------------|
| AWOL AT Guide 2025 | Shelter amenities, mile markers | 2025 edition |
| ATC Official Data (guymott.com) | GPS coordinates for all shelters | Ongoing |
| Appalachian Trail Conservancy | Official trail data | Ongoing |
| The Trek | Resupply guides, hiker feedback | 2025 |
| FarOut/Guthook | Community-sourced data | 2025 |
| FKT GPX data | High-resolution elevation profile | 2025 |
| tnlandforms.us | Secondary shelter verification | 2025 |
| Business directory | 891 businesses across 112 locations | Jan 2025 (ongoing) |

---

## Key Design Decisions

1. **Client-side only.** All data is bundled to work offline-capable and avoid backend dependencies. A thru-hiker with spotty service should be able to load the app once and use it.

2. **Elevation-adjusted weather.** Valley weather stations give misleadingly warm temperatures for ridge hikers. The lapse rate adjustment is the single most useful thing the weather feature does.

3. **Unified search bar.** The weather location picker uses a single input that accepts both mile numbers and shelter names, reducing cognitive load. GPS is a separate button because it's a distinct action.

4. **Data bundled, not fetched.** 252 shelters, 112 resupply points, and 891 businesses are compiled into the JavaScript bundle. This makes the initial load larger (~2MB) but means the app works without any API calls except weather.

5. **Mobile-first.** Designed for phones first since that's what hikers carry. Desktop layout is a nice-to-have.
