# AT Shelter Data Audit - AI Resume Command

## Quick Resume Command

If disconnected during the shelter audit, use this command to resume:

```
Continue the AT Shelter Data Audit from where we left off. 
Check SHELTER_AUDIT.md for current progress status, then proceed with the next uncompleted page.
Source PDF: backend/data/WBP interactive PDF-V5E.pdf (pages 240-251)
Target file: webapp/src/data/shelters.ts
Field key: backend/data/Description-Trail-Data.png
Icon data: backend/data/extracted/shelters_with_icons.json

Current task: Extract shelter data from the next uncompleted page and update listings with icon-based amenity data.
```

## Full Context for New AI Agent

### Project Overview
We are conducting a systematic audit of Appalachian Trail shelter data. The goal is to enhance our shelter listings with complete information from the AWOL AT Guide PDF.

### Icon Recognition (NEW)
We have automated icon extraction via `backend/scripts/extract_shelters_with_icons.py`
- Extracts icons like: w (water), t (tenting), p (privy), J (bear cables), B (bear boxes), S (showers), v (views), h (hammock)
- Output saved to: `backend/data/extracted/shelters_with_icons.json`
- Use this data to enhance shelter amenities in the audit

### Key Files
1. **Source Data:** `backend/data/WBP interactive PDF-V5E.pdf`
   - Shelter listings are on pages 240-251
   - Contains detailed descriptions, distances, amenities

2. **Field Legend:** `backend/data/Description-Trail-Data.png`
   - Shows how to interpret symbols and data fields
   - Explains icons for water, privies, tenting, etc.

3. **Target Data:** `webapp/src/data/shelters.ts`
   - Contains all shelter listings
   - Each shelter has: id, name, mile, soboMile, elevation, lat, lng, state, county, type, capacity, hasWater, waterDistance, hasPrivy, isTenting, fee, notes

4. **Icon Extracted Data:** `backend/data/extracted/shelters_with_icons.json`
   - Pre-extracted icon-based amenities from PDF
   - Use this to supplement shelter data with icons detected

5. **Audit Tracker:** `webapp/SHELTER_AUDIT.md`
   - Current progress documented here
   - Shows which pages are complete/incomplete
   - Contains detailed change log

### Data Structure (Shelter Interface)
```typescript
interface Shelter extends Waypoint {
  type: 'shelter';
  capacity?: number;
  hasWater: boolean;
  waterDistance?: number; // in feet
  hasPrivy: boolean;
  isTenting: boolean;
  fee?: number;
  notes?: string;
  // Potential new fields to add:
  // description?: string;  // Full description from PDF
  // waterSource?: string; // Detailed water info
  // privyType?: string;   // Type of privy
  // tentingNotes?: string; // Tenting restrictions
  // sideTrail?: string;   // Name of side trail to shelter
}
```

### Directional Convention (CRITICAL)
**For the Appalachian Trail:**
- When traveling **NOBO** (Northbound): **EAST is ALWAYS RIGHT** exiting the trail, **WEST is ALWAYS LEFT** exiting the trail
- When traveling **SOBO** (Southbound): The opposite applies
- This is consistent regardless of actual compass direction

### Audit Process
1. Read SHELTER_AUDIT.md to find the next uncompleted page
2. Extract shelter data from that PDF page
3. Find matching shelters in shelters.ts by mile marker
4. Update/add missing data fields
5. Update SHELTER_AUDIT.md with progress and notes
6. Run TypeScript check: `cd webapp && bunx tsc --noEmit`
7. Move to next page

### Expected Output per Page
For each shelter on the page, document:
- Shelter name and mile marker
- What data was added/updated
- Any discrepancies found
- Notes for future reference

### Resume Checklist
When resuming, verify:
- [ ] SHELTER_AUDIT.md is up to date
- [ ] Last completed page is documented
- [ ] shelters.ts has no TypeScript errors
- [ ] Ready to start next uncompleted page

---
**Created:** 2026-02-06
**Total Pages:** 12 (240-251)
**Total Shelters:** ~250+ shelters from GA to ME
**Status:** See SHELTER_AUDIT.md for current progress
