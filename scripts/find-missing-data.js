/**
 * Find hostels/lodging missing phone or address
 * Run with: node scripts/find-missing-data.js
 */

const fs = require('fs');
const path = require('path');

const contactsPath = path.join(__dirname, '../webapp/src/data/contacts.ts');
const content = fs.readFileSync(contactsPath, 'utf8');

// Parse the file to find businesses
const businessRegex = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*type:\s*'(hostel|lodging)'[^}]*\}/gs;

const missingPhone = [];
const missingAddress = [];

let match;
while ((match = businessRegex.exec(content)) !== null) {
  const block = match[0];
  const id = match[1];
  const name = match[2];
  const type = match[3];
  
  if (!block.includes('phone:')) {
    missingPhone.push({ id, name, type });
  }
  if (!block.includes('address:')) {
    missingAddress.push({ id, name, type });
  }
}

console.log('=== HOSTELS/LODGING MISSING PHONE ===');
missingPhone.forEach(b => console.log(`  ${b.type}: ${b.name} (${b.id})`));
console.log(`\nTotal: ${missingPhone.length}\n`);

console.log('=== HOSTELS/LODGING MISSING ADDRESS ===');
missingAddress.slice(0, 30).forEach(b => console.log(`  ${b.type}: ${b.name} (${b.id})`));
console.log(`\nTotal: ${missingAddress.length} (showing first 30)`);
