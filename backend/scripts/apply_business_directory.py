#!/usr/bin/env python3
"""
Apply business directory to resupply.ts
Adds Contact Directory structure with business details
"""

import json
import re
from pathlib import Path
from typing import Dict, List
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BusinessDirectoryApplicator:
    """Apply business directory to resupply points"""
    
    def __init__(self, extracted_dir: str, webapp_data_dir: str):
        self.extracted_dir = Path(extracted_dir)
        self.webapp_data_dir = Path(webapp_data_dir)
        
    def load_enrichments(self) -> Dict:
        """Load business enrichments"""
        enrichments_file = self.extracted_dir / "resupply_enrichments.json"
        with open(enrichments_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def generate_business_ts(self, businesses: List[Dict]) -> str:
        """Generate TypeScript for businesses array"""
        if not businesses:
            return ""
        
        lines = ["    businesses: ["]
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
    
    def _escape(self, s: str) -> str:
        """Escape string for TypeScript"""
        if not s:
            return ""
        return s.replace("'", "\\'").replace('"', '\\"').replace('\n', ' ')
    
    def apply_to_resupply_file(self):
        """Apply business directories to resupply.ts"""
        enrichments = self.load_enrichments()
        
        # Read existing file
        resupply_file = self.webapp_data_dir / "resupply.ts"
        content = resupply_file.read_text()
        
        # Parse and enrich each resupply point
        enriched_count = 0
        pattern = r'(\{\s*id:\s*["\']([^"\']+)["\'][^}]+\})'
        
        def enrich_match(match):
            nonlocal enriched_count
            obj_text = match.group(1)
            point_id = match.group(2)
            
            # Check if this point has enrichments
            if point_id in enrichments:
                enrichment = enrichments[point_id]
                businesses = enrichment['businesses']
                
                # Check if businesses already exist
                if 'businesses:' in obj_text:
                    logger.debug(f"Skipping {point_id} - already has businesses")
                    return obj_text
                
                # Add businesses before closing brace
                business_ts = self.generate_business_ts(businesses)
                
                # Insert before closing brace
                enriched = obj_text.rstrip(' }')
                enriched += ",\n" + business_ts + "\n  }"
                
                enriched_count += 1
                logger.info(f"Added {len(businesses)} businesses to {enrichment['town_name']}")
                return enriched
            
            return obj_text
        
        # Apply enrichments
        new_content = re.sub(pattern, enrich_match, content, flags=re.DOTALL)
        
        # Write back with UTF-8 encoding
        resupply_file.write_text(new_content, encoding='utf-8')
        
        print("\n" + "="*80)
        print("BUSINESS DIRECTORY APPLIED")
        print("="*80)
        print(f"\nEnriched {enriched_count} resupply points with business directories")
        print("\nSample enriched towns:")
        for point_id, data in list(enrichments.items())[:10]:
            print(f"  - {data['town_name']}: {len(data['businesses'])} businesses")
        print("\nRestart dev server to see Contact Directory in application")
        print("="*80)

def main():
    """Main execution"""
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    extracted_dir = backend_dir / "data" / "extracted"
    webapp_data_dir = backend_dir.parent / "webapp" / "src" / "data"
    
    applicator = BusinessDirectoryApplicator(str(extracted_dir), str(webapp_data_dir))
    applicator.apply_to_resupply_file()

if __name__ == "__main__":
    main()
