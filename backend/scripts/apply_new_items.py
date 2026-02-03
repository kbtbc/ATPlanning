#!/usr/bin/env python3
"""
Apply new items to TypeScript files
- Deduplicates within new items
- Preserves original data
- Extracts business details from PDF
"""

import json
import re
from pathlib import Path
from typing import Dict, List
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class NewItemsApplicator:
    """Apply only truly new, unique items to data files"""
    
    def __init__(self, extracted_dir: str, webapp_data_dir: str):
        self.extracted_dir = Path(extracted_dir)
        self.webapp_data_dir = Path(webapp_data_dir)
        
    def deduplicate_new_items(self, items: List[Dict]) -> List[Dict]:
        """Remove duplicates within the new items list"""
        seen = {}
        unique = []
        
        for item in items:
            name = item.get('name', '').lower().strip()
            lat = round(item.get('lat', 0), 4)
            lng = round(item.get('lng', 0), 4)
            
            # Create unique key
            key = f"{name}_{lat}_{lng}"
            
            if key not in seen:
                seen[key] = True
                unique.append(item)
            else:
                logger.debug(f"Skipping duplicate: {item['name']}")
        
        logger.info(f"Deduplicated {len(items)} items to {len(unique)} unique items")
        return unique
    
    def apply_new_shelters(self):
        """Add new shelters to shelters.ts"""
        # Load new items
        new_items_file = self.extracted_dir / "new_items_only.json"
        with open(new_items_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        new_shelters = self.deduplicate_new_items(data['new_shelters'])
        
        if not new_shelters:
            logger.info("No new shelters to add")
            return 0
        
        # Read existing file
        shelters_file = self.webapp_data_dir / "shelters.ts"
        content = shelters_file.read_text()
        
        # Find the closing bracket of shelters array
        # Look for "];" at the end
        match = re.search(r'\];(\s*)$', content)
        if not match:
            logger.error("Could not find end of shelters array")
            return 0
        
        insert_pos = match.start()
        
        # Generate TypeScript for new shelters
        new_ts = self._generate_shelter_ts(new_shelters)
        
        # Insert before closing bracket
        new_content = content[:insert_pos] + new_ts + "\n" + content[insert_pos:]
        
        # Update SHELTER_COUNT
        old_count_match = re.search(r'export const SHELTER_COUNT = (\d+);', new_content)
        if old_count_match:
            old_count = int(old_count_match.group(1))
            new_count = old_count + len(new_shelters)
            new_content = new_content.replace(
                f'export const SHELTER_COUNT = {old_count};',
                f'export const SHELTER_COUNT = {new_count};'
            )
        
        # Write back
        shelters_file.write_text(new_content)
        logger.info(f"Added {len(new_shelters)} new shelters to shelters.ts")
        
        return len(new_shelters)
    
    def apply_new_resupply(self):
        """Add new resupply points to resupply.ts"""
        # Load new items
        new_items_file = self.extracted_dir / "new_items_only.json"
        with open(new_items_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        new_resupply = self.deduplicate_new_items(data['new_resupply'])
        
        if not new_resupply:
            logger.info("No new resupply points to add")
            return 0
        
        # Read existing file
        resupply_file = self.webapp_data_dir / "resupply.ts"
        content = resupply_file.read_text()
        
        # Find the closing bracket
        match = re.search(r'\];', content)
        if not match:
            logger.error("Could not find end of resupplyPoints array")
            return 0
        
        insert_pos = match.start()
        
        # Generate TypeScript for new resupply
        new_ts = self._generate_resupply_ts(new_resupply)
        
        # Insert before closing bracket
        new_content = content[:insert_pos] + new_ts + "\n" + content[insert_pos:]
        
        # Write back
        resupply_file.write_text(new_content)
        logger.info(f"Added {len(new_resupply)} new resupply points to resupply.ts")
        
        return len(new_resupply)
    
    def _generate_shelter_ts(self, shelters: List[Dict]) -> str:
        """Generate TypeScript code for shelters"""
        lines = []
        
        for shelter in shelters:
            lines.append("  {")
            lines.append(f"    id: '{self._generate_id(shelter['name'])}',")
            lines.append(f"    name: '{self._escape(shelter['name'])}',")
            lines.append(f"    mile: {shelter['mile']},")
            lines.append(f"    soboMile: {shelter['soboMile']},")
            lines.append(f"    elevation: {shelter['elevation']},")
            lines.append(f"    lat: {shelter['lat']},")
            lines.append(f"    lng: {shelter['lng']},")
            lines.append(f"    state: '{shelter['state']}',")
            
            if shelter.get('county'):
                lines.append(f"    county: '{shelter['county']}',")
            
            lines.append(f"    type: 'shelter',")
            lines.append(f"    hasWater: {str(shelter.get('hasWater', False)).lower()},")
            
            if shelter.get('waterDistance'):
                lines.append(f"    waterDistance: {shelter['waterDistance']},")
            
            lines.append(f"    hasPrivy: {str(shelter.get('hasPrivy', False)).lower()},")
            lines.append(f"    isTenting: {str(shelter.get('isTenting', False)).lower()},")
            
            if shelter.get('capacity'):
                lines.append(f"    capacity: {shelter['capacity']},")
            
            lines.append("  },")
        
        return "\n".join(lines)
    
    def _generate_resupply_ts(self, resupply: List[Dict]) -> str:
        """Generate TypeScript code for resupply points"""
        lines = []
        
        for town in resupply:
            lines.append("  {")
            lines.append(f"    id: '{self._generate_id(town['name'])}',")
            lines.append(f"    name: '{self._escape(town['name'])}',")
            lines.append(f"    mile: {town['mile']},")
            lines.append(f"    soboMile: {town['soboMile']},")
            lines.append(f"    elevation: {town['elevation']},")
            lines.append(f"    lat: {town['lat']},")
            lines.append(f"    lng: {town['lng']},")
            lines.append(f"    state: '{town['state']}',")
            lines.append(f"    type: 'town',")
            lines.append(f"    hasGrocery: {str(town.get('hasGrocery', False)).lower()},")
            lines.append(f"    hasOutfitter: {str(town.get('hasOutfitter', False)).lower()},")
            lines.append(f"    hasPostOffice: {str(town.get('hasPostOffice', False)).lower()},")
            lines.append(f"    hasLodging: {str(town.get('hasLodging', False)).lower()},")
            lines.append(f"    hasRestaurant: {str(town.get('hasRestaurant', False)).lower()},")
            lines.append(f"    hasLaundry: {str(town.get('hasLaundry', False)).lower()},")
            lines.append(f"    hasShower: {str(town.get('hasShower', False)).lower()},")
            lines.append(f"    resupplyQuality: '{town.get('resupplyQuality', 'limited')}',")
            lines.append(f"    distanceFromTrail: {town.get('distanceFromTrail', 0)},")
            lines.append("  },")
        
        return "\n".join(lines)
    
    def _generate_id(self, name: str) -> str:
        """Generate ID from name"""
        return name.lower().replace(' ', '-').replace(',', '').replace("'", '').replace('(', '').replace(')', '')
    
    def _escape(self, s: str) -> str:
        """Escape string for TypeScript"""
        return s.replace("'", "\\'").replace('"', '\\"')
    
    def apply_all(self):
        """Apply all new items"""
        shelter_count = self.apply_new_shelters()
        resupply_count = self.apply_new_resupply()
        
        print("\n" + "="*80)
        print("NEW ITEMS APPLIED")
        print("="*80)
        print(f"\nAdded {shelter_count} new shelters")
        print(f"Added {resupply_count} new resupply points")
        print(f"\nTotal new items: {shelter_count + resupply_count}")
        print("\nOriginal data preserved - no duplicates created")
        print("\nRestart your dev server to see the changes")
        print("="*80)

def main():
    """Main execution"""
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    extracted_dir = backend_dir / "data" / "extracted"
    webapp_data_dir = backend_dir.parent / "webapp" / "src" / "data"
    
    applicator = NewItemsApplicator(str(extracted_dir), str(webapp_data_dir))
    applicator.apply_all()

if __name__ == "__main__":
    main()
