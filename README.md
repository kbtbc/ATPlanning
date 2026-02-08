# AT Thru-Hike Planner

A modern web app for planning Appalachian Trail thru-hikes and resupply stops. Features geolocation, flexible mileage planning (8-25 miles/day), and comprehensive waypoint data.

> **Vibecode Project**: This app is built and deployed on [Vibecode](https://vibecode.dev). See the [Vibecode Configuration](#vibecode-configuration) section for important setup details.

## Features

### Location Tracking
- GPS geolocation to find your position on the trail
- Manual mile marker entry (when GPS unavailable)
- Shows nearest mile marker and distance from trail
- Progress visualization (% complete)

### Hike Planner
- Flexible daily mileage (8-25 miles/day) via slider
- Adjustable start date for planning
- Adjustable starting mile (syncs with Resupply tab)
- Support for NOBO and SOBO hiking directions
- 1-14 day planning horizon
- Daily itinerary with shelters, resupply, and features sorted by mileage (in order of encounter)
- Tap resupply items in daily itinerary to view full details in Resupply tab
- "Set as start" button on each day and each location to quickly re-plan from any point
- Interactive elevation profile with high-resolution GPX data (~22,000 points at 0.1mi intervals)
- Mini-map showing:
  - Shelters (home icon)
  - Resupply points (orange package icon)
  - Info markers (yellow info icon)
  - Your position with pulsing indicator
  - Day boundary markers showing where each day ends
- Includes Amicalola Falls approach trail (mile -8.5 to 0)

### Trail Stats (accessible via Stats tab)
- Total miles breakdown
- Shelter and resupply counts
- Miles by state visualization
- NOBO/SOBO direction reference

### Resupply Planner
- 112 resupply points from Georgia to Maine
- Location categories with color-coded badges:
  - **Major Town**: Full services, grocery stores, outfitters (e.g., Franklin, Hot Springs)
  - **Trail Town**: Good resupply, limited selection (e.g., Damascus, Waynesboro)
  - **On Trail**: Convenience stores, camp stores near trail (e.g., Mountain Crossings, NOC)
  - **Limited**: Minimal options, plan ahead (e.g., small general stores)
- Info icon with hover legend explaining categories
- Dynamic distance display showing miles ahead and off-trail direction
- Syncs with Planner starting mile for accurate distance calculations
- Card-based layout with individual rounded entries
- Service count summary per location (Lodging, Food, Shuttles, Services)
- Category filtering with counts
- Strategic planning tips and mail drop advice
- Tap resupply items in daily itinerary to view full details

### Contact Directory (COMPREHENSIVE!)
- **891 businesses documented** across 112 resupply locations (count subject to change as data is updated)
- Searchable directory with category filters (Lodging, Food, Shuttles, Services)
- Sub-type labels for precise classification:
  - Lodging: HOSTEL, HOTEL, CAMPING, CAMPGROUND
  - Food: RESTAURANT, GROCERY, STORE
  - Services: POST OFFICE, OUTFITTER, LAUNDRY, PHARMACY, etc.
- Direct tap-to-call phone numbers
- Tap-to-open Google Maps links with precise coordinates
- Rich summary lines with key info (pricing, hours, amenities)
- Full detail modal with services, notes, and action buttons
- **Complete coverage** for all 14 states from Georgia to Maine
- **Last Verified:** January 2025 (ongoing verification)

### Waypoint Data
- **252 shelters** with enhanced descriptions, capacity, water, and privy info
- All major towns and resupply points
- Notable features and landmarks

### Trail Weather Forecast
- **Elevation-adjusted temperatures** using the standard environmental lapse rate (3.5°F per 1,000 ft)
- Compares trail elevation vs weather station elevation and auto-corrects temps
- **Unified search bar**: Type a mile number and press Enter, or type a shelter/town name and pick from the dropdown
- **GPS button**: One tap to get weather for your current position
- Current conditions with feels-like temperature, wind, humidity, UV index, visibility
- Scrollable hourly forecast for the next 24 hours
- 7-day daily forecast with high/low temps, precipitation probability, wind, UV
- Temperature color coding (blue=cold, green=comfortable, orange=hot)
- Wind gust warnings when gusts exceed sustained speed by 5+ mph
- Powered by Open-Meteo API (free, no API key required)
- Methodology note shows exact elevation difference and temperature adjustment applied

**Shelter Enhancements (Updated 2026-02-05):**
- All 252 shelters with verified amenity keys from WBP PDF icon codes
- 18 amenity keys verified against Icon Legend and PDF description text:
  - Core: hasWater, hasPrivy, isTenting
  - Extended: isHammockFriendly, hasBearCables, hasBearBoxes, hasJunction, hasSeasonalWater, hasViews, hasSummit, hasWarning, hasShowers, hasRestroom, hasFee, hasTrashCan, hasSwimming, hasPicnicTable, hasWaterfall
- Existing keys take precedence rule when PDF data conflicts
- State boundary markers at first/last shelter in each state
- Permit requirements (Great Smoky Mountains, Shenandoah NP)

## Data

> **Note:** Record counts are subject to change as data is continuously updated and verified.

- **Trail Length**: 2,197.9 miles (official 2026 measurement, plus 8.5 mile approach trail)
- **Elevation Data**: ~22,000 points from FKT GPX (0.1mi resolution)
- **Shelters**: 252 shelters from GA to ME with accurate GPS coordinates (from ATC official data), icon-coded amenities, mile markers, capacity, and elevation
- **Resupply Points**: 112 locations covering entire trail
- **Business Contacts**: 891 businesses with complete contact information
- **Features**: 50 notable landmarks
- **States**: 14 states (GA, NC, TN, VA, WV, MD, PA, NJ, NY, CT, MA, VT, NH, ME)

### Direction Conventions

**IMPORTANT - Appalachian Trail Convention:**
When referring to off-trail locations (shelters, resupply, water sources):
- **NOBO (Northbound)**: **EAST is ALWAYS RIGHT**, **WEST is ALWAYS LEFT** when exiting the trail
- **SOBO (Southbound)**: **WEST is ALWAYS RIGHT**, **EAST is ALWAYS LEFT** when exiting the trail

This is the standard AT hiker's perspective convention - it holds true regardless of the actual compass direction the trail is facing at any given point.

## Tech Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS v4 (with @tailwindcss/vite)
- Framer Motion
- Lucide Icons

## Project Structure

```
webapp/src/
├── components/
│   ├── planner/          # HikePlanner sub-components
│   │   ├── PlannerControls.tsx
│   │   ├── PlannerStats.tsx
│   │   ├── DayCard.tsx
│   │   └── ItineraryItem.tsx
│   ├── resupply/         # Resupply directory components
│   │   ├── BusinessListCard.tsx      # Individual business card
│   │   ├── BusinessDetailModal.tsx   # Full detail popup
│   │   ├── CategoryFilterTabs.tsx    # Filter by category
│   │   ├── ViewToggle.tsx            # List/grid toggle
│   │   ├── ResupplyExpandedCard.tsx  # Expanded resupply view
│   │   ├── ResupplyDirectory.tsx     # Full directory browser
│   │   ├── ContactCard.tsx           # Contact info card
│   │   └── businessCategories.ts     # Category utilities
│   ├── weather/          # Weather forecast components
│   │   ├── WeatherForecast.tsx       # Main forecast container
│   │   ├── WeatherLocationPicker.tsx # Unified search bar + GPS
│   │   └── ForecastDisplay.tsx       # Hourly and daily rendering
│   ├── ui/               # UI primitives (ThemeToggle, Skeleton)
│   ├── HikePlanner.tsx   # Main planner component
│   ├── MiniMap.tsx       # Elevation profile visualization
│   ├── LocationPanel.tsx # GPS/manual location
│   ├── ResupplyPlanner.tsx
│   ├── WaypointList.tsx
│   └── TrailProgress.tsx
├── hooks/                # Custom React hooks
├── data/                 # Trail data (shelters, resupply, elevation, contacts)
├── types/                # TypeScript definitions
├── lib/                  # Utilities (including weather API client)
├── index.css            # Design system (CSS variables + Tailwind)
└── App.tsx              # Root component
```

## Running Locally

### Prerequisites
- Node.js 22.12+ (or Node.js 20.19+)
- bun, npm, or yarn

### Setup

```bash
cd webapp
bun install    # or: npm install
bun dev        # or: npm run dev
```

App runs at http://localhost:8000

### Build for Production
```bash
cd webapp
bun run build   # or: npm run build
bun run preview # or: npm run preview
```

## Data Sources

Trail data compiled from:
- **AWOL AT Guide** (2025 edition) - Primary shelter amenity data with icon-coded amenities
- **ATC Official Data** (via guymott.com) - Authoritative GPS coordinates for all shelters
- Appalachian Trail Conservancy
- The Trek resupply guides
- tnlandforms.us shelter data (secondary verification)
- FarOut/Guthook community data
- FKT (Fastest Known Time) GPX data with elevation

**Data Quality:** 
- **Shelters (252 total):** All have accurate GPS coordinates from official ATC data (guymott.com)
- Mile markers verified against AWOL AT Guide 2025 edition
- 228 shelters cross-validated with ATC coordinates
- 24 shelters use original GPS (naming variations not in ATC dataset)
- **Enhancement Status:**
  - **Shelters (252 total):** All enhanced with web-verified details (completed 2025-01-15)
    - Icon keys updated for accuracy (w=water, p=privy, B=bear box, J=cables, Q=unique/notable, Z=warning)
    - State transitions marked, permit requirements documented
    - 13 major landmarks with deep research from official sources
  - **Resupply (112 locations):** Enhanced with trail context and hiker information
    - Phase 5 (New England - 22 locations): Enhanced January 2025
    - Major locations researched with thru-hiker feedback from The Trek, SectionHiker, ATC
    - All locations updated with contextual trail information
    - Ongoing verification and improvement

Always verify with current guidebooks and local conditions before hiking.

## Disclaimer

This app is for informational purposes only. Not affiliated with the Appalachian Trail Conservancy. Trail conditions change frequently - always check current conditions before your hike.

---

## Documentation

### User Guides
- `docs/QUICK_START.md` - One-page quick start for new users
- `docs/USER_GUIDE.md` - Comprehensive guide to all features
- `docs/WEATHER_QUICK_START.md` - Weather tab quick start
- `docs/WEATHER_HELP.md` - Detailed weather feature guide

### Technical Documentation
- `docs/TECHNICAL.md` - Architecture, deployment options, and developer reference
- `docs/AI_WORK_PROTOCOL.md` - Transparency and honesty requirements for AI work
- `docs/AI_RESUME_COMMAND.md` - Context restoration guide for AI sessions
- `docs/SHELTER_VERIFICATION_SOURCES.md` - Data source documentation
- `docs/RESUPPLY_ENHANCEMENT_AUDIT.md` - Resupply enhancement progress tracking

### Archived Documentation

Historical audit and progress files have been moved to `docs/archive/`:
- **Business audit** (`archive/`) - Contact directory enrichment progress and changelog
- **Shelter enhancement** (`archive/shelter_enhancement/`) - Completed 2025-01-15
- **Data extraction** (`archive/data_extraction/`) - PDF extraction and integration reports
- Data enrichment records and deployment summaries

---

## Vibecode Configuration

This project is configured for the Vibecode platform. When modifying locally, preserve these settings:

### Critical Files (DO NOT REMOVE)

| File | Purpose |
|------|---------|
| `backend/src/index.ts` line 1 | `import "@vibecodeapp/proxy"` - Required for Vibecode proxy |
| `.claude/rules/api-patterns.md` | API contract patterns for backend/frontend communication |
| `backend/CLAUDE.md` | Backend development instructions |
| `backend/scripts/start` | Vibecode-compatible startup script |
| `backend/scripts/env.sh` | Environment configuration |

### Environment Variables

The following environment variables are managed by Vibecode:

- `VITE_BACKEND_URL` - Backend API URL (auto-configured)
- `BACKEND_URL` - Backend URL for server-side use
- `PORT` - Backend server port (default: 3000)
- `ENVIRONMENT` - `development` or `production`
- `VIBECODE_PROJECT_ID` - Project identifier (auto-set)

### CORS Configuration

The backend CORS is configured to allow:
- `http://localhost:*` and `http://127.0.0.1:*` (local development)
- `https://*.dev.vibecode.run` (Vibecode preview)
- `https://*.vibecode.run` (Vibecode production)

Do not modify the CORS configuration in `backend/src/index.ts` unless you understand the implications.

### Deployment

**Vibecode (Current)**
To deploy, click the **Deploy** button on vibecode.dev. The platform handles:
- Building the frontend (`bun run build`)
- Starting the backend (`scripts/start`)
- Database migrations (if Prisma is configured)
- SSL certificates and domain routing

**Free Deployment Options**
Since the frontend is a static Vite build and uses no backend APIs (all data is bundled, weather uses the free Open-Meteo API directly from the browser), it can be deployed to any static hosting:

- **Vercel** - `cd webapp && bun run build`, deploy the `dist/` folder. Free tier includes custom domains and SSL.
- **Netlify** - Same build, drag-and-drop the `dist/` folder or connect a Git repo. Free tier available.
- **GitHub Pages** - Push `dist/` to a `gh-pages` branch. Free for public repos.
- **Cloudflare Pages** - Connect repo, set build command to `cd webapp && bun run build`, output to `webapp/dist`. Free tier with generous limits.

See `docs/TECHNICAL.md` for detailed deployment instructions.