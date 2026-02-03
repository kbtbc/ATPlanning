#!/usr/bin/env python3
"""
Merge calibrated JSON data into TypeScript files
Creates backups for easy rollback
"""

import json
import shutil
from pathlib import Path
from typing import Dict, List, Set
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TypeScriptMerger:
    """Merge JSON data into TypeScript files with backup"""
    
    def __init__(self, extracted_dir: str, webapp_data_dir: str):
        self.extracted_dir = Path(extracted_dir)
        self.webapp_data_dir = Path(webapp_data_dir)
        self.backup_dir = self.webapp_data_dir / ".backup"
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
    def create_backups(self):
        """Create backups of existing TypeScript files"""
        logger.info("Creating backups of existing data files...")
        
        self.backup_dir.mkdir(exist_ok=True)
        backup_subdir = self.backup_dir / self.timestamp
        backup_subdir.mkdir(exist_ok=True)
        
        files_to_backup = ['shelters.ts', 'features.ts', 'resupply.ts']
        
        for filename in files_to_backup:
            source = self.webapp_data_dir / filename
            if source.exists():
                dest = backup_subdir / filename
                shutil.copy2(source, dest)
                logger.info(f"Backed up {filename} to {dest}")
        
        # Create rollback script
        rollback_script = self.backup_dir / "ROLLBACK.md"
        with open(rollback_script, 'w', encoding='utf-8') as f:
            f.write(f"""# Rollback Instructions

## To Restore Original Data

Run this command from the project root:

```bash
# Restore from backup {self.timestamp}
cp webapp/src/data/.backup/{self.timestamp}/*.ts webapp/src/data/

# Or use the restore script
cd backend/scripts
python restore_backup.py {self.timestamp}
```

## Backups Available

Latest backup: {self.timestamp}

Files backed up:
- shelters.ts
- features.ts  
- resupply.ts

Location: `webapp/src/data/.backup/{self.timestamp}/`
""")
        
        logger.info(f"Backup complete. Rollback instructions: {rollback_script}")
        return backup_subdir
    
    def load_calibrated_data(self) -> Dict:
        """Load calibrated JSON data"""
        logger.info("Loading calibrated data...")
        
        waypoints_file = self.extracted_dir / "calibrated_waypoints.json"
        towns_file = self.extracted_dir / "calibrated_towns.json"
        
        with open(waypoints_file, 'r', encoding='utf-8') as f:
            waypoints = json.load(f)
        
        with open(towns_file, 'r', encoding='utf-8') as f:
            towns = json.load(f)
        
        logger.info(f"Loaded {len(waypoints)} waypoints and {len(towns)} towns")
        
        return {
            'waypoints': waypoints,
            'towns': towns
        }
    
    def generate_shelter_typescript(self, waypoints: List[Dict]) -> str:
        """Generate TypeScript code for shelters"""
        shelters = [wp for wp in waypoints if wp.get('type') == 'shelter']
        
        lines = [
            "import type { Shelter } from '../types';",
            "",
            "// Trail constants",
            "export const TRAIL_LENGTH = 2197.4;",
            "",
            "export const STATE_BOUNDARIES = {",
            "  GA: { start: 0, end: 78.5 },",
            "  NC: { start: 78.5, end: 166.2 },",
            "  TN: { start: 166.2, end: 444.8 },",
            "  VA: { start: 444.8, end: 1033.0 },",
            "  WV: { start: 1000.7, end: 1026.0 },",
            "  MD: { start: 1026.0, end: 1070.0 },",
            "  PA: { start: 1070.0, end: 1298.0 },",
            "  NJ: { start: 1298.0, end: 1378.1 },",
            "  NY: { start: 1378.1, end: 1472.9 },",
            "  CT: { start: 1472.9, end: 1508.0 },",
            "  MA: { start: 1508.0, end: 1599.0 },",
            "  VT: { start: 1599.0, end: 1755.0 },",
            "  NH: { start: 1755.0, end: 1898.0 },",
            "  ME: { start: 1898.0, end: 2197.4 },",
            "};",
            "",
            "export const shelters: Shelter[] = ["
        ]
        
        for shelter in shelters:
            lines.append("  {")
            lines.append(f"    id: '{self._generate_id(shelter['name'])}',")
            lines.append(f"    name: '{self._escape_string(shelter['name'])}',")
            lines.append(f"    mile: {shelter['mile']},")
            lines.append(f"    soboMile: {shelter['soboMile']},")
            lines.append(f"    elevation: {shelter['elevation']},")
            lines.append(f"    lat: {shelter['lat']},")
            lines.append(f"    lng: {shelter['lng']},")
            lines.append(f"    state: '{shelter['state']}',")
            lines.append(f"    type: 'shelter',")
            
            if shelter.get('hasWater'):
                lines.append(f"    hasWater: true,")
                if shelter.get('waterDistance'):
                    lines.append(f"    waterDistance: {shelter['waterDistance']},")
            
            if shelter.get('hasPrivy'):
                lines.append(f"    hasPrivy: true,")
            
            if shelter.get('isTenting'):
                lines.append(f"    isTenting: true,")
            
            if shelter.get('capacity'):
                lines.append(f"    capacity: {shelter['capacity']},")
            
            if shelter.get('services'):
                services_str = ", ".join([f"'{s}'" for s in shelter['services']])
                lines.append(f"    services: [{services_str}],")
            
            lines.append("  },")
        
        lines.append("];")
        
        return "\n".join(lines)
    
    def generate_resupply_typescript(self, towns: List[Dict]) -> str:
        """Generate TypeScript code for resupply points"""
        lines = [
            "import type { ResupplyPoint } from '../types';",
            "",
            "export const resupplyPoints: ResupplyPoint[] = ["
        ]
        
        for town in towns:
            lines.append("  {")
            lines.append(f"    id: '{self._generate_id(town['name'])}',")
            lines.append(f"    name: '{self._escape_string(town['name'])}',")
            lines.append(f"    mile: {town['mile']},")
            lines.append(f"    soboMile: {town['soboMile']},")
            lines.append(f"    elevation: {town['elevation']},")
            lines.append(f"    lat: {town['lat']},")
            lines.append(f"    lng: {town['lng']},")
            lines.append(f"    state: '{town['state']}',")
            lines.append(f"    type: 'town',")
            lines.append(f"    hasGrocery: {str(town.get('hasGrocery', False)).lower()},")
            lines.append(f"    hasOutfitter: {str(town.get('hasOutfitter', False)).lower()},")
            lines.append(f"    hasPostOffice: {str(town.get('hasPostOffice', False)).lower()},")
            lines.append(f"    hasLodging: {str(town.get('hasLodging', False)).lower()},")
            lines.append(f"    hasRestaurant: {str(town.get('hasRestaurant', False)).lower()},")
            lines.append(f"    hasLaundry: {str(town.get('hasLaundry', False)).lower()},")
            lines.append(f"    hasShower: {str(town.get('hasShower', False)).lower()},")
            lines.append(f"    resupplyQuality: '{town.get('resupplyQuality', 'limited')}',")
            lines.append(f"    distanceFromTrail: {town.get('distanceFromTrail', 0)},")
            
            if town.get('services'):
                services_str = ", ".join([f"'{s}'" for s in town['services']])
                lines.append(f"    services: [{services_str}],")
            
            lines.append("  },")
        
        lines.append("];")
        
        return "\n".join(lines)
    
    def _generate_id(self, name: str) -> str:
        """Generate ID from name"""
        return name.lower().replace(' ', '-').replace(',', '').replace("'", '')
    
    def _escape_string(self, s: str) -> str:
        """Escape string for TypeScript"""
        return s.replace("'", "\\'").replace('"', '\\"')
    
    def merge_data(self):
        """Perform the merge"""
        logger.info("Starting data merge...")
        
        # Create backups
        backup_dir = self.create_backups()
        
        # Load calibrated data
        data = self.load_calibrated_data()
        
        # Generate new TypeScript files
        logger.info("Generating new TypeScript files...")
        
        shelters_ts = self.generate_shelter_typescript(data['waypoints'])
        shelters_file = self.webapp_data_dir / "shelters.ts"
        with open(shelters_file, 'w', encoding='utf-8') as f:
            f.write(shelters_ts)
        logger.info(f"Generated {shelters_file}")
        
        resupply_ts = self.generate_resupply_typescript(data['towns'])
        resupply_file = self.webapp_data_dir / "resupply.ts"
        with open(resupply_file, 'w', encoding='utf-8') as f:
            f.write(resupply_ts)
        logger.info(f"Generated {resupply_file}")
        
        # Generate merge report
        report = self._generate_merge_report(data, backup_dir)
        report_file = self.extracted_dir / "merge_report.txt"
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        
        logger.info(f"Merge report saved to {report_file}")
        print(report)
    
    def _generate_merge_report(self, data: Dict, backup_dir: Path) -> str:
        """Generate merge report"""
        report = [
            "="*80,
            "DATA MERGE REPORT",
            "="*80,
            "",
            f"Merge completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "",
            "Files Updated:",
            f"  - webapp/src/data/shelters.ts ({len([w for w in data['waypoints'] if w.get('type') == 'shelter'])} shelters)",
            f"  - webapp/src/data/resupply.ts ({len(data['towns'])} towns)",
            "",
            "Backup Location:",
            f"  {backup_dir}",
            "",
            "="*80,
            "ROLLBACK INSTRUCTIONS",
            "="*80,
            "",
            "If you need to restore the original data:",
            "",
            "Option 1 - Manual restore:",
            f"  cp {backup_dir}/*.ts webapp/src/data/",
            "",
            "Option 2 - Use restore script:",
            f"  cd backend/scripts",
            f"  python restore_backup.py {self.timestamp}",
            "",
            "="*80,
            "NEXT STEPS",
            "="*80,
            "",
            "1. Deploy the application locally:",
            "   cd webapp",
            "   npm install",
            "   npm run dev",
            "",
            "2. Test the application:",
            "   - Open http://localhost:5173",
            "   - Check map displays waypoints",
            "   - Verify filter functionality",
            "   - Test waypoint details",
            "",
            "3. If issues found:",
            "   - Run rollback command above",
            "   - Report issues for investigation",
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
    
    merger = TypeScriptMerger(str(extracted_dir), str(webapp_data_dir))
    merger.merge_data()
    
    logger.info("Merge complete! Ready to deploy.")

if __name__ == "__main__":
    main()
