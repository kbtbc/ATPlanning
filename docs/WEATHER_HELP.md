# Weather Tab - Quick Guide for Thru-Hikers

## What It Does

The Weather tab gives you a **7-day forecast adjusted for trail elevation** at any point on the Appalachian Trail, from Amicalola Falls (mile -8.5) to Mt. Katahdin (mile 2197.9). It uses the Open-Meteo weather service and automatically adjusts temperatures based on how high you are on the ridge versus where the nearest weather station sits down in the valley.

---

## Three Ways to Get a Forecast

### By Mile Marker
Type in any trail mile and hit Enter. Great when you know where you'll be camping tonight or in a few days.

### By Shelter or Town
Search by name. Start typing "Springer" or "Franklin" and pick from the list. It only shows shelters and towns, so you won't get buried in random waypoints.

### By GPS
Hit "Use My GPS Location" and it finds the nearest point on the trail to where you're standing. Handy when you're on trail and just want to know what's coming.

---

## The Elevation Adjustment (Why It Matters)

Weather stations are usually in valleys. You're usually on a ridge. That difference matters.

The forecast adjusts every temperature using a standard lapse rate of **3.5 degrees F per 1,000 feet** of elevation difference. So if the weather station is at 1,200 ft and you're at 4,500 ft, your temps will read about 11.5 degrees colder than what the station reports.

You'll see a small info banner showing:
- Your trail elevation
- The weather station elevation
- How many degrees the adjustment is

If you ever want to see the unadjusted station temperature, it's shown in smaller text where relevant.

---

## Current Conditions ("Right Now")

The top card shows what's happening right now at your selected location:

- **Temperature** - Large, color-coded number (blue = cold, green = comfortable, red = hot)
- **Feels Like** - The apparent temperature factoring in wind chill or heat index
- **Condition** - Plain English like "Partly cloudy" or "Light rain" with a matching icon
- **Wind** - Speed in mph with compass direction. If gusts are significantly stronger, you'll see both: "12/35 mph/gusts NW"
- **Humidity & Rain Chance** - Shown together, like "85% humidity, 30% rain"
- **Visibility** - In miles. Useful for ridge walks and exposed balds
- **UV Index** - Rated from Low to Extreme with a color indicator

---

## Next 24 Hours (Hourly Scroll)

A scrollable row of hourly cards covering the next 24 hours. Each shows:

- Time (starting with "Now")
- A weather icon
- Temperature (color-coded)
- Rain chance (if any)
- Wind speed (flagged if gusts exceed 25 mph)

Scroll left and right to see the full day ahead. This is your best tool for deciding whether to push through or wait out a storm.

---

## 7-Day Forecast

One row per day showing:

- **Day name** - "Today" or "Wed, Feb 11", etc.
- **Weather icon** - The dominant condition for that day
- **Rain chance** - Percentage, or a dash if dry
- **Temperature bar** - A visual gradient from the day's low to high. Blue on the left (cold), warm colors on the right (warm). The bar's position is relative to the week's overall range so you can visually compare days at a glance
- **Below each day** - Wind speed (with gusts if significant), UV index, and the "feels like" temperature range

This is your planning view. Use it to decide whether to push miles on a good-weather day or plan a nero/zero when a front rolls in.

---

## Understanding the Colors

### Temperature Colors

| Temperature    | Color      | What It Means                  |
|----------------|------------|--------------------------------|
| 20 F and below | Blue       | Freezing - full winter gear    |
| 21-32 F        | Light blue | Below freezing - watch for ice |
| 33-50 F        | Teal       | Cold - layers needed           |
| 51-70 F        | Green      | Comfortable hiking weather     |
| 71-85 F        | Tan/warm   | Warm - hydrate often           |
| Above 85 F     | Red        | Hot - plan for shade and water |

### UV Index Colors

| UV Index | Label     | Action                         |
|----------|-----------|--------------------------------|
| 0-2      | Low       | Minimal concern                |
| 3-5      | Moderate  | Sunscreen on exposed ridges    |
| 6-7      | High      | Sunscreen and hat recommended  |
| 8-10     | Very High | Limit midday exposure          |
| 11+      | Extreme   | Seek shade when possible       |

### Wind Display

- **Normal wind** - Shown in muted text, like "12 mph NW"
- **Gusty conditions** - Highlighted in warm tones with the gust speed called out: "12/35 mph/gusts NW". This means steady wind of 12, gusts to 35, coming from the northwest.

---

## Tips for Thru-Hikers

- **Check weather at your destination, not your current location.** Use the mile marker or shelter picker to look ahead to where you'll be tonight or tomorrow.

- **Watch the "feels like" temperature.** Wind on an exposed ridge can make 45 F feel like 30 F.

- **Gusts matter more than steady wind.** When you see the gust number in the forecast, that's what you'll feel on the balds.

- **The elevation adjustment is your friend.** Valley forecasts can be 10-15 degrees warmer than what you'll experience on the ridge. This forecast accounts for that.

- **Refresh vs. new location:** Selecting a new shelter, mile, or GPS location automatically fetches a fresh forecast from the nearest weather station to that spot. The refresh button (circular arrow) is for pulling *updated* data for the location you're already viewing - useful if weather is changing fast or you've had the forecast open for a while. You don't need to hit refresh after picking a new location; the forecast updates automatically.

- **All times are Eastern Time** (America/New_York), which covers the entire AT corridor.

---

## Data Source

Weather data provided by [Open-Meteo](https://open-meteo.com/), a free and open weather API. The forecast covers 7 days ahead with hourly detail for the next 48 hours.
