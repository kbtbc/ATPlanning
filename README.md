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
- Support for NOBO and SOBO hiking directions
- 1-14 day planning horizon
- Daily itinerary with shelters, resupply, and features sorted by mileage (in order of encounter)
- "Set as start" button on each day and each location to quickly re-plan from any point
- Interactive elevation profile with high-resolution GPX data (~5,000 points at 0.5mi intervals)
- Mini-map showing shelters (home icon), resupply points (package), and info markers positioned on the elevation line
- Day boundary markers on the map showing where each day ends
- Includes Amicalola Falls approach trail (mile -8.5 to 0)

### Trail Stats (accessible via Stats tab)
- Total miles breakdown
- Shelter and resupply counts
- Miles by state visualization
- NOBO/SOBO direction reference

### Resupply Planner
- 69 resupply points from Georgia to Maine
- Quality ratings: Full, Limited, Minimal
- Service indicators: Grocery, Post Office, Lodging, Restaurant, Shower, Laundry
- Distance from trail and shuttle availability
- Strategic planning tips and mail drop advice
- Comprehensive business directory with 934 contacts

### Contact Directory (COMPREHENSIVE!)
- **934 businesses documented** across 69 resupply locations
- Searchable directory of hostels, outfitters, grocery stores, restaurants, shuttles, and services
- Direct tap-to-call phone numbers (including dual phone numbers where applicable)
- Tap-to-open Google Maps links with precise coordinates
- Business hours, pricing, hiker rates, and detailed service lists
- **Complete coverage** for all 14 states from Georgia to Maine
- AT Passport locations marked throughout trail
- Comprehensive shuttle services with coverage areas and contact details
- Filter by state and search by name
- **Current Phase:** Business data integrity audit (verifying against Google searches)

### Waypoint Browser
- 250+ shelters with capacity, water, and privy info
- All major towns and resupply points
- Notable features and landmarks
- Filter by type, state, and mile range
- Full-text search

## Data

- **Trail Length**: 2,197.4 miles (plus 8.5 mile approach trail)
- **Elevation Data**: ~5,000 points from FKT GPX (0.5mi resolution)
- **Shelters**: 252 shelters from GA to ME
- **Resupply Points**: 69 locations covering entire trail
- **Business Contacts**: 934 businesses with complete contact information
- **Features**: 50 notable landmarks
- **States**: 14 states (GA, NC, TN, VA, WV, MD, PA, NJ, NY, CT, MA, VT, NH, ME)

### 🎯 Active Project: Business Data Integrity Audit

**Status:** Verifying all 934 businesses against current Google searches to ensure data accuracy.

**Phase 1 Complete:** Manual PDF Review ✅
- Systematically reviewed and transcribed business data from official AT resupply guide PDFs
- 409 businesses added/updated across 37 locations in northern states (CT, MA, VT, NH, ME)
- All critical safety information documented (Kennebec Ferry, Baxter permits, etc.)

**Phase 2 Current:** Business Data Integrity Audit 🔄
- Verifying each business via Google search
- Updating stale data (phone numbers, hours, websites)
- Removing permanently closed businesses
- Direction: Northbound (Amicalola Falls → Katahdin)
- Progress: 0/69 locations audited

**Progress Tracking:** 
- See `BUSINESS_AUDIT_PROGRESS.md` for current audit status
- See `MANUAL_REVIEW_PROGRESS.md` for Phase 1 completion summary

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
│   │   ├── ContactCard.tsx
│   │   └── ResupplyDirectory.tsx
│   ├── HikePlanner.tsx   # Main planner component
│   ├── MiniMap.tsx       # Elevation profile visualization
│   ├── LocationPanel.tsx # GPS/manual location
│   ├── ResupplyPlanner.tsx
│   ├── WaypointList.tsx
│   └── TrailProgress.tsx
├── hooks/                # Custom React hooks
├── data/                 # Trail data (shelters, resupply, elevation, contacts)
├── types/                # TypeScript definitions
├── lib/                  # Utilities
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

### Alternative: Use npm instead of bun
```bash
cd webapp
npm install
npm run dev
```

### Build for Production
```bash
cd webapp
bun run build   # or: npm run build
bun run preview # or: npm run preview
```

## Data Sources

Trail data compiled from:
- Appalachian Trail Conservancy
- The Trek resupply guides
- tnlandforms.us shelter data
- FarOut/Guthook community data
- FKT (Fastest Known Time) GPX data with elevation

Always verify with current guidebooks and local conditions before hiking.

## Disclaimer

This app is for informational purposes only. Not affiliated with the Appalachian Trail Conservancy. Trail conditions change frequently - always check current conditions before your hike.

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

To deploy, click the **Deploy** button on vibecode.dev. The platform handles:
- Building the frontend (`bun run build`)
- Starting the backend (`scripts/start`)
- Database migrations (if Prisma is configured)
- SSL certificates and domain routing

### Adding Database/Auth

If you need persistent storage or user authentication, use the `database-auth` skill in Vibecode. This will:
- Add Prisma ORM with SQLite
- Add Better Auth for user authentication
- Update the backend configuration automatically

