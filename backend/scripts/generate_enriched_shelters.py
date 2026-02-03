#!/usr/bin/env python3
"""
Generate enriched shelters.ts file
- Enriches existing records with PDF data
- Adds new shelters (filtered)
- Preserves original data structure
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Optional
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EnrichedSheltersGenerator:
    """Generate enriched shelters file"""
    
    def __init__(self, extracted_dir: str, webapp_data_dir: str):
        self.extracted_dir = Path(extracted_dir)
        self.webapp_data_dir = Path(webapp_data_dir)
        
        # Bad name patterns to filter out
        self.bad_patterns = [
            r'water source for',
            r'water is also located',
            r'old unused',
            r'former',
            r'this is the',
            r'^w water',
        ]
        
    def load_enrichment_report(self) -> Dict:
        """Load enrichment analysis"""
        report_file = self.extracted_dir / "enrichment_report.json"
        with open(report_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def is_valid_shelter(self, shelter: Dict) -> bool:
        """Check if shelter name is valid (not a water source note, etc)"""
        name = shelter.get('name', '').lower()
        
        for pattern in self.bad_patterns:
            if re.search(pattern, name):
                logger.info(f"Filtering out: {shelter['name']}")
                return False
        
        return True
    
    def deduplicate_new_items(self, items: List[Dict]) -> List[Dict]:
        """Remove duplicates within new items"""
        seen = {}
        unique = []
        
        for item in items:
            if not self.is_valid_shelter(item):
                continue
                
            name = item.get('name', '').lower().strip()
            lat = round(item.get('lat', 0), 4)
            lng = round(item.get('lng', 0), 4)
            
            key = f"{name}_{lat}_{lng}"
            
            if key not in seen:
                seen[key] = True
                unique.append(item)
        
        return unique
    
    def parse_existing_shelters_full(self) -> List[str]:
        """Parse existing shelters preserving full text"""
        shelters_file = self.webapp_data_dir / "shelters.ts"
        content = shelters_file.read_text()
        
        # Extract each shelter object as complete text
        shelters = []
        pattern = r'\{\s*id:[^}]+\}'
        
        for match in re.finditer(pattern, content, re.DOTALL):
            shelters.append(match.group(0))
        
        logger.info(f"Parsed {len(shelters)} existing shelter objects")
        return shelters
    
    def enrich_shelter_text(self, shelter_text: str, enrichments: Dict) -> str:
        """Enrich shelter text with additional data"""
        # Extract shelter ID to match with enrichments
        id_match = re.search(r"id:\s*['\"]([^'\"]+)['\"]", shelter_text)
        if not id_match:
            return shelter_text
        
        shelter_id = id_match.group(1)
        
        # Find enrichment data for this shelter
        enrichment_data = None
        for item in enrichments.get('enriched_items', []):
            if item.get('id') == shelter_id:
                enrichment_data = item
                break
        
        if not enrichment_data or not enrichment_data.get('_enrichments'):
            return shelter_text
        
        # Apply enrichments
        enriched = shelter_text
        
        # Add services if missing
        if 'services' in enrichment_data.get('_enrichments', []):
            services = enrichment_data.get('services', [])
            if services and 'services:' not in enriched:
                # Insert before closing brace
                services_str = ", ".join([f"'{s}'" for s in services])
                enriched = enriched.rstrip(' }') + f", services: [{services_str}] }}"
        
        # Add hasWater if missing
        if 'hasWater' in enrichment_data.get('_enrichments', []):
            if 'hasWater:' not in enriched:
                enriched = enriched.rstrip(' }') + ", hasWater: true }"
        
        # Add hasPrivy if missing
        if 'hasPrivy' in enrichment_data.get('_enrichments', []):
            if 'hasPrivy:' not in enriched:
                enriched = enriched.rstrip(' }') + ", hasPrivy: true }"
        
        # Add isTenting if missing
        if 'isTenting' in enrichment_data.get('_enrichments', []):
            if 'isTenting:' not in enriched:
                enriched = enriched.rstrip(' }') + ", isTenting: true }"
        
        # Add capacity if missing
        if 'capacity' in enrichment_data.get('_enrichments', []):
            capacity = enrichment_data.get('capacity')
            if capacity and 'capacity:' not in enriched:
                enriched = enriched.rstrip(' }') + f", capacity: {capacity} }}"
        
        # Add waterDistance if missing
        if 'waterDistance' in enrichment_data.get('_enrichments', []):
            water_dist = enrichment_data.get('waterDistance')
            if water_dist and 'waterDistance:' not in enriched:
                enriched = enriched.rstrip(' }') + f", waterDistance: {water_dist} }}"
        
        return enriched
    
    def generate_new_shelter_text(self, shelter: Dict) -> str:
        """Generate TypeScript text for new shelter"""
        lines = []
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
        
        if shelter.get('services'):
            services_str = ", ".join([f"'{s}'" for s in shelter['services']])
            lines.append(f"    services: [{services_str}],")
        
        lines.append("  }")
        
        return "\n".join(lines)
    
    def _generate_id(self, name: str) -> str:
        """Generate ID from name"""
        return name.lower().replace(' ', '-').replace(',', '').replace("'", '').replace('(', '').replace(')', '')
    
    def _escape(self, s: str) -> str:
        """Escape string for TypeScript"""
        return s.replace("'", "\\'").replace('"', '\\"')
    
    def generate_enriched_file(self):
        """Generate complete enriched shelters.ts file"""
        logger.info("Generating enriched shelters.ts file...")
        
        # Load data
        enrichments = self.load_enrichment_report()
        existing_shelters = self.parse_existing_shelters_full()
        new_shelters = self.deduplicate_new_items(enrichments['new_items'])
        
        logger.info(f"Enriching {len(existing_shelters)} existing shelters")
        logger.info(f"Adding {len(new_shelters)} new shelters (filtered)")
        
        # Generate file content
        lines = [
            "import type { Shelter } from '../types';",
            "",
            "// Trail total length",
            "export const TRAIL_LENGTH = 2197.4;",
            "",
            "// All 14 states the AT passes through",
            "export const AT_STATES = [",
            "  'GA', 'NC', 'TN', 'VA', 'WV', 'MD', 'PA', 'NJ', 'NY', 'CT', 'MA', 'VT', 'NH', 'ME'",
            "] as const;",
            "",
            "// State boundaries by mile marker (NOBO)",
            "export const STATE_BOUNDARIES: Record<string, { start: number; end: number; name: string }> = {",
            "  GA: { start: 0, end: 78.5, name: 'Georgia' },",
            "  NC: { start: 78.5, end: 166.2, name: 'North Carolina' },",
            "  TN: { start: 166.2, end: 444.8, name: 'Tennessee' },",
            "  VA: { start: 444.8, end: 1033.0, name: 'Virginia' },",
            "  WV: { start: 1000.7, end: 1026.0, name: 'West Virginia' },",
            "  MD: { start: 1026.0, end: 1070.0, name: 'Maryland' },",
            "  PA: { start: 1070.0, end: 1298.0, name: 'Pennsylvania' },",
            "  NJ: { start: 1298.0, end: 1378.1, name: 'New Jersey' },",
            "  NY: { start: 1378.1, end: 1472.9, name: 'New York' },",
            "  CT: { start: 1472.9, end: 1508.0, name: 'Connecticut' },",
            "  MA: { start: 1508.0, end: 1599.0, name: 'Massachusetts' },",
            "  VT: { start: 1599.0, end: 1755.0, name: 'Vermont' },",
            "  NH: { start: 1755.0, end: 1898.0, name: 'New Hampshire' },",
            "  ME: { start: 1898.0, end: 2197.4, name: 'Maine' },",
            "};",
            "",
            "// Comprehensive shelter data (enriched with PDF extraction)",
            "export const shelters: Shelter[] = [",
        ]
        
        # Add existing shelters (enriched)
        for i, shelter_text in enumerate(existing_shelters):
            enriched_text = self.enrich_shelter_text(shelter_text, enrichments)
            lines.append(enriched_text + (","))
        
        # Add new shelters
        if new_shelters:
            lines.append("")
            lines.append("  // New shelters from PDF extraction")
            for shelter in new_shelters:
                lines.append(self.generate_new_shelter_text(shelter) + ",")
        
        lines.append("];")
        lines.append("")
        lines.append("// Export the shelter count for reference")
        lines.append(f"export const SHELTER_COUNT = shelters.length;")
        lines.append("")
        
        # Save to preview file
        preview_file = self.extracted_dir / "shelters_enriched_PREVIEW.ts"
        with open(preview_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        
        logger.info(f"Generated preview file: {preview_file}")
        
        # Generate summary
        summary = {
            'original_count': len(existing_shelters),
            'enriched_count': len([item for item in enrichments['enriched_items'] if item.get('_enrichments')]),
            'new_count': len(new_shelters),
            'total_count': len(existing_shelters) + len(new_shelters),
            'filtered_out': len(enrichments['new_items']) - len(new_shelters)
        }
        
        summary_file = self.extracted_dir / "enrichment_summary.json"
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2)
        
        print("\n" + "="*80)
        print("ENRICHED SHELTERS FILE GENERATED")
        print("="*80)
        print(f"\nOriginal shelters: {summary['original_count']}")
        print(f"Enriched with additional data: {summary['enriched_count']}")
        print(f"New shelters added: {summary['new_count']}")
        print(f"Filtered out (bad names): {summary['filtered_out']}")
        print(f"\n**Total shelters in new file: {summary['total_count']}**")
        print(f"\nPreview file: {preview_file}")
        print("\nNext steps:")
        print("1. Review the preview file")
        print("2. If satisfied, run: python apply_enriched_shelters.py")
        print("3. Restart dev server to see changes")
        print("="*80)
        
        return preview_file

def main():
    """Main execution"""
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    extracted_dir = backend_dir / "data" / "extracted"
    webapp_data_dir = backend_dir.parent / "webapp" / "src" / "data"
    
    generator = EnrichedSheltersGenerator(str(extracted_dir), str(webapp_data_dir))
    generator.generate_enriched_file()

if __name__ == "__main__":
    main()
