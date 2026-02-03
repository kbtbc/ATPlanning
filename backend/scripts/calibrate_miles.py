#!/usr/bin/env python3
"""
Calibrate mile markers using existing known waypoints as reference points
Uses interpolation between known waypoints for accurate trail miles
"""

import json
import re
import math
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MileCalibrator:
    """Calibrate mile markers using known reference waypoints"""
    
    def __init__(self, webapp_data_dir: str):
        self.webapp_data_dir = Path(webapp_data_dir)
        self.reference_waypoints = []
        self.TRAIL_LENGTH = 2197.4
        
    def load_reference_waypoints(self):
        """Load known waypoints from existing TypeScript files"""
        logger.info("Loading reference waypoints from existing data...")
        
        # Parse shelters.ts
        shelters_file = self.webapp_data_dir / "shelters.ts"
        if shelters_file.exists():
            content = shelters_file.read_text()
            self._parse_typescript_waypoints(content)
        
        # Parse features.ts
        features_file = self.webapp_data_dir / "features.ts"
        if features_file.exists():
            content = features_file.read_text()
            self._parse_typescript_waypoints(content)
        
        # Parse resupply.ts
        resupply_file = self.webapp_data_dir / "resupply.ts"
        if resupply_file.exists():
            content = resupply_file.read_text()
            self._parse_typescript_waypoints(content)
        
        # Sort by mile marker
        self.reference_waypoints.sort(key=lambda x: x['mile'])
        
        logger.info(f"Loaded {len(self.reference_waypoints)} reference waypoints")
    
    def _parse_typescript_waypoints(self, content: str):
        """Parse waypoints from TypeScript file"""
        objects = re.finditer(r'\{([^}]+)\}', content, re.DOTALL)
        
        for obj_match in objects:
            obj_text = obj_match.group(1)
            
            # Extract fields
            name_match = re.search(r'name:\s*["\']([^"\']+)["\']', obj_text)
            mile_match = re.search(r'mile:\s*(\d+\.?\d*)', obj_text)
            lat_match = re.search(r'lat:\s*(-?\d+\.?\d*)', obj_text)
            lng_match = re.search(r'lng:\s*(-?\d+\.?\d*)', obj_text)
            
            if name_match and mile_match and lat_match and lng_match:
                self.reference_waypoints.append({
                    'name': name_match.group(1),
                    'mile': float(mile_match.group(1)),
                    'lat': float(lat_match.group(1)),
                    'lng': float(lng_match.group(1))
                })
    
    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two GPS points in miles"""
        R = 3959.0  # Earth radius in miles
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        dLat = math.radians(lat2 - lat1)
        dLon = math.radians(lon2 - lon1)
        
        a = (math.sin(dLat/2) * math.sin(dLat/2) +
             math.cos(lat1_rad) * math.cos(lat2_rad) *
             math.sin(dLon/2) * math.sin(dLon/2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c
    
    def find_calibrated_mile(self, lat: float, lon: float) -> Tuple[float, str]:
        """Find mile marker using interpolation between known waypoints"""
        if not self.reference_waypoints:
            return 0.0, 'UNKNOWN'
        
        # Find closest reference waypoint
        min_distance = float('inf')
        closest_ref = None
        
        for ref in self.reference_waypoints:
            distance = self._haversine_distance(lat, lon, ref['lat'], ref['lng'])
            if distance < min_distance:
                min_distance = distance
                closest_ref = ref
        
        # If very close to a reference point, use its mile marker
        if min_distance < 0.1:  # Within 0.1 miles
            mile = closest_ref['mile']
            state = self._determine_state(mile)
            return mile, state
        
        # Find two nearest reference points (one before, one after)
        before_ref = None
        after_ref = None
        
        for i, ref in enumerate(self.reference_waypoints):
            ref_distance = self._haversine_distance(lat, lon, ref['lat'], ref['lng'])
            
            # Check if this waypoint is roughly on the trail path
            if ref_distance < 5.0:  # Within 5 miles
                # Determine if before or after based on GPS position
                if before_ref is None or ref['mile'] < closest_ref['mile']:
                    before_ref = ref
                if after_ref is None or (ref['mile'] > closest_ref['mile'] and ref['mile'] < after_ref.get('mile', float('inf'))):
                    after_ref = ref
        
        # Interpolate between reference points
        if before_ref and after_ref:
            # Calculate ratio based on GPS distance
            dist_to_before = self._haversine_distance(lat, lon, before_ref['lat'], before_ref['lng'])
            dist_to_after = self._haversine_distance(lat, lon, after_ref['lat'], after_ref['lng'])
            
            total_dist = dist_to_before + dist_to_after
            if total_dist > 0:
                ratio = dist_to_before / total_dist
                mile = before_ref['mile'] + ratio * (after_ref['mile'] - before_ref['mile'])
            else:
                mile = closest_ref['mile']
        else:
            # Use closest reference point
            mile = closest_ref['mile']
        
        state = self._determine_state(mile)
        return round(mile, 1), state
    
    def _determine_state(self, mile: float) -> str:
        """Determine state from mile marker"""
        boundaries = [
            ('GA', 0, 78.5),
            ('NC', 78.5, 166.2),
            ('TN', 166.2, 444.8),
            ('VA', 444.8, 1033.0),
            ('WV', 1000.7, 1026.0),
            ('MD', 1026.0, 1070.0),
            ('PA', 1070.0, 1298.0),
            ('NJ', 1298.0, 1378.1),
            ('NY', 1378.1, 1472.9),
            ('CT', 1472.9, 1508.0),
            ('MA', 1508.0, 1599.0),
            ('VT', 1599.0, 1755.0),
            ('NH', 1755.0, 1898.0),
            ('ME', 1898.0, 2197.4),
        ]
        
        for state, start, end in boundaries:
            if start <= mile <= end:
                return state
        
        return 'UNKNOWN'
    
    def calibrate_waypoints(self, waypoints: List[Dict]) -> List[Dict]:
        """Calibrate mile markers for all waypoints"""
        logger.info(f"Calibrating mile markers for {len(waypoints)} waypoints...")
        
        calibrated_count = 0
        
        for waypoint in waypoints:
            lat = waypoint.get('lat')
            lon = waypoint.get('lng')
            
            if lat and lon:
                mile, state = self.find_calibrated_mile(lat, lon)
                
                # Only update if we got a reasonable mile marker
                if mile > 0:
                    waypoint['mile'] = mile
                    waypoint['soboMile'] = round(self.TRAIL_LENGTH - mile, 1)
                    waypoint['state'] = state
                    calibrated_count += 1
        
        logger.info(f"Calibrated {calibrated_count} waypoint mile markers")
        return waypoints
    
    def calibrate_towns(self, towns: List[Dict]) -> List[Dict]:
        """Calibrate mile markers for all towns"""
        logger.info(f"Calibrating mile markers for {len(towns)} towns...")
        
        calibrated_count = 0
        
        for town in towns:
            lat = town.get('lat')
            lon = town.get('lng')
            
            if lat and lon:
                mile, state = self.find_calibrated_mile(lat, lon)
                
                if mile > 0:
                    town['mile'] = mile
                    town['soboMile'] = round(self.TRAIL_LENGTH - mile, 1)
                    town['state'] = state
                    calibrated_count += 1
        
        logger.info(f"Calibrated {calibrated_count} town mile markers")
        return towns

def main():
    """Main execution"""
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    extracted_dir = backend_dir / "data" / "extracted"
    webapp_data_dir = backend_dir.parent / "webapp" / "src" / "data"
    
    # Initialize calibrator
    calibrator = MileCalibrator(str(webapp_data_dir))
    calibrator.load_reference_waypoints()
    
    # Calibrate waypoints
    waypoints_file = extracted_dir / "comprehensive_waypoints.json"
    if waypoints_file.exists():
        with open(waypoints_file, 'r', encoding='utf-8') as f:
            waypoints = json.load(f)
        
        waypoints = calibrator.calibrate_waypoints(waypoints)
        
        # Save calibrated waypoints
        output_file = extracted_dir / "calibrated_waypoints.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(waypoints, f, indent=2)
        
        logger.info(f"Saved calibrated waypoints to {output_file}")
    
    # Calibrate towns
    towns_file = extracted_dir / "comprehensive_towns.json"
    if towns_file.exists():
        with open(towns_file, 'r', encoding='utf-8') as f:
            towns = json.load(f)
        
        towns = calibrator.calibrate_towns(towns)
        
        # Save calibrated towns
        output_file = extracted_dir / "calibrated_towns.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(towns, f, indent=2)
        
        logger.info(f"Saved calibrated towns to {output_file}")
    
    # Generate statistics
    stats = {
        'waypoints': {
            'total': len(waypoints),
            'with_valid_miles': sum(1 for wp in waypoints if wp.get('mile', 0) > 0),
            'by_state': {}
        },
        'towns': {
            'total': len(towns),
            'with_valid_miles': sum(1 for t in towns if t.get('mile', 0) > 0),
            'by_state': {}
        }
    }
    
    for wp in waypoints:
        state = wp.get('state', 'UNKNOWN')
        stats['waypoints']['by_state'][state] = stats['waypoints']['by_state'].get(state, 0) + 1
    
    for town in towns:
        state = town.get('state', 'UNKNOWN')
        stats['towns']['by_state'][state] = stats['towns']['by_state'].get(state, 0) + 1
    
    stats_file = extracted_dir / "calibrated_stats.json"
    with open(stats_file, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2)
    
    logger.info(f"Saved statistics to {stats_file}")
    logger.info(f"Waypoints with valid miles: {stats['waypoints']['with_valid_miles']}/{stats['waypoints']['total']}")
    logger.info(f"Towns with valid miles: {stats['towns']['with_valid_miles']}/{stats['towns']['total']}")

if __name__ == "__main__":
    main()
