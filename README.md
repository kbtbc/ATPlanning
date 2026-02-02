# AT Thru-Hike Planner

A modern web app for planning Appalachian Trail thru-hikes and resupply stops. Features geolocation, flexible mileage planning (10-22 miles/day), and comprehensive waypoint data.

## Features

### Location Tracking
- GPS geolocation to find your position on the trail
- Manual mile marker entry (when GPS unavailable)
- Shows nearest mile marker and distance from trail
- Progress visualization (% complete)

### Hike Planner
- Flexible daily mileage (8-25 miles/day)
- Adjustable start date for planning
- Support for NOBO and SOBO hiking directions
- 1-14 day planning horizon
- Preset mileage options: 10, 12, 15, 18, 20, 22 miles
- Daily itinerary with shelters, resupply, and features
- "Set as start" button on each day to quickly re-plan from any point
- Interactive elevation profile with high-resolution GPX data (4,395 points at 0.5mi intervals)
- Mini-map showing shelters, resupply points, and notable features positioned on the elevation line
- Collapsible sidebar for expanded map view

### Resupply Planner
- 57 resupply points from Georgia to Maine
- Quality ratings: Full, Limited, Minimal
- Service indicators: Grocery, Post Office, Lodging, Restaurant, Shower, Laundry
- Distance from trail and shuttle availability
- Strategic planning tips and mail drop advice

### Waypoint Browser
- 250+ shelters with capacity, water, and privy info
- All major towns and resupply points
- Notable features and landmarks
- Filter by type, state, and mile range
- Full-text search

## Data

- **Trail Length**: 2,197.4 miles
- **Elevation Data**: 4,395 points from GPX (0.5mi resolution) with Open-Elevation API
- **Shelters**: 252 shelters from GA to ME
- **Resupply Points**: 57 towns and stores
- **Features**: 50 notable landmarks
- **States**: 14 states (GA, NC, TN, VA, WV, MD, PA, NJ, NY, CT, MA, VT, NH, ME)

## Tech Stack

- React 19 + TypeScript
- Vite
- TailwindCSS
- Framer Motion
- Lucide Icons

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
- WaymarkedTrails GPX data (192k+ track points)
- Open-Elevation API for elevation data

Always verify with current guidebooks and local conditions before hiking.

## Disclaimer

This app is for informational purposes only. Not affiliated with the Appalachian Trail Conservancy. Trail conditions change frequently - always check current conditions before your hike.
