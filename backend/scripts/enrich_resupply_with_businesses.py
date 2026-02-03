#!/usr/bin/env python3
"""
Enrich resupply points with business directory from PDF
Creates Contact Directory structure with business details
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Optional
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ResupplyEnricher:
    """Enrich resupply points with business directory"""
    
    def __init__(self, extracted_dir: str, webapp_data_dir: str):
        self.extracted_dir = Path(extracted_dir)
        self.webapp_data_dir = Path(webapp_data_dir)
        
    def load_business_data(self) -> Dict:
        """Load extracted business details"""
        business_file = self.extracted_dir / "business_details.json"
        with open(business_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def load_existing_resupply(self) -> List[Dict]:
        """Load existing resupply points from TypeScript"""
        resupply_file = self.webapp_data_dir / "resupply.ts"
        content = resupply_file.read_text()
        
        # Parse resupply objects
        resupply_points = []
        pattern = r'\{\s*id:[^}]+\}'
        
        for match in re.finditer(pattern, content, re.DOTALL):
            obj_text = match.group(0)
            
            # Extract key fields
            point = {'_original': obj_text}
            
            name_match = re.search(r'name:\s*["\']([^"\']+)["\']', obj_text)
            if name_match:
                point['name'] = name_match.group(1)
            
            id_match = re.search(r'id:\s*["\']([^"\']+)["\']', obj_text)
            if id_match:
                point['id'] = id_match.group(1)
            
            resupply_points.append(point)
        
        logger.info(f"Loaded {len(resupply_points)} existing resupply points")
        return resupply_points
    
    def match_town_to_business_data(self, town_name: str, business_data: Dict) -> Optional[Dict]:
        """Match resupply point to business data"""
        # Try exact match first
        if town_name in business_data['towns']:
            return business_data['towns'][town_name]
        
        # Try fuzzy match
        town_base = town_name.split(',')[0].strip().lower()
        for biz_town_name, biz_data in business_data['towns'].items():
            if town_base in biz_town_name.lower():
                return biz_data
        
        return None
    
    def clean_business_entry(self, business: Dict) -> Optional[Dict]:
        """Clean and validate business entry"""
        # Filter out junk entries
        name = business.get('name', '').strip()
        
        # Skip if name is too short or generic
        if len(name) < 3 or name.lower() in ['shuttles', 'hostels', 'at', 'and', 'the']:
            return None
        
        # Skip if name contains unicode junk
        if '\ufffd' in name or '\b' in name:
            return None
        
        # Clean the entry
        cleaned = {
            'name': name[:100],  # Limit length
            'type': business.get('type', 'business'),
            'phone': business.get('phone'),
            'hours': business.get('hours'),
            'address': business.get('address'),
            'website': business.get('website'),
            'email': business.get('email')
        }
        
        # Only include if has at least name and one other field
        if cleaned['phone'] or cleaned['website'] or cleaned['address']:
            return cleaned
        
        return None
    
    def generate_enriched_resupply(self):
        """Generate enriched resupply.ts with business directories"""
        business_data = self.load_business_data()
        existing_resupply = self.load_existing_resupply()
        
        enriched_count = 0
        enrichments = {}
        
        for point in existing_resupply:
            town_name = point.get('name')
            if not town_name:
                continue
            
            # Find matching business data
            biz_data = self.match_town_to_business_data(town_name, business_data)
            
            if biz_data and biz_data.get('businesses'):
                # Clean businesses
                cleaned_businesses = []
                for biz in biz_data['businesses']:
                    cleaned = self.clean_business_entry(biz)
                    if cleaned:
                        cleaned_businesses.append(cleaned)
                
                # Deduplicate by name
                seen_names = set()
                unique_businesses = []
                for biz in cleaned_businesses:
                    name_key = biz['name'].lower().strip()
                    if name_key not in seen_names:
                        seen_names.add(name_key)
                        unique_businesses.append(biz)
                
                if unique_businesses:
                    enrichments[point['id']] = {
                        'town_name': town_name,
                        'businesses': unique_businesses[:20],  # Limit to top 20
                        'business_count': len(unique_businesses)
                    }
                    enriched_count += 1
                    logger.info(f"Enriched {town_name} with {len(unique_businesses)} businesses")
        
        # Save enrichments
        enrichments_file = self.extracted_dir / "resupply_enrichments.json"
        with open(enrichments_file, 'w', encoding='utf-8') as f:
            json.dump(enrichments, f, indent=2)
        
        logger.info(f"Saved enrichments to {enrichments_file}")
        
        print("\n" + "="*80)
        print("RESUPPLY ENRICHMENT ANALYSIS")
        print("="*80)
        print(f"\nTotal resupply points: {len(existing_resupply)}")
        print(f"Points with business data: {enriched_count}")
        print(f"\nSample enriched towns:")
        for town_id, data in list(enrichments.items())[:10]:
            print(f"  - {data['town_name']}: {data['business_count']} businesses")
        print(f"\nOutput: {enrichments_file}")
        print("\nNext: Review enrichments and apply to resupply.ts")
        print("="*80)
        
        return enrichments

def main():
    """Main execution"""
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    extracted_dir = backend_dir / "data" / "extracted"
    webapp_data_dir = backend_dir.parent / "webapp" / "src" / "data"
    
    enricher = ResupplyEnricher(str(extracted_dir), str(webapp_data_dir))
    enricher.generate_enriched_resupply()

if __name__ == "__main__":
    main()
