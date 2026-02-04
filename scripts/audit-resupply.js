const fs = require('fs');
const path = require('path');

// Read resupply.ts
const resupplyPath = path.join(__dirname, '..', 'webapp', 'src', 'data', 'resupply.ts');
const contactsPath = path.join(__dirname, '..', 'webapp', 'src', 'data', 'contacts.ts');

const resupplyContent = fs.readFileSync(resupplyPath, 'utf8');
const contactsContent = fs.readFileSync(contactsPath, 'utf8');

// Extract resupply IDs and names from resupply.ts
const resupplyIds = [];
const resupplyMap = new Map();
const resupplyRegex = /id:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'/g;
let match;
while ((match = resupplyRegex.exec(resupplyContent)) !== null) {
  const id = match[1];
  const name = match[2];
  resupplyIds.push(id);
  resupplyMap.set(id, name);
}

// Extract resupplyId and business counts from contacts.ts
const contactsMap = new Map();
const contactRegex = /resupplyId:\s*'([^']+)'[^\n]*\n([\s\S]*?)(?=resupplyId:|export function|$)/g;
while ((match = contactRegex.exec(contactsContent)) !== null) {
  const resupplyId = match[1];
  const section = match[2];
  
  // Count businesses in this section
  const businessMatches = section.match(/id: '[a-z]+-\d{3}'/g) || [];
  const businessCount = businessMatches.length;
  
  if (!contactsMap.has(resupplyId)) {
    contactsMap.set(resupplyId, { count: 0, businesses: [] });
  }
  contactsMap.get(resupplyId).count += businessCount;
}

console.log('=== RESUPPLY AUDIT REPORT ===\n');

// Check 1: Orphaned businesses (contacts pointing to non-existent resupply)
console.log('1. ORPHANED BUSINESSES (resupplyId not in resupply.ts):');
const orphanedBusinesses = [];
for (const [resupplyId, data] of contactsMap) {
  if (!resupplyMap.has(resupplyId)) {
    orphanedBusinesses.push({ resupplyId, businesses: data.count });
  }
}
if (orphanedBusinesses.length === 0) {
  console.log('   ✓ None found - all businesses link to valid resupply locations\n');
} else {
  orphanedBusinesses.forEach(o => {
    console.log(`   ✗ ${o.resupplyId}: ${o.businesses} businesses`);
  });
  console.log('');
}

// Check 2: Orphaned resupply locations (no contacts)
console.log('2. ORPHANED RESUPPLY LOCATIONS (no contacts):');
const orphanedResupply = [];
for (const [id, name] of resupplyMap) {
  if (!contactsMap.has(id)) {
    orphanedResupply.push({ id, name });
  }
}
if (orphanedResupply.length === 0) {
  console.log('   ✓ None found - all resupply locations have contacts\n');
} else {
  orphanedResupply.forEach(o => {
    console.log(`   ✗ ${o.id}: ${o.name}`);
  });
  console.log('');
}

// Check 3: Summary statistics
console.log('3. SUMMARY STATISTICS:');
console.log(`   Total resupply locations: ${resupplyIds.length}`);
console.log(`   Resupply locations with contacts: ${contactsMap.size}`);
console.log(`   Total businesses: ${Array.from(contactsMap.values()).reduce((sum, d) => sum + d.count, 0)}`);
console.log('');

// Check 4: Business counts per location
console.log('4. BUSINESS COUNTS PER LOCATION:');
const sortedContacts = Array.from(contactsMap.entries()).sort((a, b) => b[1].count - a[1].count);
sortedContacts.slice(0, 20).forEach(([id, data]) => {
  const name = resupplyMap.get(id) || 'Unknown';
  console.log(`   ${id}: ${data.count} businesses (${name.substring(0, 40)}${name.length > 40 ? '...' : ''})`);
});

console.log('');
console.log('=== AUDIT COMPLETE ===');
