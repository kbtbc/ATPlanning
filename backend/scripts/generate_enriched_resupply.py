#!/usr/bin/env python3
"""
Generate complete enriched resupply.ts with business directories
"""

import json
import re
from pathlib import Path
from typing import Dict, List
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EnrichedResupplyGenerator:
    """Generate enriched resupply.ts with business directories"""
    
    def __init__(self, extracted_dir: str, webapp_data_dir: str):
        self.extracted_dir = Path(extracted_dir)
        self.webapp_data_dir = Path(webapp_data_dir)
        
    def load_enrichments(self) -> Dict:
        """Load business enrichments"""
        enrichments_file = self.extracted_dir / "resupply_enrichments.json"
        with open(enrichments_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def parse_existing_resupply(self) -> List[Dict]:
        """Parse existing resupply points"""
        resupply_file = self.webapp_data_dir / "resupply.ts"
        content = resupply_file.read_text(encoding='utf-8')
        
        resupply_points = []
        pattern = r'\{[^}]+\}'
        
        for match in re.finditer(pattern, content, re.DOTALL):
            obj_text = match.group(0)
            
            # Parse the object
            point = {'_original': obj_text}
            
            # Extract ID
            id_match = re.search(r'id:\s*["\']([^"\']+)["\']', obj_text)
            if id_match:
                point['id'] = id_match.group(1)
            
            resupply_points.append(point)
        
        logger.info(f"Parsed {len(resupply_points)} resupply points")
        return resupply_points
    
    def _escape(self, s: str) -> str:
        """Escape string for TypeScript"""
        if not s:
            return ""
        # Remove problematic unicode characters
        s = s.replace('\u2019', "'").replace('\u2002', ' ').replace('\ufffd', '')
        return s.replace("'", "\\'").replace('"', '\\"').replace('\n', ' ')
    
    def generate_business_ts(self, businesses: List[Dict]) -> str:
        """Generate TypeScript for businesses array"""
        if not businesses:
            return ""
        
        lines = []
        lines.append("    businesses: [")
        for biz in businesses:
            lines.append("      {")
            lines.append(f"        name: '{self._escape(biz['name'])}',")
            lines.append(f"        type: '{biz['type']}',")
            
            if biz.get('phone'):
                lines.append(f"        phone: '{biz['phone']}',")
            if biz.get('hours'):
                lines.append(f"        hours: '{self._escape(biz['hours'])}',")
            if biz.get('address'):
                lines.append(f"        address: '{self._escape(biz['address'])}',")
            if biz.get('website'):
                lines.append(f"        website: '{biz['website']}',")
            if biz.get('email'):
                lines.append(f"        email: '{biz['email']}',")
            
            lines.append("      },")
        lines.append("    ],")
        
        return "\n".join(lines)
    
    def enrich_resupply_object(self, obj_text: str, point_id: str, enrichments: Dict) -> str:
        """Add businesses to a resupply object"""
        if point_id not in enrichments:
            return obj_text
        
        # Check if already has businesses
        if 'businesses:' in obj_text:
            return obj_text
        
        enrichment = enrichments[point_id]
        businesses = enrichment['businesses']
        
        # Add businesses before closing brace
        business_ts = self.generate_business_ts(businesses)
        
        # Insert before closing brace
        enriched = obj_text.rstrip(' }')
        enriched += ",\n" + business_ts + "\n  }"
        
        logger.info(f"Added {len(businesses)} businesses to {enrichment['town_name']}")
        return enriched
    
    def generate_file(self):
        """Generate complete enriched resupply.ts"""
        enrichments = self.load_enrichments()
        existing_points = self.parse_existing_resupply()
        
        # Generate header
        lines = [
            "import type { ResupplyPoint } from '../types';",
            "",
            "export const resupplyPoints: ResupplyPoint[] = [",
        ]
        
        # Process each point
        enriched_count = 0
        for point in existing_points:
            point_id = point.get('id')
            obj_text = point['_original']
            
            if point_id:
                enriched_obj = self.enrich_resupply_object(obj_text, point_id, enrichments)
                if enriched_obj != obj_text:
                    enriched_count += 1
                lines.append(enriched_obj + ",")
            else:
                lines.append(obj_text + ",")
        
        # Add footer
        lines.append("];")
        lines.append("")
        lines.append("export const RESUPPLY_COUNT = resupplyPoints.length;")
        lines.append("")
        
        # Save preview
        preview_file = self.extracted_dir / "resupply_enriched_PREVIEW.ts"
        with open(preview_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        
        logger.info(f"Generated preview: {preview_file}")
        
        print("\n" + "="*80)
        print("ENRICHED RESUPPLY FILE GENERATED")
        print("="*80)
        print(f"\nTotal resupply points: {len(existing_points)}")
        print(f"Enriched with business directories: {enriched_count}")
        print(f"\nPreview file: {preview_file}")
        print("\nNext: Review and apply with apply_enriched_resupply.py")
        print("="*80)
        
        return preview_file

def main():
    """Main execution"""
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    extracted_dir = backend_dir / "data" / "extracted"
    webapp_data_dir = backend_dir.parent / "webapp" / "src" / "data"
    
    generator = EnrichedResupplyGenerator(str(extracted_dir), str(webapp_data_dir))
    generator.generate_file()

if __name__ == "__main__":
    main()
