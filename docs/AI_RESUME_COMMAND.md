# AI Resume Command - Resupply Enhancement Project

**Project:** AT Thru-Hike Planner - Resupply Location Enhancement  
**Created:** 2025-01-15  
**Purpose:** Enable clean context restoration for resupply enhancement audit  

---

## Quick Resume Command

If you need to resume this audit at any checkpoint, use:

**"Resume resupply enhancement audit from Checkpoint [N]. Review RESUPPLY_ENHANCEMENT_AUDIT.md and continue systematic enhancement."**

---

## Project Scope

**Objective:** Enhance all 69 resupply locations along the Appalachian Trail with verified, helpful information from public web sources.

**Total Locations:** 69 (from Amicalola Falls, GA to Mount Katahdin, ME)

**File:** `webapp/src/data/resupply.ts`

---

## Current Status

**Completed:** 0/69 locations (0%)  
**Current Phase:** Ready to begin Phase 1 (Georgia)

---

## Your Role

You are an AI assistant helping to systematically enhance resupply location descriptions for thru-hikers. Your job is to:

1. **Research** each resupply location using public web sources
2. **Add helpful context** about trail towns, thru-hiker culture, and practical details
3. **Preserve all existing data** - be additive only
4. **Follow the strategy** outlined in RESUPPLY_ENHANCEMENT_AUDIT.md
5. **Update the audit log** at each checkpoint

---

## Key Strategy: Business vs. Town Context

**CRITICAL DISTINCTION:**

**For locations WITH multiple businesses in contacts.ts:**
- Keep `notes` field focused on **general town/area context**
- Add thru-hiker insights about the town overall
- Do NOT duplicate business-specific details
- Examples: Franklin, Damascus, Hot Springs, Waynesboro

**For locations WITHOUT separate business entries:**
- Add business-specific details to `notes` field
- Include services, hours, prices if available
- Examples: Mountain Crossings at Neel Gap, NOC, Standing Bear Farm

**Check contacts.ts first** to determine which approach to use!

---

## Enhancement Checklist (per location)

For each resupply point, ensure:
- [ ] Web research completed (The Trek, WhiteBlaze, official sites)
- [ ] Thru-hiker reviews/forums checked
- [ ] General town context added (if multiple businesses)
- [ ] Business details added (if no separate business entries)
- [ ] Distance/direction verified
- [ ] Shuttle availability confirmed
- [ ] Notable features added
- [ ] Trail section context added
- [ ] Seasonal notes added (if relevant)
- [ ] Formatting consistent
- [ ] All original data preserved

---

## Data Structure Reference

```typescript
{
  id: 'rs-XXX',
  name: 'Town Name, ST',
  mile: 123.4,
  soboMile: 2073.0,
  elevation: 1234,
  lat: 12.3456,
  lng: -78.9012,
  state: 'ST',
  type: 'town' | 'resupply',
  hasGrocery: boolean,
  hasOutfitter: boolean,
  hasPostOffice: boolean,
  hasLodging: boolean,
  hasRestaurant: boolean,
  hasLaundry: boolean,
  hasShower: boolean,
  resupplyQuality: 'major_town' | 'trail_town' | 'on_trail' | 'limited',
  distanceFromTrail: number,
  directionFromTrail?: 'E' | 'W' | 'N' | 'S',
  shuttleAvailable?: boolean,
  notes: 'ENHANCE THIS FIELD',
  services: ['array', 'of', 'services']
}
```

---

## Label System for Notes

Use these consistent labels in enhanced notes:

- **MAJOR TOWN** - Full services, multiple grocery stores
- **TRAIL TOWN** - Hiker-friendly, good resupply options  
- **ON TRAIL** - Convenience stores at road crossings
- **LIMITED** - Minimal options, plan ahead
- **MAIL DROP** - Post office available
- **SHUTTLE REQUIRED** - Distance requires transportation
- **ZERO DAY SPOT** - Popular for rest days

---

## Verification Sources

**Primary sources (always cite in audit log):**
- The Trek resupply guides (thetrek.co)
- WhiteBlaze.net trail town forums
- Official town tourism websites
- FarOut/Guthook community comments
- Hostel/outfitter official websites
- Google Maps for current businesses
- Recent trail journals (2023-2025)

**Search strategy:**
- "[Town Name] AT resupply" 
- "[Town Name] Appalachian Trail thru-hiker"
- "[Town Name] trail town guide"
- Check for shuttle services, hiker-friendly atmosphere
- Look for recent reviews (last 2 years)

---

## Systematic Plan

### Phase 1: Georgia (4 locations)
- amicalola-falls-ga, suches-ga, rs-001 (Neel Gap), rs-002 (Hiawassee)

### Phase 2: North Carolina/Tennessee (8 locations)  
- rs-003 to rs-010 (Franklin, NOC, Fontana, Gatlinburg, Standing Bear, Hot Springs, Erwin, Roan Mountain)

### Phase 3: Virginia (21 locations)
- rs-011 to rs-031 (Longest state - Damascus, Waynesboro, Daleville, etc.)

### Phase 4: Mid-Atlantic (14 locations)
- rs-032 to rs-045 (Harpers Ferry, PA towns, Delaware Water Gap)

### Phase 5: New England (22 locations)
- rs-046 to rs-069 (NY, CT, MA, VT, NH, ME - Monson, Baxter)

---

## Example Enhancement

**Before:**
```typescript
notes: 'Trail town. Outfitter, grocery, hostels available.'
```

**After (for town WITH multiple businesses in contacts.ts):**
```typescript
notes: 'TRAIL TOWN: Popular hiker haven where AT runs directly through Main Street. Strong hiker culture with multiple hostels, outfitters, and hiker-friendly restaurants. Excellent full resupply. Only 273 miles from Springer—common spot for gear shakedown and first zero day. Spring Street Cafe and Iron Horse Station are hiker favorites. Can get crowded during peak season (April-May). Located at mile 273.9.'
```

**After (for location WITHOUT business entries):**
```typescript
notes: 'ON TRAIL: Trail passes directly through the historic Walasi-Yi Center building. Full outfitter with extensive hiker resupply section. Famous for gear shakedowns and pack lightening. Hostel bunks available ($20-30/night). Showers, laundry. Known as the "30-mile shakeout" - many hikers reassess gear here. Staff experienced with thru-hiker needs. Limited food options (vending, small selection). Shuttle to Blairsville (8.5W) or Dahlonega (15W) for full grocery.'
```

---

## Quality Standards

✅ **Required:**
- All original data preserved (GPS, flags, services array)
- Additive only - no deletions
- Web-verified information
- Helpful for thru-hikers
- Consistent formatting
- No speculation or outdated info

❌ **Forbidden:**
- Removing or changing existing data
- Adding unverified information
- Duplicating business details when separate entries exist
- Speculation about future changes
- Personal opinions without source

---

## Checkpoint Protocol

After completing each phase:
1. Update RESUPPLY_ENHANCEMENT_AUDIT.md with:
   - Completion metrics
   - Notable enhancements
   - Sources used
   - Checkpoint timestamp
2. Save all changes to resupply.ts
3. Document any issues or notes

---

## File Locations

- **Resupply data:** `webapp/src/data/resupply.ts`
- **Business contacts:** `webapp/src/data/contacts.ts`
- **Audit log:** `docs/RESUPPLY_ENHANCEMENT_AUDIT.md`
- **Resume command:** `docs/AI_RESUME_COMMAND.md` (this file)

---

## Resumption Steps

When resuming from a checkpoint:

1. **Read the audit file** (`RESUPPLY_ENHANCEMENT_AUDIT.md`) to see current status
2. **Check the last completed phase** in the audit log
3. **Review any notes or issues** from previous work
4. **Continue with next phase** in systematic plan
5. **Verify sources** for new enhancements
6. **Update audit log** after completing next checkpoint

---

## Notes for AI

- **Check contacts.ts FIRST** before enhancing each location
- **Distinguish** between town context and business details
- **Be consistent** with labeling (MAJOR TOWN, TRAIL TOWN, etc.)
- **Cite sources** in audit log for verification
- **Take your time** - quality over speed
- **5-10 minutes per location** is appropriate
- **Update audit at checkpoints** - not after every single location

---

*This resume command enables clean context restoration at any point in the resupply enhancement audit.*
