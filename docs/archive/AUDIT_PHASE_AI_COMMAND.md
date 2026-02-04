# Business Data Integrity Audit Phase - AI Agent Instructions

## 🎯 Mission
Systematically audit all 934 businesses across 69 resupply locations in the AT Planner database by verifying each business against current Google searches. Update stale data, remove closed businesses, and ensure data accuracy.

## 📊 Current State
- **Total Resupply Locations:** 69
- **Total Businesses:** 934
- **Data Source:** Manual PDF transcription (completed 2026-02-04)
- **Direction:** Northbound (Amicalola Falls → Katahdin)
- **Progress Tracker:** `BUSINESS_AUDIT_PROGRESS.md`

## 🔍 Audit Process (Per Resupply Location)

### Step 1: Load Location Data
1. Read the resupply location from `webapp/src/data/resupply.ts`
2. Read all businesses for that location from `webapp/src/data/contacts.ts`
3. Note the resupplyId (e.g., 'rs-001', 'amicalola-falls-ga')

### Step 2: Google Search Verification
For EACH business at the location:

**Search Query:** `[Business Name] [City], [State]`

**Verify:**
- ✅ Business still exists (not permanently closed)
- ✅ Phone number is current
- ✅ Address is correct
- ✅ Hours of operation (if available)
- ✅ Website URL works and is correct
- ✅ Google Maps coordinates are accurate
- ✅ Pricing (note if significantly changed)

**Sources to Check:**
1. Google Business Profile
2. Business website
3. Google Maps listing
4. Recent reviews (check for closure mentions)

### Step 3: Update Data
Based on findings:

**If business is CLOSED:**
- Remove from `contacts.ts`
- Update `resupply.ts` notes if needed
- Document in changelog

**If data is OUTDATED:**
- Update phone, hours, website, address in `contacts.ts`
- Note changes in business notes field
- Document in changelog

**If data is CORRECT:**
- No changes needed
- Mark as verified in audit tracker

**If UNCERTAIN:**
- Flag for user review
- Document the discrepancy
- Ask user for clarification before making changes

### Step 4: Documentation
After completing each location:
1. Update `BUSINESS_AUDIT_PROGRESS.md` - mark location as audited
2. Update `changelog.txt` with summary of changes
3. Note statistics (verified, updated, removed, flagged)

## 📁 File Structure

### Data Files
- `webapp/src/data/resupply.ts` - Resupply location metadata
- `webapp/src/data/contacts.ts` - Business contact information
- `webapp/src/data/types.ts` - TypeScript type definitions

### Tracking Files
- `BUSINESS_AUDIT_PROGRESS.md` - Audit progress tracker (UPDATE AFTER EACH LOCATION)
- `changelog.txt` - Change log (APPEND CHANGES)
- `MANUAL_REVIEW_PROGRESS.md` - Previous phase (reference only, DO NOT MODIFY)

## 🎨 Data Format Standards

### Business Entry in contacts.ts
```typescript
{
  id: 'abc-001',                    // Unique ID: [location-code]-[number]
  name: 'Business Name',            // Official business name
  type: 'hostel',                   // Business type (see types below)
  phone: '(123) 456-7890',         // Primary phone
  phone2: '(123) 456-7891',        // Secondary phone (optional)
  email: 'contact@business.com',   // Email (optional)
  website: 'www.business.com',     // Website without https:// prefix
  address: '123 Main St, Town, ST 12345', // Full address
  hours: 'Mon-Fri 9am-5pm',        // Operating hours
  googleMapsUrl: 'https://maps.google.com/?q=lat,lng', // Google Maps link
  notes: 'Detailed information...',  // Hiker-relevant details
  pricing: '$30 bunk, $60 private', // Pricing info (optional)
  services: ['hostel', 'laundry', 'wifi'], // Service tags
}
```

### Business Types
`hostel`, `lodging`, `camping`, `grocery`, `outfitter`, `restaurant`, `post_office`, `shuttle`, `medical`, `hospital`, `pharmacy`, `library`, `services`, `ferry`, `permits`

### Service Tags
`hostel`, `lodging`, `camping`, `grocery`, `outfitter`, `post office`, `restaurant`, `breakfast`, `deli`, `ice cream`, `bar`, `laundry`, `showers`, `wifi`, `shuttle`, `slackpacking`, `pets`, `parking`, `fuel`, `mail drops`, `AT passport`, `medical`, `hospital`, `pharmacy`, `library`, `ferry`, `permits`, `visitor center`, `pool`, `entertainment`

## 🚨 Critical Rules

### DO:
- ✅ Use Google search to verify EVERY business
- ✅ Update `BUSINESS_AUDIT_PROGRESS.md` after EACH location
- ✅ Document ALL changes in `changelog.txt`
- ✅ Ask user for clarification when uncertain
- ✅ Preserve exact formatting and structure
- ✅ Keep notes field comprehensive for hikers
- ✅ Maintain consistent service tags

### DON'T:
- ❌ Fabricate or guess data
- ❌ Remove businesses without verification
- ❌ Skip Google search verification
- ❌ Modify `MANUAL_REVIEW_PROGRESS.md` (previous phase)
- ❌ Change resupply IDs
- ❌ Delete service tags without verification
- ❌ Make assumptions about business status

## 🔄 Workflow Example

**Location:** Amicalola Falls, GA (Mile -8.5)
**Businesses:** 2 businesses

1. **Read data:**
   - resupplyId: 'amicalola-falls-ga'
   - Business 1: Amicalola Falls State Park Lodge
   - Business 2: Len Foote Hike Inn

2. **Google search each:**
   - Search: "Amicalola Falls State Park Lodge Georgia"
   - Verify phone, hours, website, pricing
   - Check Google Maps for coordinates
   - Check reviews for recent closure mentions

3. **Update if needed:**
   - If phone changed: update in contacts.ts
   - If hours changed: update in contacts.ts
   - If closed: remove from contacts.ts
   - If uncertain: flag for user review

4. **Document:**
   - Mark location as audited in BUSINESS_AUDIT_PROGRESS.md
   - Add entry to changelog.txt:
     ```
     - 2026-02-04 - AUDIT: Amicalola Falls, GA - 2 businesses verified, 0 updated, 0 removed
     ```

5. **Move to next location:** Suches, GA (Mile 15.7)

## 📝 Changelog Format

```
- YYYY-MM-DD - AUDIT: [Location Name] - [X] businesses verified, [Y] updated, [Z] removed. [Brief summary of changes]
```

Example:
```
- 2026-02-04 - AUDIT: Hiawassee, GA - 35 businesses verified, 3 updated (phone numbers), 1 removed (permanently closed). Updated Blueberry Patch phone, removed Old Town Cafe (closed 2023).
```

## 🎯 Success Criteria

For each location audit:
- [ ] All businesses Google searched
- [ ] Closed businesses removed
- [ ] Outdated data updated
- [ ] Uncertain data flagged for user
- [ ] BUSINESS_AUDIT_PROGRESS.md updated
- [ ] changelog.txt updated
- [ ] No fabricated data

## 🚀 Getting Started

1. Read `BUSINESS_AUDIT_PROGRESS.md` to see current status
2. Start with first unchecked location (Amicalola Falls, GA)
3. Follow audit process for each business
4. Update progress tracker after each location
5. Continue northbound through all 69 locations

## 💡 Tips

- **Be thorough:** Every business matters to hikers
- **Be accurate:** Verify before updating
- **Be conservative:** When uncertain, ask user
- **Be consistent:** Follow format standards
- **Be persistent:** 934 businesses is a lot, but systematic approach works
- **Document everything:** Future agents need clear audit trail

## 📞 When to Ask User

- Business appears closed but uncertain
- Conflicting information between sources
- Significant pricing changes (>50%)
- Business name has changed
- Multiple businesses with same name in area
- Google Maps shows different location than our data
- Any other uncertainty about data accuracy

## 🎓 Context

This audit follows the Manual PDF Review Phase where 409 businesses across 37 northern locations were added/updated from official AT resupply guide PDFs. The PDF data is from 2021-2024 timeframe, so some information may be outdated. This audit ensures all data is current and accurate for 2026 hikers.

---

**Remember:** You are ensuring data accuracy for thousands of AT thru-hikers who will rely on this information for critical resupply planning. Accuracy matters!
