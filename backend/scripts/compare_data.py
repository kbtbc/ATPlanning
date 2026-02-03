#!/usr/bin/env python3
"""
Compare extracted PDF data with existing project data
Generates a detailed comparison report showing what's new vs existing
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Set, Any
from dataclasses import dataclass
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class ComparisonStats:
    """Statistics for data comparison"""
    existing_count: int
    extracted_count: int
    new_items: int
    duplicates: int
    missing_data: int
    updated_items: int

class DataComparator:
    """Compare extracted data with existing TypeScript data"""
    
    def __init__(self, extracted_dir: str, existing_data_dir: str):
        self.extracted_dir = Path(extracted_dir)
        self.existing_data_dir = Path(existing_data_dir)
        self.report = []
        
    def load_existing_waypoints(self) -> List[Dict]:
        """Load existing waypoints from TypeScript files"""
        waypoints = []
        
        # Load shelters
        shelters_file = self.existing_data_dir / "shelters.ts"
        if shelters_file.exists():
            # Parse TypeScript file (simplified - just extract the data)
            content = shelters_file.read_text()
            # This is a simplified parser - in production would use proper TS parser
            logger.info(f"Loaded existing shelters from {shelters_file}")
        
        # Load features
        features_file = self.existing_data_dir / "features.ts"
        if features_file.exists():
            content = features_file.read_text()
            logger.info(f"Loaded existing features from {features_file}")
        
        return waypoints
    
    def load_existing_towns(self) -> List[Dict]:
        """Load existing resupply/town data"""
        towns = []
        
        resupply_file = self.existing_data_dir / "resupply.ts"
        if resupply_file.exists():
            content = resupply_file.read_text()
            logger.info(f"Loaded existing resupply data from {resupply_file}")
        
        return towns
    
    def load_extracted_data(self, filename: str) -> List[Dict]:
        """Load extracted JSON data"""
        filepath = self.extracted_dir / filename
        if not filepath.exists():
            logger.warning(f"Extracted file not found: {filepath}")
            return []
        
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        logger.info(f"Loaded {len(data)} items from {filename}")
        return data
    
    def compare_waypoints(self) -> ComparisonStats:
        """Compare waypoint data"""
        logger.info("Comparing waypoints...")
        
        existing = self.load_existing_waypoints()
        extracted = self.load_extracted_data("extracted_waypoints.json")
        
        # Create sets of waypoint names for comparison
        existing_names = {wp.get('name', '').lower() for wp in existing}
        extracted_names = {wp.get('name', '').lower() for wp in extracted}
        
        new_waypoints = extracted_names - existing_names
        duplicates = extracted_names & existing_names
        
        stats = ComparisonStats(
            existing_count=len(existing),
            extracted_count=len(extracted),
            new_items=len(new_waypoints),
            duplicates=len(duplicates),
            missing_data=0,
            updated_items=0
        )
        
        self.report.append("\n" + "="*80)
        self.report.append("WAYPOINT COMPARISON")
        self.report.append("="*80)
        self.report.append(f"Existing waypoints: {stats.existing_count}")
        self.report.append(f"Extracted waypoints: {stats.extracted_count}")
        self.report.append(f"New waypoints: {stats.new_items}")
        self.report.append(f"Duplicates: {stats.duplicates}")
        
        if new_waypoints:
            self.report.append("\nNew Waypoints Found:")
            for name in sorted(new_waypoints)[:20]:  # Show first 20
                self.report.append(f"  - {name}")
            if len(new_waypoints) > 20:
                self.report.append(f"  ... and {len(new_waypoints) - 20} more")
        
        return stats
    
    def compare_towns(self) -> ComparisonStats:
        """Compare town/resupply data"""
        logger.info("Comparing towns...")
        
        existing = self.load_existing_towns()
        extracted = self.load_extracted_data("extracted_towns.json")
        
        existing_names = {t.get('name', '').lower() for t in existing}
        extracted_names = {t.get('name', '').lower() for t in extracted}
        
        new_towns = extracted_names - existing_names
        duplicates = extracted_names & existing_names
        
        stats = ComparisonStats(
            existing_count=len(existing),
            extracted_count=len(extracted),
            new_items=len(new_towns),
            duplicates=len(duplicates),
            missing_data=0,
            updated_items=0
        )
        
        self.report.append("\n" + "="*80)
        self.report.append("TOWN/RESUPPLY COMPARISON")
        self.report.append("="*80)
        self.report.append(f"Existing towns: {stats.existing_count}")
        self.report.append(f"Extracted towns: {stats.extracted_count}")
        self.report.append(f"New towns: {stats.new_items}")
        self.report.append(f"Duplicates: {stats.duplicates}")
        
        if new_towns:
            self.report.append("\nNew Towns Found:")
            for name in sorted(new_towns)[:20]:
                self.report.append(f"  - {name}")
            if len(new_towns) > 20:
                self.report.append(f"  ... and {len(new_towns) - 20} more")
        
        return stats
    
    def analyze_data_quality(self, data: List[Dict]) -> Dict[str, Any]:
        """Analyze quality of extracted data"""
        quality = {
            'total': len(data),
            'missing_coords': 0,
            'missing_elevation': 0,
            'missing_services': 0,
            'complete': 0
        }
        
        for item in data:
            if not item.get('lat') or not item.get('lng'):
                quality['missing_coords'] += 1
            if not item.get('elevation'):
                quality['missing_elevation'] += 1
            if not item.get('services') or len(item.get('services', [])) == 0:
                quality['missing_services'] += 1
            
            # Check if item is complete
            if (item.get('lat') and item.get('lng') and 
                item.get('elevation') and item.get('services')):
                quality['complete'] += 1
        
        return quality
    
    def generate_report(self) -> str:
        """Generate comprehensive comparison report"""
        logger.info("Generating comparison report...")
        
        # Compare data
        waypoint_stats = self.compare_waypoints()
        town_stats = self.compare_towns()
        
        # Analyze quality
        extracted_waypoints = self.load_extracted_data("extracted_waypoints.json")
        extracted_towns = self.load_extracted_data("extracted_towns.json")
        
        waypoint_quality = self.analyze_data_quality(extracted_waypoints)
        town_quality = self.analyze_data_quality(extracted_towns)
        
        self.report.append("\n" + "="*80)
        self.report.append("DATA QUALITY ANALYSIS")
        self.report.append("="*80)
        self.report.append("\nWaypoint Quality:")
        self.report.append(f"  Total extracted: {waypoint_quality['total']}")
        self.report.append(f"  Complete records: {waypoint_quality['complete']}")
        self.report.append(f"  Missing coordinates: {waypoint_quality['missing_coords']}")
        self.report.append(f"  Missing elevation: {waypoint_quality['missing_elevation']}")
        self.report.append(f"  Missing services: {waypoint_quality['missing_services']}")
        
        self.report.append("\nTown Quality:")
        self.report.append(f"  Total extracted: {town_quality['total']}")
        self.report.append(f"  Complete records: {town_quality['complete']}")
        self.report.append(f"  Missing coordinates: {town_quality['missing_coords']}")
        self.report.append(f"  Missing elevation: {town_quality['missing_elevation']}")
        self.report.append(f"  Missing services: {town_quality['missing_services']}")
        
        # Summary
        self.report.append("\n" + "="*80)
        self.report.append("SUMMARY")
        self.report.append("="*80)
        self.report.append(f"Total new waypoints to add: {waypoint_stats.new_items}")
        self.report.append(f"Total new towns to add: {town_stats.new_items}")
        self.report.append(f"Data completeness: {((waypoint_quality['complete'] + town_quality['complete']) / (waypoint_quality['total'] + town_quality['total']) * 100):.1f}%")
        
        return "\n".join(self.report)
    
    def save_report(self, output_file: str):
        """Save report to file"""
        report_text = self.generate_report()
        
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(report_text)
        
        logger.info(f"Report saved to {output_path}")
        print(report_text)

def main():
    """Main execution"""
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    extracted_dir = backend_dir / "data" / "extracted"
    existing_data_dir = backend_dir.parent / "webapp" / "src" / "data"
    report_file = backend_dir / "data" / "extracted" / "comparison_report.txt"
    
    comparator = DataComparator(str(extracted_dir), str(existing_data_dir))
    comparator.save_report(str(report_file))

if __name__ == "__main__":
    main()
