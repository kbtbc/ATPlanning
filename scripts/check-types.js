/**
 * Check if all businesses have type assigned
 */
const fs = require('fs');
const path = require('path');

const contactsPath = path.join(__dirname, '../webapp/src/data/contacts.ts');
const content = fs.readFileSync(contactsPath, 'utf8');

// Find all business blocks and check for type
const businessBlockRegex = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)'[^}]*?\}/gs;

let totalBusinesses = 0;
let withType = 0;
let withoutType = [];

let match;
while ((match = businessBlockRegex.exec(content)) !== null) {
  totalBusinesses++;
  const block = match[0];
  const id = match[1];
  const name = match[2];
  
  if (block.includes("type: '")) {
    withType++;
  } else {
    withoutType.push({ id, name, snippet: block.substring(0, 100) });
  }
}

console.log(`Total businesses: ${totalBusinesses}`);
console.log(`With type: ${withType}`);
console.log(`Without type: ${withoutType.length}`);

if (withoutType.length > 0) {
  console.log('\n=== BUSINESSES MISSING TYPE ===');
  withoutType.forEach(b => console.log(`  ${b.id}: ${b.name}`));
}
