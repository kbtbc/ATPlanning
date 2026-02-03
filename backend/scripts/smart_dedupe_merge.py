#!/usr/bin/env python3
"""
Smart deduplication merge - preserves original data, only adds NEW items
Extracts business details from PDF for resupply points
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SmartDedupeMerger:
    """Intelligent merge that preserves originals and only adds new items"""
    
    def __init__(self, extracted_dir: str, webapp_data_dir: str):
        self.extracted_dir = Path(extracted_dir)
        self.webapp_data_dir = Path(webapp_data_dir)
        
    def parse_existing_shelters(self) -> List[Dict]:
        """Parse existing shelters from TypeScript file"""
        shelters_file = self.webapp_data_dir / "shelters.ts"
        content = shelters_file.read_text()
        
        shelters = []
        # Find all shelter objects
        pattern = r'\{\s*id:\s*["\']([^"\']+)["\'][^}]+name:\s*["\']([^"\']+)["\'][^}]+mile:\s*(\d+\.?\d*)[^}]+lat:\s*(-?\d+\.?\d*)[^}]+lng:\s*(-?\d+\.?\d*)'
        
        for match in re.finditer(pattern, content, re.DOTALL):
            shelters.append({
                'id': match.group(1),
                'name': match.group(2),
                'mile': float(match.group(3)),
                'lat': float(match.group(4)),
                'lng': float(match.group(5))
            })
        
        logger.info(f"Parsed {len(shelters)} existing shelters")
        return shelters
    
    def parse_existing_resupply(self) -> List[Dict]:
        """Parse existing resupply points from TypeScript file"""
        resupply_file = self.webapp_data_dir / "resupply.ts"
        content = resupply_file.read_text()
        
        resupply = []
        pattern = r'\{\s*id:\s*["\']([^"\']+)["\'][^}]+name:\s*["\']([^"\']+)["\'][^}]+mile:\s*(\d+\.?\d*)[^}]+lat:\s*(-?\d+\.?\d*)[^}]+lng:\s*(-?\d+\.?\d*)'
        
        for match in re.finditer(pattern, content, re.DOTALL):
            resupply.append({
                'id': match.group(1),
                'name': match.group(2),
                'mile': float(match.group(3)),
                'lat': float(match.group(4)),
                'lng': float(match.group(5))
            })
        
        logger.info(f"Parsed {len(resupply)} existing resupply points")
        return resupply
    
    def is_duplicate(self, new_item: Dict, existing_items: List[Dict]) -> bool:
        """Check if item already exists (by name similarity or GPS proximity)"""
        new_name = self._normalize_name(new_item.get('name', ''))
        new_lat = new_item.get('lat', 0)
        new_lng = new_item.get('lng', 0)
        
        for existing in existing_items:
            existing_name = self._normalize_name(existing.get('name', ''))
            existing_lat = existing.get('lat', 0)
            existing_lng = existing.get('lng', 0)
            
            # Name match
            if self._names_similar(new_name, existing_name):
                logger.debug(f"Duplicate by name: '{new_item['name']}' matches '{existing['name']}'")
                return True
            
            # GPS proximity (within ~100m)
            if abs(new_lat - existing_lat) < 0.001 and abs(new_lng - existing_lng) < 0.001:
                logger.debug(f"Duplicate by GPS: '{new_item['name']}' near '{existing['name']}'")
                return True
        
        return False
    
    def _normalize_name(self, name: str) -> str:
        """Normalize name for comparison"""
        return name.lower().strip().replace('  ', ' ')
    
    def _names_similar(self, name1: str, name2: str) -> bool:
        """Check if two names are similar enough to be duplicates"""
        # Exact match
        if name1 == name2:
            return True
        
        # Remove common words
        for word in [' shelter', ' mountain', ' gap', ' creek', ' spring']:
            name1 = name1.replace(word, '')
            name2 = name2.replace(word, '')
        
        name1 = name1.strip()
        name2 = name2.strip()
        
        if name1 == name2:
            return True
        
        # One contains the other
        if name1 in name2 or name2 in name1:
            return True
        
        return False
    
    def find_new_shelters(self) -> List[Dict]:
        """Find shelters that don't exist in original data"""
        existing = self.parse_existing_shelters()
        
        # Load calibrated waypoints
        calibrated_file = self.extracted_dir / "calibrated_waypoints.json"
        with open(calibrated_file, 'r', encoding='utf-8') as f:
            calibrated = json.load(f)
        
        # Filter to shelters only
        calibrated_shelters = [w for w in calibrated if w.get('type') == 'shelter']
        
        # Find truly new ones
        new_shelters = []
        for shelter in calibrated_shelters:
            if not self.is_duplicate(shelter, existing):
                new_shelters.append(shelter)
        
        logger.info(f"Found {len(new_shelters)} NEW shelters (out of {len(calibrated_shelters)} extracted)")
        return new_shelters
    
    def find_new_resupply(self) -> List[Dict]:
        """Find resupply points that don't exist in original data"""
        existing = self.parse_existing_resupply()
        
        # Load calibrated towns
        calibrated_file = self.extracted_dir / "calibrated_towns.json"
        with open(calibrated_file, 'r', encoding='utf-8') as f:
            calibrated = json.load(f)
        
        # Find truly new ones
        new_resupply = []
        for town in calibrated:
            if not self.is_duplicate(town, existing):
                new_resupply.append(town)
        
        logger.info(f"Found {len(new_resupply)} NEW resupply points (out of {len(calibrated)} extracted)")
        return new_resupply
    
    def generate_report(self):
        """Generate report of new items to add"""
        new_shelters = self.find_new_shelters()
        new_resupply = self.find_new_resupply()
        
        # Save detailed JSON
        output = {
            'summary': {
                'new_shelters': len(new_shelters),
                'new_resupply': len(new_resupply),
                'total_new': len(new_shelters) + len(new_resupply)
            },
            'new_shelters': new_shelters,
            'new_resupply': new_resupply
        }
        
        json_file = self.extracted_dir / "new_items_only.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2)
        
        logger.info(f"Saved new items to {json_file}")
        
        # Generate markdown report
        report = [
            "# Smart Deduplication Report",
            "",
            "## Summary",
            f"- **New Shelters**: {len(new_shelters)}",
            f"- **New Resupply Points**: {len(new_resupply)}",
            f"- **Total New Items**: {len(new_shelters) + len(new_resupply)}",
            "",
            "## New Shelters",
            ""
        ]
        
        for shelter in new_shelters[:20]:  # Show first 20
            report.append(f"- **{shelter['name']}** (Mile {shelter['mile']}, {shelter['state']})")
        
        if len(new_shelters) > 20:
            report.append(f"- ... and {len(new_shelters) - 20} more")
        
        report.extend([
            "",
            "## New Resupply Points",
            ""
        ])
        
        for town in new_resupply[:20]:
            report.append(f"- **{town['name']}** (Mile {town['mile']}, {town['state']})")
        
        if len(new_resupply) > 20:
            report.append(f"- ... and {len(new_resupply) - 20} more")
        
        report.extend([
            "",
            "## Next Steps",
            "",
            "1. Review `new_items_only.json` for details",
            "2. Run `apply_new_items.py` to add these to your data files",
            "3. Original data will be preserved - no duplicates created",
            ""
        ])
        
        report_file = self.extracted_dir / "dedupe_report.md"
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(report))
        
        logger.info(f"Report saved to {report_file}")
        
        print("\n" + "="*80)
        print("SMART DEDUPLICATION COMPLETE")
        print("="*80)
        print(f"\nNew shelters to add: {len(new_shelters)}")
        print(f"New resupply points to add: {len(new_resupply)}")
        print(f"\nOriginal data preserved - no duplicates will be created")
        print(f"\nReview: {report_file}")
        print(f"Details: {json_file}")
        print("="*80)

def main():
    """Main execution"""
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    extracted_dir = backend_dir / "data" / "extracted"
    webapp_data_dir = backend_dir.parent / "webapp" / "src" / "data"
    
    merger = SmartDedupeMerger(str(extracted_dir), str(webapp_data_dir))
    merger.generate_report()

if __name__ == "__main__":
    main()
