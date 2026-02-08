# AT Thru-Hike Planner - Complete User Guide

This guide covers every feature of the AT Thru-Hike Planner app. It's written for thru-hikers and section hikers who want to get the most out of the tool.

---

## The Three Tabs

The app has three main tabs, accessible from the top navigation:

1. **Planner** - Build your daily hiking itinerary
2. **Resupply** - Find resupply towns, shelters, shuttles, and services
3. **Weather** - Get elevation-adjusted forecasts for any point on the trail

Your current mile marker syncs across all three tabs, so switching between them keeps your position.

---

## Planner Tab

The Planner builds a day-by-day itinerary based on where you are, how far you want to hike each day, and which direction you're heading.

### Setting Up Your Plan

At the top you'll find the controls:

- **Start Mile** - Where you are right now (or where you want to start planning from). You can type a mile number or use GPS.
- **Start Date** - When you'll begin this stretch. Defaults to today.
- **Direction** - NOBO (Georgia to Maine) or SOBO (Maine to Georgia). This changes the order everything is displayed.
- **Miles per Day** - Slide between 8 and 25 miles. This determines how far each day's plan stretches.
- **Days Ahead** - How many days to plan, from 1 to 14.

### GPS Location

Tap the GPS button to find your position on the trail. It uses your phone's location to figure out the nearest trail mile. Works best when you're on or near the trail.

### Day Cards

Each day gets its own card showing:

- **Date and day number** (Day 1, Day 2, etc.)
- **Start and end mile** for that day
- **Total distance** planned
- **Elevation gain and loss** - So you know how tough the day will be
- **Everything you'll pass** - Shelters, resupply points, and notable features, sorted in the order you'll encounter them

Tap a day card to expand or collapse it.

### What's Inside Each Day

Every item in a day's itinerary shows:

- **Shelters** - Name, mile marker, and amenity icons for water, privy, tenting, bear protection, views, and more. Warnings (crowding, mice, etc.) are flagged.
- **Resupply points** - Name, category badge (Major Town, Trail Town, On Trail, Limited), and how far off-trail they are.
- **Features** - Notable landmarks, summits, and viewpoints.

Each item has a **"Set as start"** button so you can quickly re-plan from any location. Useful when you decide to stop at a shelter and want to see what the next few days look like from there.

### Elevation Profile (Mini-Map)

Below the controls is an interactive elevation profile showing the terrain for your planned days:

- The line shows the actual elevation at extremely high resolution (~22,000 data points for the whole trail)
- **Colored markers** show shelters (green), resupply points (orange), and features (gray)
- **Day boundaries** are marked so you can see where each day begins and ends
- A **pulsing dot** shows your current position
- You can toggle which markers are visible (shelters, resupply, features)

### Trail Coverage

The planner covers the full trail from **Amicalola Falls approach trail (mile -8.5)** to **Mt. Katahdin (mile 2197.9)**, including all 14 states.

---

## Resupply Tab

The Resupply tab is a comprehensive trail town directory with 112 resupply locations and 891 businesses documented along the trail.

### Resupply Categories

Each location is color-coded by how much resupply it offers:

- **Major Town** (orange) - Full services: grocery stores, outfitters, restaurants, lodging. Examples: Franklin NC, Hot Springs NC, Waynesboro VA.
- **Trail Town** (blue) - Good resupply but more limited selection. Examples: Damascus VA, Monson ME.
- **On Trail** (green) - Convenience stores or camp stores right near the trail. Examples: Mountain Crossings at Neel Gap, Nantahala Outdoor Center.
- **Limited** (tan) - Minimal options. Small general stores. Plan your resupply before counting on these.

### Finding Resupply Points

The list shows every resupply point ahead of your current mile, sorted by distance. Each card shows:

- Name and location category
- How many miles ahead it is
- Direction from trail (left or right, adjusted for NOBO/SOBO)
- A count of available services (Lodging, Food, Shuttles, Services)

Tap any card to expand it and see full details.

### Business Directory

This is the big one. Tap into any resupply location and you'll find a complete directory of businesses:

- **891 businesses** documented across all 112 locations
- **Category filters** - Narrow down to Lodging, Food, Shuttles, or Services
- **Sub-type labels** for precise classification:
  - Lodging: HOSTEL, HOTEL, CAMPING, CAMPGROUND
  - Food: RESTAURANT, GROCERY, STORE
  - Shuttles: SHUTTLE services
  - Services: POST OFFICE, OUTFITTER, LAUNDRY, PHARMACY, MEDICAL, LIBRARY, and more

Each business card shows:
- Phone number (tap to call)
- Address with Google Maps link (tap to navigate)
- Hours, pricing, and key amenities
- Notes from other hikers
- Last verified date

### Planning Tips

The Resupply tab includes strategic tips for planning your resupply strategy, including advice on mail drops and how to handle stretches with limited options.

---

## Weather Tab

The Weather tab gives you a 7-day, elevation-adjusted forecast for any point on the trail.

### Getting a Forecast

Type into the search bar:

- **A mile number** - Type it and press Enter (e.g., "450" for mile 450)
- **A shelter or town name** - Start typing and pick from the dropdown results

Or tap the **GPS** button to get weather for your current location.

### The Elevation Adjustment

Weather stations are usually in valleys. You're usually on a ridge. The forecast adjusts every temperature using a standard lapse rate of **3.5 degrees F per 1,000 feet** of elevation difference.

An info banner shows:
- Your trail elevation
- The weather station elevation
- The exact temperature adjustment applied

### Current Conditions

The top card shows right now:
- **Temperature** (color-coded: blue = cold, green = comfortable, red = hot)
- **Feels like** temperature (factoring wind chill or heat index)
- **Weather condition** with icon
- **Wind** speed and gusts with compass direction
- **Humidity and rain chance**
- **Visibility** in miles
- **UV index** rated from Low to Extreme

### Hourly Forecast

Scroll left and right through the next 24 hours. Each card shows time, icon, temperature, rain chance, and gust warnings.

### 7-Day Forecast

One row per day with:
- Weather icon and condition
- Rain chance
- A colored temperature bar showing the low-to-high range
- Wind, UV, and feels-like details

### Refresh

The refresh button (circular arrow) pulls updated data for the same location. Selecting a new shelter or mile automatically fetches fresh weather — no need to refresh after switching locations.

For a detailed breakdown of all weather features, see `docs/WEATHER_HELP.md`.

---

## General Features

### Dark Mode

Toggle between light and dark themes using the sun/moon button in the header. Your preference is saved.

### Mobile Friendly

The entire app is designed for mobile phones first. Touch-friendly buttons, scrollable lists, and responsive layouts work on any screen size.

### Trail Stats

Tap "Trail Stats" in the footer to see:
- Total trail miles
- Shelter and resupply counts
- Miles broken down by state with a visual bar chart

---

## Understanding the Direction Conventions

This is important for reading off-trail directions:

- **NOBO (Northbound)**: East is always RIGHT, West is always LEFT when exiting the trail
- **SOBO (Southbound)**: West is always RIGHT, East is always LEFT

This is the standard AT hiker convention regardless of which compass direction the trail is actually facing.

---

## Data Sources

Trail data is compiled from:
- AWOL AT Guide (2025 edition)
- ATC Official Data (GPS coordinates)
- Appalachian Trail Conservancy
- The Trek resupply guides
- FarOut/Guthook community data
- FKT GPX data (elevation profiles)

Business directory last verified January 2025 (ongoing). Always verify with current guidebooks and local conditions before relying on any information for safety decisions.

---

## Disclaimer

This app is for informational purposes only. It is not affiliated with the Appalachian Trail Conservancy. Trail conditions, business hours, and services change frequently. Always check current conditions before your hike.
