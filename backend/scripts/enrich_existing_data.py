#!/usr/bin/env python3
"""
Enrich existing data with additional information from PDF extraction
- Matches existing records with extracted data
- Adds missing amenity information
- Adds business details for resupply points
- Only adds truly NEW items that don't exist
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DataEnricher:
    """Enrich existing data with PDF extraction results"""
    
    def __init__(self, extracted_dir: str, webapp_data_dir: str):
        self.extracted_dir = Path(extracted_dir)
        self.webapp_data_dir = Path(webapp_data_dir)
        
    def parse_existing_shelters(self) -> List[Dict]:
        """Parse existing shelters with all their data"""
        shelters_file = self.webapp_data_dir / "shelters.ts"
        content = shelters_file.read_text()
        
        shelters = []
        # Extract each shelter object
        pattern = r'\{\s*id:\s*["\']([^"\']+)["\'][^}]+\}'
        
        for match in re.finditer(pattern, content, re.DOTALL):
            obj_text = match.group(0)
            
            # Parse fields
            shelter = {}
            shelter['id'] = re.search(r'id:\s*["\']([^"\']+)["\']', obj_text).group(1)
            
            name_match = re.search(r'name:\s*["\']([^"\']+)["\']', obj_text)
            if name_match:
                shelter['name'] = name_match.group(1)
            
            mile_match = re.search(r'mile:\s*(\d+\.?\d*)', obj_text)
            if mile_match:
                shelter['mile'] = float(mile_match.group(1))
            
            lat_match = re.search(r'lat:\s*(-?\d+\.?\d*)', obj_text)
            if lat_match:
                shelter['lat'] = float(lat_match.group(1))
            
            lng_match = re.search(r'lng:\s*(-?\d+\.?\d*)', obj_text)
            if lng_match:
                shelter['lng'] = float(lng_match.group(1))
            
            # Store original text for reconstruction
            shelter['_original'] = obj_text
            
            shelters.append(shelter)
        
        logger.info(f"Parsed {len(shelters)} existing shelters")
        return shelters
    
    def find_match(self, item: Dict, existing_items: List[Dict]) -> Optional[Dict]:
        """Find matching existing item for enrichment"""
        item_name = item.get('name', '').lower().strip()
        item_lat = item.get('lat', 0)
        item_lng = item.get('lng', 0)
        
        for existing in existing_items:
            existing_name = existing.get('name', '').lower().strip()
            existing_lat = existing.get('lat', 0)
            existing_lng = existing.get('lng', 0)
            
            # Name similarity
            if self._names_match(item_name, existing_name):
                return existing
            
            # GPS proximity (within ~100m)
            if abs(item_lat - existing_lat) < 0.001 and abs(item_lng - existing_lng) < 0.001:
                return existing
        
        return None
    
    def _names_match(self, name1: str, name2: str) -> bool:
        """Check if names match"""
        if name1 == name2:
            return True
        
        # Remove common suffixes
        for suffix in [' shelter', ' mountain', ' gap', ' creek']:
            name1 = name1.replace(suffix, '')
            name2 = name2.replace(suffix, '')
        
        name1 = name1.strip()
        name2 = name2.strip()
        
        if name1 == name2:
            return True
        
        if name1 in name2 or name2 in name1:
            return True
        
        return False
    
    def enrich_shelter(self, existing: Dict, extracted: Dict) -> Dict:
        """Enrich existing shelter with extracted data"""
        enriched = existing.copy()
        enrichments = []
        
        # Add water info if missing
        if extracted.get('hasWater') and not existing.get('_original', '').find('hasWater: true') > -1:
            enriched['hasWater'] = True
            enrichments.append('hasWater')
            
            if extracted.get('waterDistance'):
                enriched['waterDistance'] = extracted['waterDistance']
                enrichments.append('waterDistance')
        
        # Add privy info if missing
        if extracted.get('hasPrivy') and not existing.get('_original', '').find('hasPrivy: true') > -1:
            enriched['hasPrivy'] = True
            enrichments.append('hasPrivy')
        
        # Add tenting info if missing
        if extracted.get('isTenting') and not existing.get('_original', '').find('isTenting: true') > -1:
            enriched['isTenting'] = True
            enrichments.append('isTenting')
        
        # Add capacity if missing
        if extracted.get('capacity') and not existing.get('_original', '').find('capacity:') > -1:
            enriched['capacity'] = extracted['capacity']
            enrichments.append('capacity')
        
        # Add services
        if extracted.get('services'):
            enriched['services'] = extracted['services']
            enrichments.append('services')
        
        if enrichments:
            enriched['_enrichments'] = enrichments
            logger.info(f"Enriched '{existing['name']}' with: {', '.join(enrichments)}")
        
        return enriched
    
    def generate_enrichment_report(self):
        """Generate report of enrichments and new items"""
        # Load extracted data
        calibrated_file = self.extracted_dir / "calibrated_waypoints.json"
        with open(calibrated_file, 'r', encoding='utf-8') as f:
            extracted_waypoints = json.load(f)
        
        calibrated_shelters = [w for w in extracted_waypoints if w.get('type') == 'shelter']
        
        # Load existing
        existing_shelters = self.parse_existing_shelters()
        
        # Match and enrich
        enriched = []
        new_items = []
        enrichment_count = 0
        
        for extracted in calibrated_shelters:
            match = self.find_match(extracted, existing_shelters)
            
            if match:
                enriched_item = self.enrich_shelter(match, extracted)
                if enriched_item.get('_enrichments'):
                    enriched.append(enriched_item)
                    enrichment_count += 1
            else:
                new_items.append(extracted)
        
        # Generate report
        report = {
            'summary': {
                'existing_shelters': len(existing_shelters),
                'extracted_shelters': len(calibrated_shelters),
                'enriched_count': enrichment_count,
                'new_items_count': len(new_items)
            },
            'enriched_items': enriched,
            'new_items': new_items
        }
        
        # Save report
        report_file = self.extracted_dir / "enrichment_report.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Saved enrichment report to {report_file}")
        
        # Generate markdown summary
        md_lines = [
            "# Data Enrichment Report",
            "",
            "## Summary",
            f"- Existing shelters: {len(existing_shelters)}",
            f"- Extracted shelters: {len(calibrated_shelters)}",
            f"- **Enriched with additional data**: {enrichment_count}",
            f"- **New items to add**: {len(new_items)}",
            "",
            "## Enrichments",
            ""
        ]
        
        for item in enriched[:20]:
            enrichments = ', '.join(item.get('_enrichments', []))
            md_lines.append(f"- **{item['name']}**: Added {enrichments}")
        
        if len(enriched) > 20:
            md_lines.append(f"- ... and {len(enriched) - 20} more")
        
        md_lines.extend([
            "",
            "## New Items",
            ""
        ])
        
        for item in new_items[:20]:
            md_lines.append(f"- **{item['name']}** (Mile {item['mile']}, {item['state']})")
        
        if len(new_items) > 20:
            md_lines.append(f"- ... and {len(new_items) - 20} more")
        
        md_file = self.extracted_dir / "enrichment_summary.md"
        with open(md_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(md_lines))
        
        print("\n" + "="*80)
        print("DATA ENRICHMENT ANALYSIS")
        print("="*80)
        print(f"\nExisting records that can be enriched: {enrichment_count}")
        print(f"New items to add: {len(new_items)}")
        print(f"\nTotal improvements: {enrichment_count + len(new_items)}")
        print(f"\nReview: {md_file}")
        print(f"Details: {report_file}")
        print("="*80)

def main():
    """Main execution"""
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    extracted_dir = backend_dir / "data" / "extracted"
    webapp_data_dir = backend_dir.parent / "webapp" / "src" / "data"
    
    enricher = DataEnricher(str(extracted_dir), str(webapp_data_dir))
    enricher.generate_enrichment_report()

if __name__ == "__main__":
    main()
