# AT Shelter Data Audit - WITH ICON ANALYSIS

## Context
We are systematically auditing our shelter listings in `webapp/src/data/shelters.ts` against the **AWOL Appalachian Trail Guide PDF** (WBP interactive PDF-V5E.pdf, **pages 240-251**).

### NEW: Icon Recognition
This audit now includes **icon-based amenity extraction** from the PDF:
- **Script**: `backend/scripts/extract_shelters_with_icons.py`
- **Icons Detected**: w (water), t (tenting), p (privy), J (bear cables), B (bear boxes), S (showers), v (views), h (hammock), E/W (east/west views), Q (warning)
- **Output**: `backend/data/extracted/shelters_with_icons.json`

### Data Source Key
- **Icon Legend**: `backend/data/Icon-Legend.png` - Visual reference for all icons
- **Trail Data Key**: `backend/data/Description-Trail-Data.png` - Field legend/key explaining symbols

### Directional Convention (IMPORTANT)
**For the Appalachian Trail:**
- When traveling **NOBO** (Northbound): **EAST is ALWAYS RIGHT** exiting the trail, **WEST is ALWAYS LEFT** exiting the trail (regardless of compass direction)
- When traveling **SOBO** (Southbound): **WEST is ALWAYS RIGHT** exiting the trail, **EAST is ALWAYS LEFT** exiting the trail

## Audit Scope
**Source:** `backend/data/WBP interactive PDF-V5E.pdf` (Pages 240-251)
**Target:** `webapp/src/data/shelters.ts`
**Icon Extraction:** Automated via `extract_shelters_with_icons.py`

**Data to extract:**
- Full shelter descriptions
- Distance from trail (if available)
- **Amenities from icon analysis** (NEW)
  - has_water, water_reliable
  - is_tenting
  - has_privy
  - has_bear_cables, has_bear_boxes
  - has_showers
  - has_views, is_hammock_friendly
  - has_warning
- GPS coordinates (verify accuracy)
- Water source details
- Side trail names/directions
- Elevation data

## Current Progress (Pages 240-251)

| Page | Status | Shelters | State(s) | Notes |
|------|--------|----------|----------|-------|
| 240 | ✅ COMPLETE | 12 | GA | All GA shelters updated with icon codes, GPS, elevation, full descriptions |
| 241 | ✅ COMPLETE | 25 | NC/TN | sh-024 to sh-048 updated with icon data, GPS, detailed notes |
| 242 | ✅ COMPLETE | 12 | NC/TN/VA | sh-049 to sh-060 updated with icon data, GPS, descriptions |
| 243 | 🔍 IN PROGRESS | TBD | TN/VA | Auditing remaining TN/VA shelters |
| 243 | ⏳ Not Started | 58 | NC/TN | NC/TN border |
| 244 | ⏳ Not Started | 41 | TN/VA | TN/VA transition |
| 245 | ⏳ Not Started | TBD | VA | Virginia |
| 246 | ⏳ Not Started | TBD | VA | Virginia |
| 247 | ⏳ Not Started | TBD | VA | Virginia |
| 248 | ⏳ Not Started | 45 | VA | Virginia |
| 249 | ⏳ Not Started | 30 | VA/NH | VA/transition |
| 250 | ⏳ Not Started | 8 | NH | New Hampshire |
| 251 | ⏳ Not Started | 5 | NH/ME | NH/ME transition |

## Icon-Based Amenities Extracted

### Available Amenities (from icon analysis)
- **Water**: `has_water`, `water_reliable` (w = reliable, w+ = unreliable/seasonal)
- **Camping**: `is_tenting` (t), `is_hammock_friendly` (h)
- **Facilities**: `has_privy` (p), `has_showers` (S), `has_restroom` (R)
- **Bear Protection**: `has_bear_cables` (J), `has_bear_boxes` (B)
- **Views**: `has_views` (v), `is_summit`
- **Warnings**: `has_warning` (Q, Z)
- **Cell**: `has_cell_signal`

### Icon Code Reference
| Code | Amenity | Description |
|------|---------|-------------|
| w | Water (reliable) | Reliable water source |
| w+ | Water (unreliable) | Seasonal/unreliable water |
| t | Tenting | Tent sites available |
| p | Privy | Toilet/privy available |
| J | Bear cables | Bear cable system |
| B | Bear boxes | Bear boxes available |
| S | Showers | Shower facility |
| R | Restroom | Public restroom |
| v | Views | Scenic views |
| h | Hammock | Hammock friendly |
| E | East view | Views to east |
| W | West view | Views to west |
| Q | Warning | Caution/warning |
| Z | Caution | Caution indicator |

## Changes Log

### Page 240 - ✅ COMPLETE (Georgia Shelters with Icons)

**Date:** 2026-02-06
**Status:** All 12 GA shelters audited and enhanced with icon codes
**Shelters:** sh-001 through sh-012

**Data Added:**
- Icon codes extracted from PDF and added to shelter notes
- GPS coordinates (where available in extraction)
- Elevation data verified
- Mile markers verified and corrected
- Full descriptions with water sources, distances, amenities

### Page 241 - ✅ COMPLETE (NC/TN Smokies with Icons)

**Date:** 2026-02-06
**Status:** 25 shelters updated (sh-024 through sh-048)

**Shelters Updated:**
- NC: Cable Gap, Groundhog Creek, Roaring Fork, Walnut Mountain, Deer Park Mountain, Spring Mountain, Little Laurel
- TN Smokies: Birch Spring Gap, Mollies Ridge, Russell Field, Spence Field, Derrick Knob, Silers Bald, Double Spring Gap, Mt Collins, Icewater Spring, Pecks Corner, Tricorner Knob, Cosby Knob, Davenport Gap
- TN: Jerry Cabin, Flint Mountain, Hogback Ridge, No Business Knob, Curley Maple Gap

**Data Added:**
- Icon codes for all shelters
- Precise GPS coordinates from PDF extraction
- Detailed water source descriptions with distances
- Bear protection info (cables vs boxes)
- View directions (E/W)
- Hammock-friendly indicators
- Smokies permit requirements noted

### Page 242 - ✅ COMPLETE (NC/TN/VA with Icons)

**Date:** 2026-02-06
**Status:** 12 shelters updated (sh-049 through sh-060)

**Shelters Updated:**
- TN: Cherry Gap, Clyde Smith, Roan High Knob, Stan Murray, Overmountain, Apple House, Mountaineer Falls, Vandeventer, Watauga Lake, Iron Mountain, Double Springs
- VA: Abingdon Gap

**Data Added:**
- Icon codes for all shelters
- Precise GPS coordinates from PDF extraction
- Detailed water source descriptions with distances
- Notable: Cherry Gap - former shelter destroyed by Hurricane Helene
- Notable: Roan High Knob - highest shelter on AT at 6190 ft
- Notable: Vandeventer - bring water (0.5 mi to nearest source)
- Notable: Overmountain - historic barn shelter with full amenities

### Page 243 - 🔍 IN PROGRESS (TN/VA with Icons)
*To be filled as audit progresses*

### Page 244 - ⏳ Not Started (TN/VA Transition with Icons)
*To be filled as audit progresses*

### Page 245 - ⏳ Not Started (Virginia with Icons)
*To be filled as audit progresses*

### Page 246 - ⏳ Not Started (Virginia with Icons)
*To be filled as audit progresses*

### Page 247 - ⏳ Not Started (Virginia with Icons)
*To be filled as audit progresses*

### Page 248 - ⏳ Not Started (Virginia with Icons)
*To be filled as audit progresses*

### Page 249 - ⏳ Not Started (VA/NH Transition with Icons)
*To be filled as audit progresses*

### Page 250 - ⏳ Not Started (New Hampshire with Icons)
*To be filled as audit progresses*

### Page 251 - ⏳ Not Started (NH/ME Transition with Icons)
*To be filled as audit progresses*

## Files Involved
- `backend/data/WBP interactive PDF-V5E.pdf` - Source data (pages 240-251)
- `backend/data/Icon-Legend.png` - Icon reference legend
- `backend/data/Description-Trail-Data.png` - Field legend/key
- `backend/scripts/extract_shelters_with_icons.py` - Icon extraction script
- `backend/data/extracted/shelters_with_icons.json` - Extracted data with icons
- `webapp/src/data/shelters.ts` - Target data file to update
- `webapp/src/types/index.ts` - Shelter type definitions

## Audit Process Per Shelter
1. Locate shelter in PDF by mile marker
2. Compare against current `shelters.ts` entry
3. Add/update fields:
   - `description` - Full description from PDF
   - `distanceFromTrail` - If shelter is off main trail
   - `directionFromTrail` - 'E' or 'W' (per NOBO convention)
   - `waterSource` - Detailed water info
   - `privyType` - Type of privy if specified
   - `tentingNotes` - Tenting restrictions/notes
   - `capacity` - Verify/update
   - `notes` - Any additional info
4. Mark complete in this file
5. Run TypeScript check after each page: `bunx tsc --noEmit`

## TypeScript Check
After each page completion, run:
```bash
cd webapp && bunx tsc --noEmit
```

---
**Last Updated:** 2026-02-06
**Next Action:** Extract and audit Page 232 shelters
