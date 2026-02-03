#!/usr/bin/env python3
"""
Apply comprehensive business directory to resupply.ts
Merges extracted businesses with existing resupply points
"""

import json
import re
from pathlib import Path
from typing import Dict, List
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ComprehensiveBusinessApplicator:
    """Apply comprehensive businesses to resupply.ts"""
    
    def __init__(self, extracted_dir: str, webapp_data_dir: str):
        self.extracted_dir = Path(extracted_dir)
        self.webapp_data_dir = Path(webapp_data_dir)
        
    def load_comprehensive_businesses(self) -> Dict:
        """Load comprehensive business extraction"""
        biz_file = self.extracted_dir / "all_businesses_comprehensive.json"
        with open(biz_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def load_existing_resupply(self) -> List[Dict]:
        """Parse existing resupply points"""
        resupply_file = self.webapp_data_dir / "resupply.ts"
        content = resupply_file.read_text(encoding='utf-8')
        
        resupply_points = []
        pattern = r'\{[^}]+\}'
        
        for match in re.finditer(pattern, content, re.DOTALL):
            obj_text = match.group(0)
            
            point = {'_original': obj_text}
            
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
            if biz.get('notes'):
                lines.append(f"        notes: '{self._escape(biz['notes'])}',")
            
            lines.append("      },")
        
        lines.append("    ],")
        return "\n".join(lines)
    
    def merge_businesses(self, existing_businesses: List[Dict], new_businesses: List[Dict]) -> List[Dict]:
        """Merge existing and new businesses, avoiding duplicates"""
        # Create map of existing businesses by name
        existing_map = {biz['name'].lower().strip(): biz for biz in existing_businesses}
        
        merged = list(existing_businesses)
        
        for new_biz in new_businesses:
            name_key = new_biz['name'].lower().strip()
            if name_key not in existing_map:
                merged.append(new_biz)
        
        return merged
    
    def enrich_resupply_object(self, obj_text: str, point_id: str, all_businesses: Dict) -> str:
        """Add or merge businesses to a resupply object"""
        if point_id not in all_businesses:
            return obj_text
        
        new_businesses = all_businesses[point_id]
        if not new_businesses:
            return obj_text
        
        # Check if already has businesses
        if 'businesses:' in obj_text:
            # Parse existing businesses
            existing_businesses = []
            biz_match = re.search(r'businesses:\s*\[(.*?)\]', obj_text, re.DOTALL)
            if biz_match:
                # Extract existing business objects
                biz_section = biz_match.group(1)
                for biz_obj in re.finditer(r'\{([^}]+)\}', biz_section):
                    biz_text = biz_obj.group(1)
                    name_match = re.search(r'name:\s*["\']([^"\']+)["\']', biz_text)
                    type_match = re.search(r'type:\s*["\']([^"\']+)["\']', biz_text)
                    if name_match and type_match:
                        existing_businesses.append({
                            'name': name_match.group(1),
                            'type': type_match.group(1)
                        })
            
            # Merge with new businesses
            merged = self.merge_businesses(existing_businesses, new_businesses)
            
            # Replace businesses section
            business_ts = self.generate_business_ts(merged)
            enriched = re.sub(r'businesses:\s*\[.*?\],', business_ts, obj_text, flags=re.DOTALL)
            
            logger.info(f"Merged businesses for {point_id}: {len(existing_businesses)} existing + {len(new_businesses)} new = {len(merged)} total")
            return enriched
        else:
            # Add businesses before closing brace
            business_ts = self.generate_business_ts(new_businesses)
            enriched = obj_text.rstrip(' }')
            enriched += ",\n" + business_ts + "\n  }"
            
            logger.info(f"Added {len(new_businesses)} businesses to {point_id}")
            return enriched
    
    def generate_enriched_file(self):
        """Generate complete enriched resupply.ts"""
        all_businesses = self.load_comprehensive_businesses()
        existing_points = self.load_existing_resupply()
        
        lines = [
            "import type { ResupplyPoint } from '../types';",
            "",
            "export const resupplyPoints: ResupplyPoint[] = [",
        ]
        
        enriched_count = 0
        total_businesses = 0
        
        for point in existing_points:
            point_id = point.get('id')
            obj_text = point['_original']
            
            if point_id and point_id in all_businesses:
                enriched_obj = self.enrich_resupply_object(obj_text, point_id, all_businesses)
                if enriched_obj != obj_text:
                    enriched_count += 1
                    total_businesses += len(all_businesses[point_id])
                lines.append(enriched_obj + ",")
            else:
                lines.append(obj_text + ",")
        
        lines.append("];")
        lines.append("")
        lines.append("export const RESUPPLY_COUNT = resupplyPoints.length;")
        lines.append("")
        
        # Save preview
        preview_file = self.extracted_dir / "resupply_comprehensive_PREVIEW.ts"
        with open(preview_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        
        logger.info(f"Generated preview: {preview_file}")
        
        print("\n" + "="*80)
        print("COMPREHENSIVE BUSINESS DIRECTORY GENERATED")
        print("="*80)
        print(f"\nTotal resupply points: {len(existing_points)}")
        print(f"Points enriched with businesses: {enriched_count}")
        print(f"Total businesses added: {total_businesses}")
        print(f"\nPreview file: {preview_file}")
        print("\nNext: Review and apply with apply_comprehensive_resupply.py")
        print("="*80)
        
        return preview_file

def main():
    """Main execution"""
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    extracted_dir = backend_dir / "data" / "extracted"
    webapp_data_dir = backend_dir.parent / "webapp" / "src" / "data"
    
    applicator = ComprehensiveBusinessApplicator(str(extracted_dir), str(webapp_data_dir))
    applicator.generate_enriched_file()

if __name__ == "__main__":
    main()
