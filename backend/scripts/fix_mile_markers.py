#!/usr/bin/env python3
"""
Fix mile markers using GPS coordinates and GPX track data
Calculates cumulative distance along the trail from GPS coordinates
"""

import json
import math
from pathlib import Path
from typing import List, Dict, Tuple
import xml.etree.ElementTree as ET
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MileMarkerFixer:
    """Fix mile markers using GPS distance calculations"""
    
    def __init__(self, gpx_path: str):
        self.gpx_path = Path(gpx_path)
        self.track_points = []
        self.cumulative_miles = []
        self.TRAIL_LENGTH = 2197.4
        
    def load_gpx_track(self):
        """Load GPX track points with cumulative mileage"""
        logger.info(f"Loading GPX track from {self.gpx_path}")
        
        try:
            tree = ET.parse(self.gpx_path)
            root = tree.getroot()
            
            ns = {'gpx': 'http://www.topografix.com/GPX/1/1'}
            
            # Extract track points
            for trkpt in root.findall('.//gpx:trkpt', ns):
                lat = float(trkpt.get('lat'))
                lon = float(trkpt.get('lon'))
                
                ele_elem = trkpt.find('gpx:ele', ns)
                elevation = float(ele_elem.text) if ele_elem is not None else None
                
                self.track_points.append({
                    'lat': lat,
                    'lon': lon,
                    'elevation': elevation
                })
            
            logger.info(f"Loaded {len(self.track_points)} track points")
            
            # Calculate cumulative mileage
            self._calculate_cumulative_miles()
            
        except Exception as e:
            logger.error(f"Error loading GPX: {e}")
    
    def _calculate_cumulative_miles(self):
        """Calculate cumulative mileage for each track point"""
        logger.info("Calculating cumulative mileage...")
        
        cumulative = 0.0
        self.cumulative_miles = [0.0]
        
        for i in range(1, len(self.track_points)):
            prev = self.track_points[i-1]
            curr = self.track_points[i]
            
            # Calculate distance between points
            distance = self._haversine_distance(
                prev['lat'], prev['lon'],
                curr['lat'], curr['lon']
            )
            
            cumulative += distance
            self.cumulative_miles.append(cumulative)
        
        logger.info(f"Total trail distance: {cumulative:.1f} miles")
    
    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two GPS points in miles"""
        # Earth radius in miles
        R = 3959.0
        
        # Convert to radians
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        dLat = math.radians(lat2 - lat1)
        dLon = math.radians(lon2 - lon1)
        
        # Haversine formula
        a = (math.sin(dLat/2) * math.sin(dLat/2) +
             math.cos(lat1_rad) * math.cos(lat2_rad) *
             math.sin(dLon/2) * math.sin(dLon/2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        distance = R * c
        
        return distance
    
    def find_mile_marker(self, lat: float, lon: float) -> float:
        """Find mile marker for given GPS coordinates by finding closest point on trail"""
        if not self.track_points:
            return 0.0
        
        # Find closest track point (perpendicular distance to trail)
        min_distance = float('inf')
        closest_idx = 0
        
        for i, point in enumerate(self.track_points):
            # Calculate perpendicular distance from waypoint to trail
            distance = self._haversine_distance(lat, lon, point['lat'], point['lon'])
            if distance < min_distance:
                min_distance = distance
                closest_idx = i
        
        # Only accept if waypoint is reasonably close to trail (within 0.5 miles)
        if min_distance > 0.5:
            logger.warning(f"Waypoint at ({lat}, {lon}) is {min_distance:.2f} miles from trail")
        
        # Return cumulative mileage at closest point on trail
        # This gives actual trail miles, not straight-line distance
        if closest_idx < len(self.cumulative_miles):
            return self.cumulative_miles[closest_idx]
        
        return 0.0
    
    def fix_waypoint_miles(self, waypoints: List[Dict]) -> List[Dict]:
        """Fix mile markers for all waypoints"""
        logger.info(f"Fixing mile markers for {len(waypoints)} waypoints...")
        
        fixed_count = 0
        
        for waypoint in waypoints:
            if waypoint.get('mile', 0) == 0.0:
                lat = waypoint.get('lat')
                lon = waypoint.get('lng')
                
                if lat and lon:
                    mile = self.find_mile_marker(lat, lon)
                    waypoint['mile'] = round(mile, 1)
                    waypoint['soboMile'] = round(self.TRAIL_LENGTH - mile, 1)
                    
                    # Update state based on mile marker
                    waypoint['state'] = self._determine_state(mile)
                    
                    fixed_count += 1
        
        logger.info(f"Fixed {fixed_count} waypoint mile markers")
        return waypoints
    
    def fix_town_miles(self, towns: List[Dict]) -> List[Dict]:
        """Fix mile markers for all towns"""
        logger.info(f"Fixing mile markers for {len(towns)} towns...")
        
        fixed_count = 0
        
        for town in towns:
            if town.get('mile', 0) == 0.0:
                lat = town.get('lat')
                lon = town.get('lng')
                
                if lat and lon:
                    mile = self.find_mile_marker(lat, lon)
                    town['mile'] = round(mile, 1)
                    town['soboMile'] = round(self.TRAIL_LENGTH - mile, 1)
                    
                    # Update state based on mile marker
                    town['state'] = self._determine_state(mile)
                    
                    fixed_count += 1
        
        logger.info(f"Fixed {fixed_count} town mile markers")
        return towns
    
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

def main():
    """Main execution"""
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    data_dir = backend_dir / "data"
    gpx_path = data_dir / "appalachian-trail.gpx"
    extracted_dir = data_dir / "extracted"
    
    # Initialize fixer
    fixer = MileMarkerFixer(str(gpx_path))
    fixer.load_gpx_track()
    
    # Fix waypoints
    waypoints_file = extracted_dir / "comprehensive_waypoints.json"
    if waypoints_file.exists():
        with open(waypoints_file, 'r', encoding='utf-8') as f:
            waypoints = json.load(f)
        
        waypoints = fixer.fix_waypoint_miles(waypoints)
        
        # Save fixed waypoints
        output_file = extracted_dir / "fixed_waypoints.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(waypoints, f, indent=2)
        
        logger.info(f"Saved fixed waypoints to {output_file}")
    
    # Fix towns
    towns_file = extracted_dir / "comprehensive_towns.json"
    if towns_file.exists():
        with open(towns_file, 'r', encoding='utf-8') as f:
            towns = json.load(f)
        
        towns = fixer.fix_town_miles(towns)
        
        # Save fixed towns
        output_file = extracted_dir / "fixed_towns.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(towns, f, indent=2)
        
        logger.info(f"Saved fixed towns to {output_file}")
    
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
    
    stats_file = extracted_dir / "fixed_stats.json"
    with open(stats_file, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2)
    
    logger.info(f"Saved statistics to {stats_file}")
    logger.info(f"Waypoints with valid miles: {stats['waypoints']['with_valid_miles']}/{stats['waypoints']['total']}")
    logger.info(f"Towns with valid miles: {stats['towns']['with_valid_miles']}/{stats['towns']['total']}")

if __name__ == "__main__":
    main()
