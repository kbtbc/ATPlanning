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
- Interactive elevation profile with high-resolution GPX data (~5,000 points at 0.5mi intervals)
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
- 69 resupply points from Georgia to Maine
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
- **986 businesses documented** across 69 resupply locations
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
- **Last Verified:** February 2026

### Waypoint Browser
- 250+ shelters with capacity, water, and privy info
- All major towns and resupply points
- Notable features and landmarks
- Filter by type, state, and mile range
- Full-text search

## Data

- **Trail Length**: 2,197.4 miles (plus 8.5 mile approach trail)
- **Elevation Data**: ~5,000 points from FKT GPX (0.5mi resolution)
- **Shelters**: 252 shelters from GA to ME with accurate GPS coordinates (from ATC official data), icon-coded amenities, mile markers, capacity, and elevation
- **Resupply Points**: 69 locations covering entire trail
- **Business Contacts**: 986 businesses with complete contact information
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
- All 252 shelters have accurate GPS coordinates from official ATC data (guymott.com)
- Mile markers verified against AWOL AT Guide 2025 edition
- 228 shelters cross-validated with ATC coordinates
- 24 shelters use original GPS (naming variations not in ATC dataset)
- Icon recognition completed for amenities (water, tenting, privy, bear cables/boxes, showers, views, hammock friendly)

Always verify with current guidebooks and local conditions before hiking.

## Disclaimer

This app is for informational purposes only. Not affiliated with the Appalachian Trail Conservancy. Trail conditions change frequently - always check current conditions before your hike.

---

## Archived Documentation

Historical audit and progress files have been moved to `docs/archive/`:
- Business audit progress and changelog
- Shelter audit files (SHELTER_AUDIT.md, SHELTER_AI_COMMAND.md)
- Data enrichment records
- Deployment summaries

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