# 3rd Party Shelter Data Verification Sources

## Verified Working Sources

### 1. tnlandforms.us (ACTIVE - Has Real Data)

**URL:** https://tnlandforms.us/at/

**What's Available:**
- ✅ Complete shelter database with individual pages for each shelter
- ✅ GPS coordinates (lat/lon) for every shelter
- ✅ Downloadable `shelters.gpx` file (all shelters in GPX format)
- ✅ Downloadable `shelters.mxf` file (MapSend format)
- ✅ Elevation links to USGS National Map
- ✅ Google Maps, CalTopo, OpenStreetMap links for each shelter
- ✅ Links to nearby shelters
- ✅ Weather forecasts (NOAA, Weather Underground)

**Example Shelter Data:**
- Roan High Knob Shelter: lat=36.10506, lon=-82.12222
- GPS coordinates are WGS84 datum

**How to Use for Verification:**
1. Download `shelters.gpx` from https://tnlandforms.us/at/shelters.gpx
2. Parse GPX file to extract waypoint names and coordinates
3. Cross-reference with our `shelters.ts` data
4. Check coordinate accuracy (should match within ~0.001 degrees)

**Limitations:**
- No mile marker data (distance from Springer/Katahdin)
- No amenity details (water, privy, tenting info)
- Shelter names may differ slightly from AWOL guide

---

### 2. guymott.com (ACTIVE - Official ATC Data)

**URL:** https://guymott.com/atgps.html

**What's Available:**
- ✅ `AT_Shelters.zip` - Complete shelter database from ATC
- ✅ GPS tracks with shelters embedded
- ✅ Shelter capacity information (note: 0 = unknown capacity)
- ✅ Camping allowed indicators
- ✅ Fee information
- ✅ Filtered track collections (50ft, 200ft, various point counts)

**Data Genesis:**
- Official Appalachian Trail Conservancy data
- Requires agreeing to ATC Data Download Agreement
- Long comments contain complete information
- Short comments (30 char max) for GPS units

**How to Use for Verification:**
1. Download `AT_Shelters.zip`
2. Extract and parse shelter waypoint data
3. Compare GPS coordinates against our data
4. Verify capacity information
5. Cross-reference camping/fee details

---

## Non-Working/Empty Sources

### ❌ ATDB (Appalachian Trail Database) - sophiaknows.com

**Status:** Legacy/Empty Database
- Website shows copyright 2002-2006
- CSV export only contains header row (no data)
- Shelter pages show only navigation, no actual shelter information
- **Not recommended for verification**

---

## Recommended Verification Strategy

### Phase 1: Automated Comparison (Primary)
**Source:** tnlandforms.us `shelters.gpx`

1. Download shelters.gpx
2. Parse all shelter waypoints
3. Match against our `shelters.ts` by name and coordinates
4. Flag discrepancies:
   - GPS coordinates >0.001 degrees difference (~100m)
   - Shelters in our data not in GPX file
   - Shelters in GPX not in our data

### Phase 2: Capacity & Details Verification (Secondary)
**Source:** guymott.com `AT_Shelters.zip`

1. Download and extract shelter data
2. Verify capacity numbers
3. Cross-check camping allowed/fee information
4. Compare GPS coordinates as secondary check

### Phase 3: Spot Checks (Tertiary)
**Source:** Individual shelter pages on tnlandforms.us

- Manually verify flagged shelters from automated comparison
- Check shelters with notable discrepancies
- Verify special cases (destroyed shelters, new construction)

---

## Implementation Notes

### Download Links
- **GPX:** https://tnlandforms.us/at/shelters.gpx
- **MXF:** https://tnlandforms.us/at/shelters.mxf
- **ATC Shelters:** https://guymott.com/AT/AT_Shelters.zip

### Coordinate System
- Both sources use WGS84 datum
- Coordinates in decimal degrees (lat, lon)
- Verify our data matches within acceptable tolerance

### Known Differences to Expect
1. **Shelter naming:** Different sources may use slightly different names
   - Example: "Roan High Knob Shelter" vs "Roan High Knob"
   - Fuzzy matching recommended

2. **Coordinate precision:** May vary by source
   - tnlandforms: ~5 decimal places
   - guymott: Varies by original data
   - Acceptable tolerance: ±0.001 degrees (~100m)

3. **Elevation:** Sources may use different reference datums
   - Minor differences expected
   - Significant differences (>100ft) should be flagged

---

## Archive Note

Shelter audit files have been archived to:
- `docs/archive/SHELTER_AUDIT_20250114.md`
- `docs/archive/SHELTER_AI_COMMAND_20250114.md`

These contain the complete audit trail using the AWOL AT Guide 2025 edition with icon recognition.
