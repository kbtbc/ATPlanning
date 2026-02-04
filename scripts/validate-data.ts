/**
 * Data Validation Script for AT Planner
 * Run with: npx ts-node scripts/validate-data.ts
 * 
 * Checks for:
 * - Orphaned contacts (resupplyId in contacts.ts not in resupply.ts)
 * - Missing phone numbers for hostels/lodging
 * - Duplicate businesses
 * - ID format inconsistencies
 */

import { resupplyContacts } from '../webapp/src/data/contacts';
import { resupplyPoints } from '../webapp/src/data/resupply';

interface ValidationResult {
  errors: string[];
  warnings: string[];
  stats: Record<string, number>;
}

function validateData(): ValidationResult {
  const result: ValidationResult = {
    errors: [],
    warnings: [],
    stats: {}
  };

  // Get all resupply IDs from both files
  const contactIds = new Set(resupplyContacts.map(c => c.resupplyId));
  const resupplyIds = new Set(resupplyPoints.map(r => r.id));

  // Check for orphaned contacts (in contacts but not in resupply)
  const orphanedContacts: string[] = [];
  contactIds.forEach(id => {
    if (!resupplyIds.has(id)) {
      orphanedContacts.push(id);
    }
  });
  if (orphanedContacts.length > 0) {
    result.warnings.push(`Orphaned contact IDs (in contacts.ts but not resupply.ts): ${orphanedContacts.join(', ')}`);
  }

  // Check for resupply points without contacts
  const missingContacts: string[] = [];
  resupplyIds.forEach(id => {
    if (!contactIds.has(id)) {
      missingContacts.push(id);
    }
  });
  if (missingContacts.length > 0) {
    result.warnings.push(`Resupply points without contacts: ${missingContacts.join(', ')}`);
  }

  // Count businesses and check for issues
  let totalBusinesses = 0;
  let missingPhone = 0;
  let missingAddress = 0;
  let hostelsWithoutPhone = 0;
  const businessTypes: Record<string, number> = {};
  const duplicateNames: Map<string, string[]> = new Map();

  resupplyContacts.forEach(location => {
    location.businesses.forEach(business => {
      totalBusinesses++;
      
      // Count by type
      businessTypes[business.type] = (businessTypes[business.type] || 0) + 1;
      
      // Check for missing phone
      if (!business.phone) {
        missingPhone++;
        if (business.type === 'hostel' || business.type === 'lodging') {
          hostelsWithoutPhone++;
          result.warnings.push(`${business.type} without phone: ${business.name} (${location.resupplyId})`);
        }
      }
      
      // Check for missing address
      if (!business.address) {
        missingAddress++;
      }
      
      // Track duplicates
      const key = business.name.toLowerCase().trim();
      if (!duplicateNames.has(key)) {
        duplicateNames.set(key, []);
      }
      duplicateNames.get(key)!.push(location.resupplyId);
    });
  });

  // Report duplicates
  duplicateNames.forEach((locations, name) => {
    if (locations.length > 1) {
      result.warnings.push(`Possible duplicate: "${name}" appears in: ${locations.join(', ')}`);
    }
  });

  // Check ID format consistency
  const idFormats = {
    'rs-XXX': 0,
    'location-name': 0,
    'other': 0
  };
  
  contactIds.forEach(id => {
    if (/^rs-\d+$/.test(id)) {
      idFormats['rs-XXX']++;
    } else if (/^[a-z]+-[a-z]+(-[a-z]+)*$/.test(id)) {
      idFormats['location-name']++;
    } else {
      idFormats['other']++;
      result.warnings.push(`Non-standard ID format: ${id}`);
    }
  });

  // Compile stats
  result.stats = {
    totalBusinesses,
    totalLocations: contactIds.size,
    resupplyPoints: resupplyIds.size,
    missingPhone,
    missingAddress,
    hostelsWithoutPhone,
    orphanedContacts: orphanedContacts.length,
    missingContacts: missingContacts.length,
    ...businessTypes
  };

  return result;
}

// Run validation
const results = validateData();

console.log('\n=== AT Planner Data Validation Report ===\n');

console.log('📊 STATISTICS:');
Object.entries(results.stats).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});

if (results.errors.length > 0) {
  console.log('\n❌ ERRORS:');
  results.errors.forEach(e => console.log(`  - ${e}`));
}

if (results.warnings.length > 0) {
  console.log('\n⚠️ WARNINGS:');
  results.warnings.forEach(w => console.log(`  - ${w}`));
}

console.log('\n✅ Validation complete.\n');
