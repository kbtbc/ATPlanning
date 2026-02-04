/**
 * Add lastVerified field to all businesses
 * Run with: node scripts/add-last-verified.js
 */

const fs = require('fs');
const path = require('path');

const contactsPath = path.join(__dirname, '../webapp/src/data/contacts.ts');
let content = fs.readFileSync(contactsPath, 'utf8');

// Add lastVerified after each services: [...] line
const regex = /(services: \[[^\]]*\],?)(\s*\n\s*\})/g;
let changeCount = 0;

content = content.replace(regex, (match, services, closing) => {
  changeCount++;
  // Check if lastVerified already exists
  if (match.includes('lastVerified')) {
    return match;
  }
  return `${services}\n        lastVerified: '2026-02-04',${closing}`;
});

// Also handle businesses without services array - add after pricing or notes
const regex2 = /(pricing: '[^']*',?)(\s*\n\s*\})/g;
content = content.replace(regex2, (match, pricing, closing) => {
  if (match.includes('lastVerified') || match.includes('services:')) {
    return match;
  }
  changeCount++;
  return `${pricing}\n        lastVerified: '2026-02-04',${closing}`;
});

fs.writeFileSync(contactsPath, content);
console.log(`Added lastVerified to ${changeCount} businesses`);
