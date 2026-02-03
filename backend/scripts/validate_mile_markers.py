#!/usr/bin/env python3
"""
Validate mile markers against known waypoints from existing data
Cross-reference with GPX track to ensure accuracy
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Tuple
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MileMarkerValidator:
    """Validate extracted mile markers against known data"""
    
    def __init__(self, extracted_dir: str, webapp_data_dir: str):
        self.extracted_dir = Path(extracted_dir)
        self.webapp_data_dir = Path(webapp_data_dir)
        self.known_waypoints = {}
        
    def load_known_waypoints(self):
        """Load known waypoints from existing TypeScript files"""
        logger.info("Loading known waypoints from existing data...")
        
        # Parse shelters.ts
        shelters_file = self.webapp_data_dir / "shelters.ts"
        if shelters_file.exists():
            content = shelters_file.read_text()
            self._parse_typescript_waypoints(content, 'shelter')
        
        # Parse features.ts
        features_file = self.webapp_data_dir / "features.ts"
        if features_file.exists():
            content = features_file.read_text()
            self._parse_typescript_waypoints(content, 'feature')
        
        # Parse resupply.ts
        resupply_file = self.webapp_data_dir / "resupply.ts"
        if resupply_file.exists():
            content = resupply_file.read_text()
            self._parse_typescript_waypoints(content, 'resupply')
        
        logger.info(f"Loaded {len(self.known_waypoints)} known waypoints")
    
    def _parse_typescript_waypoints(self, content: str, wp_type: str):
        """Parse waypoints from TypeScript file"""
        # Extract objects from array
        # Pattern: { ... }
        objects = re.finditer(r'\{([^}]+)\}', content, re.DOTALL)
        
        for obj_match in objects:
            obj_text = obj_match.group(1)
            
            # Extract name
            name_match = re.search(r'name:\s*["\']([^"\']+)["\']', obj_text)
            if not name_match:
                continue
            
            name = name_match.group(1)
            
            # Extract mile
            mile_match = re.search(r'mile:\s*(\d+\.?\d*)', obj_text)
            mile = float(mile_match.group(1)) if mile_match else None
            
            # Extract coordinates
            lat_match = re.search(r'lat:\s*(-?\d+\.?\d*)', obj_text)
            lng_match = re.search(r'lng:\s*(-?\d+\.?\d*)', obj_text)
            
            lat = float(lat_match.group(1)) if lat_match else None
            lng = float(lng_match.group(1)) if lng_match else None
            
            if name and mile:
                self.known_waypoints[name.lower()] = {
                    'name': name,
                    'mile': mile,
                    'lat': lat,
                    'lng': lng,
                    'type': wp_type
                }
    
    def validate_extracted_waypoints(self) -> Dict:
        """Validate extracted waypoints against known data"""
        logger.info("Validating extracted waypoints...")
        
        # Load extracted data
        extracted_file = self.extracted_dir / "fixed_waypoints.json"
        if not extracted_file.exists():
            logger.error(f"Extracted file not found: {extracted_file}")
            return {}
        
        with open(extracted_file, 'r', encoding='utf-8') as f:
            extracted = json.load(f)
        
        validation_results = {
            'total_extracted': len(extracted),
            'matched': 0,
            'mile_differences': [],
            'close_matches': [],
            'no_match': [],
            'avg_mile_diff': 0.0,
            'max_mile_diff': 0.0
        }
        
        for waypoint in extracted:
            name = waypoint.get('name', '').lower()
            extracted_mile = waypoint.get('mile', 0)
            
            # Try to find match in known waypoints
            if name in self.known_waypoints:
                known = self.known_waypoints[name]
                known_mile = known['mile']
                
                diff = abs(extracted_mile - known_mile)
                validation_results['matched'] += 1
                validation_results['mile_differences'].append({
                    'name': waypoint['name'],
                    'extracted_mile': extracted_mile,
                    'known_mile': known_mile,
                    'difference': diff
                })
                
                if diff > 1.0:
                    logger.warning(f"{waypoint['name']}: Extracted {extracted_mile:.1f} vs Known {known_mile:.1f} (diff: {diff:.1f} miles)")
            else:
                # Try fuzzy match
                fuzzy_match = self._find_fuzzy_match(name)
                if fuzzy_match:
                    validation_results['close_matches'].append({
                        'extracted_name': waypoint['name'],
                        'possible_match': fuzzy_match['name'],
                        'extracted_mile': extracted_mile,
                        'known_mile': fuzzy_match['mile']
                    })
                else:
                    validation_results['no_match'].append(waypoint['name'])
        
        # Calculate statistics
        if validation_results['mile_differences']:
            diffs = [d['difference'] for d in validation_results['mile_differences']]
            validation_results['avg_mile_diff'] = sum(diffs) / len(diffs)
            validation_results['max_mile_diff'] = max(diffs)
        
        return validation_results
    
    def _find_fuzzy_match(self, name: str) -> Dict:
        """Find fuzzy match in known waypoints"""
        name_words = set(name.split())
        
        best_match = None
        best_score = 0
        
        for known_name, data in self.known_waypoints.items():
            known_words = set(known_name.split())
            
            # Jaccard similarity
            intersection = len(name_words & known_words)
            union = len(name_words | known_words)
            
            if union > 0:
                score = intersection / union
                if score > best_score and score > 0.5:
                    best_score = score
                    best_match = data
        
        return best_match
    
    def generate_validation_report(self, results: Dict) -> str:
        """Generate validation report"""
        report = [
            "="*80,
            "MILE MARKER VALIDATION REPORT",
            "="*80,
            "",
            f"Total extracted waypoints: {results['total_extracted']}",
            f"Matched with known data: {results['matched']}",
            f"Close matches (fuzzy): {len(results['close_matches'])}",
            f"No match found: {len(results['no_match'])}",
            "",
            "Mile Marker Accuracy:",
            f"  Average difference: {results['avg_mile_diff']:.2f} miles",
            f"  Maximum difference: {results['max_mile_diff']:.2f} miles",
            "",
        ]
        
        # Show largest differences
        if results['mile_differences']:
            sorted_diffs = sorted(results['mile_differences'], key=lambda x: x['difference'], reverse=True)
            report.append("Largest Mile Marker Differences:")
            for diff in sorted_diffs[:10]:
                report.append(f"  {diff['name']}: Extracted {diff['extracted_mile']:.1f} vs Known {diff['known_mile']:.1f} (diff: {diff['difference']:.1f})")
            report.append("")
        
        # Show close matches
        if results['close_matches']:
            report.append("Possible Name Matches (need verification):")
            for match in results['close_matches'][:10]:
                report.append(f"  '{match['extracted_name']}' might be '{match['possible_match']}'")
            report.append("")
        
        # Summary
        report.append("="*80)
        report.append("VALIDATION SUMMARY")
        report.append("="*80)
        
        if results['avg_mile_diff'] < 0.5:
            report.append("✅ EXCELLENT: Mile markers are highly accurate (avg diff < 0.5 miles)")
        elif results['avg_mile_diff'] < 1.0:
            report.append("✅ GOOD: Mile markers are reasonably accurate (avg diff < 1.0 miles)")
        elif results['avg_mile_diff'] < 2.0:
            report.append("⚠️ FAIR: Mile markers have some variance (avg diff < 2.0 miles)")
        else:
            report.append("❌ NEEDS REVIEW: Mile markers show significant variance (avg diff > 2.0 miles)")
        
        report.append("")
        report.append("Note: Mile markers calculated from GPX track using cumulative trail distance.")
        report.append("Small differences (<1 mile) are expected due to trail reroutes and GPS accuracy.")
        
        return "\n".join(report)

def main():
    """Main execution"""
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    extracted_dir = backend_dir / "data" / "extracted"
    webapp_data_dir = backend_dir.parent / "webapp" / "src" / "data"
    
    validator = MileMarkerValidator(str(extracted_dir), str(webapp_data_dir))
    
    # Load known waypoints
    validator.load_known_waypoints()
    
    # Validate extracted waypoints
    results = validator.validate_extracted_waypoints()
    
    # Generate report
    report = validator.generate_validation_report(results)
    print(report)
    
    # Save report
    report_file = extracted_dir / "validation_report.txt"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    logger.info(f"Validation report saved to {report_file}")

if __name__ == "__main__":
    main()
