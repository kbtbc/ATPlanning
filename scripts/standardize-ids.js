/**
 * ID Standardization Script
 * Converts rs-XXX format IDs to location-name format
 * 
 * Run with: node scripts/standardize-ids.js
 */

const fs = require('fs');
const path = require('path');

// Mapping of old IDs to new location-name format IDs
const idMapping = {
  'rs-001': 'mountain-crossings-ga',
  'rs-002': 'hiawassee-ga',
  'rs-003': 'franklin-nc',
  'rs-004': 'nantahala-outdoor-center-nc',
  'rs-005': 'fontana-dam-nc',
  'rs-006': 'gatlinburg-tn',
  'rs-007': 'standing-bear-farm-tn',
  'rs-008': 'hot-springs-nc',
  'rs-009': 'erwin-tn',
  'rs-009b': 'roan-mountain-tn',
  'rs-010': 'mountain-harbour-tn',
  'rs-010b': 'dennis-cove-tn',
  'rs-011': 'hampton-tn',
  'rs-012': 'damascus-va',
  'rs-012b': 'troutdale-va',
  'rs-013': 'marion-va',
  'rs-014': 'atkins-va',
  'rs-015': 'bland-va',
  'rs-015b': 'narrows-va',
  'rs-016': 'pearisburg-va',
  'rs-017': 'catawba-va',
  'rs-018': 'daleville-va',
  'rs-018b': 'buchanan-va',
  'rs-019': 'glasgow-va',
  'rs-020': 'waynesboro-va',
  'rs-020b': 'luray-va',
  'rs-021': 'front-royal-va',
  'rs-021b': 'bears-den-va',
  'rs-022': 'harpers-ferry-wv',
  'rs-023': 'boonsboro-md',
  'rs-025': 'pine-grove-furnace-pa',
  'rs-026': 'boiling-springs-pa',
  'rs-027': 'duncannon-pa',
  'rs-028': 'port-clinton-pa',
  'rs-028b': 'hamburg-pa',
  'rs-029': 'palmerton-pa',
  'rs-029b': 'wind-gap-pa',
  'rs-030': 'delaware-water-gap-pa',
  'rs-031': 'branchville-nj',
  'rs-031b': 'unionville-ny',
  'rs-032': 'greenwood-lake-ny',
  'rs-033': 'bear-mountain-ny',
  'rs-034': 'peekskill-ny',
  'rs-035': 'kent-ct',
  'rs-036': 'cornwall-bridge-ct',
  'rs-036b': 'falls-village-ct',
  'rs-036c': 'salisbury-ct',
  'rs-037': 'sheffield-ma',
  'rs-038': 'great-barrington-ma',
  'rs-038b': 'tyringham-ma',
  'rs-039': 'dalton-ma',
  'rs-039b': 'cheshire-ma',
  'rs-041': 'north-adams-ma',
  'rs-042': 'williamstown-ma',
  'rs-043': 'bennington-vt',
  'rs-044': 'manchester-center-vt',
  'rs-045': 'danby-vt',
  'rs-045b': 'wallingford-vt',
  'rs-046': 'killington-vt',
  'rs-047': 'woodstock-vt',
  'rs-048': 'hanover-nh',
  'rs-049': 'glencliff-nh',
  'rs-050': 'lincoln-nh',
  'rs-051': 'franconia-nh',
  'rs-052': 'gorham-nh',
  'rs-053': 'andover-me',
  'rs-054': 'rangeley-me',
  'rs-055': 'stratton-me',
  'rs-056': 'monson-me',
};

function updateFile(filePath, mapping) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changeCount = 0;
  
  for (const [oldId, newId] of Object.entries(mapping)) {
    const regex = new RegExp(`'${oldId}'`, 'g');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, `'${newId}'`);
      changeCount += matches.length;
    }
  }
  
  fs.writeFileSync(filePath, content);
  return changeCount;
}

// Update both files
const resupplyPath = path.join(__dirname, '../webapp/src/data/resupply.ts');
const contactsPath = path.join(__dirname, '../webapp/src/data/contacts.ts');

console.log('Standardizing IDs to location-name format...\n');

const resupplyChanges = updateFile(resupplyPath, idMapping);
console.log(`resupply.ts: ${resupplyChanges} ID references updated`);

const contactsChanges = updateFile(contactsPath, idMapping);
console.log(`contacts.ts: ${contactsChanges} ID references updated`);

console.log('\nDone! Run TypeScript build to verify.');
