/**
 * One-off script to recalculate soboMile values in features.ts, shelters.ts, and resupply.ts
 * Updates from old trail length (2197.4) to new official 2026 length (2197.9)
 *
 * Formula: soboMile = 2197.9 - mile
 * GPS positions, NOBO miles, and elevations are NOT changed.
 *
 * Run with: bun run scripts/update-sobo-miles.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const NEW_TRAIL_LENGTH = 2197.9;

function updateSoboMiles(filePath: string): { updated: number; unchanged: number } {
  const content = readFileSync(filePath, 'utf-8');
  let updated = 0;
  let unchanged = 0;

  // Find each waypoint's mile and recalculate its soboMile
  // For inline objects (features.ts): mile: X, soboMile: Y
  // For multiline objects (shelters.ts, resupply.ts): mile: X,\n    soboMile: Y

  // Pattern 1: inline - "mile: 123.4, soboMile: 456.7"
  let newContent = content.replace(/mile:\s*([\d.-]+),\s*soboMile:\s*([\d.-]+)/g, (match, mileStr, oldSoboStr) => {
    const mile = parseFloat(mileStr);
    const oldSobo = parseFloat(oldSoboStr);
    const newSobo = Math.round((NEW_TRAIL_LENGTH - mile) * 10) / 10;

    if (oldSobo !== newSobo) {
      updated++;
      return `mile: ${mileStr}, soboMile: ${newSobo}`;
    }
    unchanged++;
    return match;
  });

  // Pattern 2: multiline - "mile: 123.4,\n    soboMile: 456.7"
  newContent = newContent.replace(/mile:\s*([\d.-]+),\s*\n(\s*)soboMile:\s*([\d.-]+)/g, (match, mileStr, indent, oldSoboStr) => {
    const mile = parseFloat(mileStr);
    const oldSobo = parseFloat(oldSoboStr);
    const newSobo = Math.round((NEW_TRAIL_LENGTH - mile) * 10) / 10;

    if (oldSobo !== newSobo) {
      updated++;
      return `mile: ${mileStr},\n${indent}soboMile: ${newSobo}`;
    }
    unchanged++;
    return match;
  });

  writeFileSync(filePath, newContent);
  return { updated, unchanged };
}

// Process all three data files
const dataDir = join(__dirname, '../src/data');

const files = ['features.ts', 'shelters.ts', 'resupply.ts'];

for (const file of files) {
  const filePath = join(dataDir, file);
  console.log(`\nProcessing ${file}...`);
  const { updated, unchanged } = updateSoboMiles(filePath);
  console.log(`  Updated: ${updated} soboMile values`);
  console.log(`  Unchanged: ${unchanged} soboMile values`);
}

console.log('\nDone! All soboMile values recalculated for trail length 2197.9 miles.');
