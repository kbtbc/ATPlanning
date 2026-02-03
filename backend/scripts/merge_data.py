#!/usr/bin/env python3
"""
Merge extracted PDF data with existing TypeScript data files
Handles deduplication, data enrichment, and TypeScript code generation
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Set, Any, Optional
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DataMerger:
    """Merge extracted JSON data with existing TypeScript files"""
    
    def __init__(self, extracted_dir: str, webapp_data_dir: str):
        self.extracted_dir = Path(extracted_dir)
        self.webapp_data_dir = Path(webapp_data_dir)
        self.merged_waypoints = []
        self.merged_towns = []
        
    def load_json_data(self, filename: str) -> List[Dict]:
        """Load JSON data file"""
        filepath = self.extracted_dir / filename
        if not filepath.exists():
            logger.warning(f"File not found: {filepath}")
            return []
        
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def parse_typescript_array(self, content: str, array_name: str) -> List[Dict]:
        """Parse TypeScript array from file content"""
        # This is a simplified parser - for production, use a proper TS parser
        # For now, we'll just extract the array data
        
        pattern = rf'{array_name}\s*:\s*\w+\[\]\s*=\s*\[(.*?)\];'
        match = re.search(pattern, content, re.DOTALL)
        
        if not match:
            return []
        
        # Extract object literals
        objects = []
        array_content = match.group(1)
        
        # Simple object extraction (this is a basic implementation)
        object_pattern = r'\{[^}]+\}'
        for obj_match in re.finditer(object_pattern, array_content):
            obj_str = obj_match.group(0)
            # Convert to JSON-like format (simplified)
            # In production, use a proper parser
            objects.append({})
        
        return objects
    
    def normalize_name(self, name: str) -> str:
        """Normalize waypoint/town name for comparison"""
        return name.lower().strip().replace('  ', ' ')
    
    def find_duplicate(self, item: Dict, existing: List[Dict], threshold: float = 0.9) -> Optional[Dict]:
        """Find duplicate item in existing data"""
        item_name = self.normalize_name(item.get('name', ''))
        
        for existing_item in existing:
            existing_name = self.normalize_name(existing_item.get('name', ''))
            
            # Exact name match
            if item_name == existing_name:
                return existing_item
            
            # Fuzzy name match (simple implementation)
            if self._similarity(item_name, existing_name) >= threshold:
                return existing_item
            
            # GPS proximity match (within ~100m)
            if self._gps_distance(item, existing_item) < 0.001:
                return existing_item
        
        return None
    
    def _similarity(self, s1: str, s2: str) -> float:
        """Calculate string similarity (Jaccard similarity)"""
        set1 = set(s1.split())
        set2 = set(s2.split())
        
        if not set1 or not set2:
            return 0.0
        
        intersection = len(set1 & set2)
        union = len(set1 | set2)
        
        return intersection / union if union > 0 else 0.0
    
    def _gps_distance(self, item1: Dict, item2: Dict) -> float:
        """Calculate simple GPS distance"""
        lat1, lng1 = item1.get('lat', 0), item1.get('lng', 0)
        lat2, lng2 = item2.get('lat', 0), item2.get('lng', 0)
        
        return ((lat1 - lat2) ** 2 + (lng1 - lng2) ** 2) ** 0.5
    
    def merge_waypoint_data(self, existing: Dict, extracted: Dict) -> Dict:
        """Merge two waypoint records, preferring more complete data"""
        merged = existing.copy()
        
        # Update fields if extracted has better data
        for key, value in extracted.items():
            if key == 'id':
                continue  # Keep existing ID
            
            # Update if existing is None/empty and extracted has value
            if not merged.get(key) and value:
                merged[key] = value
            
            # For services, merge lists
            elif key == 'services' and isinstance(value, list):
                existing_services = set(merged.get('services', []))
                new_services = set(value)
                merged['services'] = list(existing_services | new_services)
        
        return merged
    
    def merge_waypoints(self):
        """Merge waypoint data"""
        logger.info("Merging waypoint data...")
        
        # Load extracted data
        enhanced = self.load_json_data('enhanced_waypoints.json')
        extracted = self.load_json_data('extracted_waypoints.json')
        
        # Load existing data (simplified - would need proper TS parsing)
        existing = []
        
        # Combine extracted sources
        all_extracted = enhanced + extracted
        
        # Deduplicate extracted data first
        seen_names = set()
        unique_extracted = []
        
        for item in all_extracted:
            name = self.normalize_name(item.get('name', ''))
            if name not in seen_names:
                seen_names.add(name)
                unique_extracted.append(item)
        
        logger.info(f"Unique extracted waypoints: {len(unique_extracted)}")
        
        # Merge with existing
        for extracted_item in unique_extracted:
            duplicate = self.find_duplicate(extracted_item, existing)
            
            if duplicate:
                # Merge data
                merged = self.merge_waypoint_data(duplicate, extracted_item)
                self.merged_waypoints.append(merged)
            else:
                # New waypoint
                self.merged_waypoints.append(extracted_item)
        
        # Add existing items not in extracted
        for existing_item in existing:
            if not self.find_duplicate(existing_item, unique_extracted):
                self.merged_waypoints.append(existing_item)
        
        logger.info(f"Total merged waypoints: {len(self.merged_waypoints)}")
    
    def generate_typescript_code(self, data: List[Dict], type_name: str) -> str:
        """Generate TypeScript code from data"""
        lines = [
            f"import type {{ {type_name} }} from '../types';",
            "",
            f"export const {type_name.lower()}s: {type_name}[] = ["
        ]
        
        for item in data:
            lines.append("  {")
            
            for key, value in item.items():
                if value is None:
                    continue
                
                if isinstance(value, str):
                    lines.append(f"    {key}: '{value}',")
                elif isinstance(value, bool):
                    lines.append(f"    {key}: {str(value).lower()},")
                elif isinstance(value, list):
                    if all(isinstance(x, str) for x in value):
                        items = ", ".join(f"'{x}'" for x in value)
                        lines.append(f"    {key}: [{items}],")
                    else:
                        lines.append(f"    {key}: {json.dumps(value)},")
                else:
                    lines.append(f"    {key}: {value},")
            
            lines.append("  },")
        
        lines.append("];")
        lines.append("")
        
        return "\n".join(lines)
    
    def save_merged_data(self):
        """Save merged data to JSON files"""
        # Save merged waypoints
        output_file = self.extracted_dir / "merged_waypoints.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.merged_waypoints, f, indent=2)
        
        logger.info(f"Saved {len(self.merged_waypoints)} merged waypoints to {output_file}")
        
        # Generate TypeScript code
        ts_code = self.generate_typescript_code(self.merged_waypoints[:10], 'Waypoint')
        ts_file = self.extracted_dir / "merged_waypoints_sample.ts"
        with open(ts_file, 'w', encoding='utf-8') as f:
            f.write(ts_code)
        
        logger.info(f"Generated TypeScript sample: {ts_file}")
    
    def generate_merge_report(self) -> str:
        """Generate merge report"""
        report = [
            "="*80,
            "DATA MERGE REPORT",
            "="*80,
            "",
            f"Total merged waypoints: {len(self.merged_waypoints)}",
            "",
            "Next Steps:",
            "1. Review merged_waypoints.json for accuracy",
            "2. Check merged_waypoints_sample.ts for TypeScript format",
            "3. Manually integrate data into webapp/src/data/ files",
            "4. Test in web application",
            "",
            "Files Generated:",
            f"  - {self.extracted_dir / 'merged_waypoints.json'}",
            f"  - {self.extracted_dir / 'merged_waypoints_sample.ts'}",
            "",
            "="*80
        ]
        
        return "\n".join(report)

def main():
    """Main execution"""
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    extracted_dir = backend_dir / "data" / "extracted"
    webapp_data_dir = backend_dir.parent / "webapp" / "src" / "data"
    
    merger = DataMerger(str(extracted_dir), str(webapp_data_dir))
    
    # Merge waypoints
    merger.merge_waypoints()
    
    # Save results
    merger.save_merged_data()
    
    # Generate report
    report = merger.generate_merge_report()
    print(report)
    
    report_file = extracted_dir / "merge_report.txt"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    logger.info(f"Merge report saved to {report_file}")

if __name__ == "__main__":
    main()
