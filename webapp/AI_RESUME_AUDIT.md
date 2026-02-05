# AI Resume Instructions - AT Resupply Audit

## Context
We are auditing the AT (Appalachian Trail) resupply business listings in our webapp against https://appalachiantrailtravelguide.com/ to:
1. Add missing hostels, outfitters, shuttles, grocery stores, and post offices
2. Update existing listings with enhanced details (phone numbers, pricing, amenities)
3. Verify information with web searches for accuracy

## Current Progress
**Last completed state:** Virginia
**Next state to audit:** West Virginia

## Files Involved
- `/home/user/workspace/webapp/src/data/contacts.ts` - Main business listings data
- `/home/user/workspace/webapp/AUDIT_PROGRESS.md` - Detailed audit progress log

## Audit Process
1. Fetch state listings from: `https://appalachiantrailtravelguide.com/directory/categories/appalachian-trail-lodging-in-[state]`
2. Search for specific hostels/services with web search to verify current info
3. Compare against our `contacts.ts` file
4. Add missing entries, enhance existing ones
5. Update `lastVerified` dates to current date
6. Run TypeScript check after changes: `bunx tsc --noEmit`
7. Update AUDIT_PROGRESS.md with changes made

## Remaining States (in trail order, south to north)
1. West Virginia (shortest AT section, ~4 miles)
2. Maryland
3. Pennsylvania
4. New Jersey
5. New York
6. Connecticut
7. Massachusetts
8. Vermont
9. New Hampshire
10. Maine

## Focus Areas (per user request)
- Hostels specifically serving AT hikers
- Outfitters
- Grocery/resupply stores
- Shuttles
- Post offices

DO NOT add general lodging (hotels, B&Bs, cabin rentals) unless specifically hiker-focused.

## Search Patterns for Each State
```
WebFetch: https://appalachiantrailtravelguide.com/directory/categories/appalachian-trail-lodging-in-[state-lowercase]
WebSearch: "[Hostel Name] [Town] [State] AT hikers phone 2026"
Grep contacts.ts: "rs-XXX|[Town Name]" to find existing entries
```

## After Completing Each State
1. Update AUDIT_PROGRESS.md - move state to completed, add change log entry
2. Update this file with new "Next state to audit"
3. Run TypeScript check
4. Commit progress if requested

## Key Resupply IDs by Region
- rs-001 to rs-008: GA/NC
- rs-009 to rs-011: TN
- rs-012 to rs-025: VA
- rs-026 to rs-027: WV
- rs-028 to rs-030: MD
- rs-031 to rs-045: PA
- rs-046 to rs-048: NJ
- rs-049 to rs-055: NY
- rs-056 to rs-058: CT
- rs-059 to rs-065: MA
- rs-066 to rs-072: VT
- rs-073 to rs-085: NH
- rs-086 to rs-109: ME
