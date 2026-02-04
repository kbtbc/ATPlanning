# ID Reconciliation: contacts.ts ↔ resupply.ts

## Issue
The `resupplyId` values in `contacts.ts` don't always match the `id` values in `resupply.ts`.

## Current ID Formats (Mixed)

### Format 1: `rs-XXX` (numbered)
Used for most major resupply points:
- `rs-001` through `rs-029` and variants like `rs-020b`

### Format 2: `location-name` (kebab-case)
Used for some locations:
- `amicalola-falls-ga`
- `suches-ga`
- `big-island`
- `buena-vista`
- `montebello`
- `reeds-gap`
- `elkton`
- `big-meadows`
- `linden`
- `keys-gap`
- `knoxville`
- `brunswick`
- `pen-mar-md-550`
- `blue-ridge-summit-pa`
- `fayetteville-pa`
- `pa-94-gardners-mt-holly-springs`
- `carlisle-pa`
- `pa-72-swatara-gap-lickdale-jonestown`
- `pa-645-pine-grove`
- `danielsville-pa`
- `mohican-outdoor-center-nj`

## Recommendation

**Option A: Standardize to `rs-XXX` format**
- Pros: Sequential, easy to reference
- Cons: Not human-readable, requires lookup

**Option B: Standardize to `location-name` format**
- Pros: Human-readable, self-documenting
- Cons: Longer, harder to type

**Option C: Keep hybrid but document**
- Pros: No migration needed
- Cons: Inconsistent

## Action Required

Before making changes:
1. Run validation script to identify all mismatches
2. Decide on standard format with user
3. Update both files in sync
4. Update any components that reference IDs

## Files Affected
- `webapp/src/data/contacts.ts` (105 resupplyId values)
- `webapp/src/data/resupply.ts` (109 id values)

## Last Updated
2026-02-04
