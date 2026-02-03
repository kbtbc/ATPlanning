#!/usr/bin/env python3
"""
Enhanced AT Planning PDF Data Extractor
Focuses on detailed parsing of waypoint descriptions, amenities, and town data
"""

import re
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict, field
import xml.etree.ElementTree as ET

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class EnhancedWaypoint:
    """Enhanced waypoint with full amenity details"""
    id: str
    name: str
    mile: float
    soboMile: float
    elevation: int
    lat: float
    lng: float
    state: str
    county: Optional[str] = None
    type: str = 'waypoint'
    services: List[str] = field(default_factory=list)
    notes: Optional[str] = None
    distanceFromTrail: float = 0.0
    
    # Shelter specific
    capacity: Optional[int] = None
    hasWater: Optional[bool] = None
    waterDistance: Optional[float] = None
    waterNotes: Optional[str] = None
    hasPrivy: Optional[bool] = None
    isTenting: Optional[bool] = None
    tentPlatforms: Optional[int] = None
    fee: Optional[float] = None
    
    # Additional amenities
    hasBearBox: Optional[bool] = None
    hasCellSignal: Optional[bool] = None
    hasViews: Optional[bool] = None
    
    # Directions to next shelters
    nextShelterNorth: Optional[float] = None
    nextShelterSouth: Optional[float] = None

class EnhancedExtractor:
    """Enhanced extraction with better parsing"""
    
    def __init__(self, pdf_path: str, data_dir: str, gpx_path: str):
        self.pdf_path = Path(pdf_path)
        self.data_dir = Path(data_dir)
        self.gpx_path = Path(gpx_path)
        self.waypoints: List[EnhancedWaypoint] = []
        self.gpx_data = {}
        self.TRAIL_LENGTH = 2197.4
        
    def load_gpx_data(self):
        """Load GPX file for coordinate and elevation reference"""
        logger.info(f"Loading GPX data from {self.gpx_path}")
        
        try:
            tree = ET.parse(self.gpx_path)
            root = tree.getroot()
            
            # Define namespace
            ns = {'gpx': 'http://www.topografix.com/GPX/1/1'}
            
            # Extract waypoints
            for wpt in root.findall('.//gpx:wpt', ns):
                lat = float(wpt.get('lat'))
                lon = float(wpt.get('lon'))
                
                name_elem = wpt.find('gpx:name', ns)
                ele_elem = wpt.find('gpx:ele', ns)
                
                name = name_elem.text if name_elem is not None else None
                elevation = float(ele_elem.text) if ele_elem is not None else None
                
                if name:
                    self.gpx_data[name.lower()] = {
                        'lat': lat,
                        'lon': lon,
                        'elevation': elevation
                    }
            
            # Extract track points for elevation profile
            track_points = []
            for trkpt in root.findall('.//gpx:trkpt', ns):
                lat = float(trkpt.get('lat'))
                lon = float(trkpt.get('lon'))
                ele_elem = trkpt.find('gpx:ele', ns)
                elevation = float(ele_elem.text) if ele_elem is not None else None
                
                track_points.append({
                    'lat': lat,
                    'lon': lon,
                    'elevation': elevation
                })
            
            logger.info(f"Loaded {len(self.gpx_data)} waypoints and {len(track_points)} track points from GPX")
            
        except Exception as e:
            logger.error(f"Error loading GPX: {e}")
    
    def find_closest_gpx_point(self, target_lat: float, target_lon: float) -> Optional[Dict]:
        """Find closest GPX point to given coordinates"""
        min_distance = float('inf')
        closest = None
        
        for name, data in self.gpx_data.items():
            # Simple distance calculation
            dist = ((data['lat'] - target_lat) ** 2 + (data['lon'] - target_lon) ** 2) ** 0.5
            if dist < min_distance:
                min_distance = dist
                closest = data
        
        return closest if min_distance < 0.01 else None  # Within ~1km
    
    def parse_shelter_description(self, text: str) -> Dict[str, Any]:
        """Parse detailed shelter description for amenities"""
        amenities = {
            'hasWater': False,
            'waterDistance': None,
            'waterNotes': None,
            'hasPrivy': False,
            'isTenting': False,
            'tentPlatforms': None,
            'hasBearBox': False,
            'capacity': None,
            'services': []
        }
        
        text_lower = text.lower()
        
        # Water detection
        if 'water' in text_lower:
            amenities['hasWater'] = True
            amenities['services'].append('water')
            
            # Water distance
            water_dist_match = re.search(r'water.*?(\d+)\s*(yards|feet|ft)', text_lower)
            if water_dist_match:
                distance = int(water_dist_match.group(1))
                unit = water_dist_match.group(2)
                if 'yard' in unit:
                    amenities['waterDistance'] = distance / 1760  # yards to miles
                else:
                    amenities['waterDistance'] = distance / 5280  # feet to miles
            
            # Water reliability
            if 'spring' in text_lower:
                amenities['waterNotes'] = 'Spring'
            elif 'creek' in text_lower or 'stream' in text_lower:
                amenities['waterNotes'] = 'Creek/Stream'
            elif 'dry' in text_lower or 'unreliable' in text_lower:
                amenities['waterNotes'] = 'Unreliable'
        
        # Privy detection
        if 'privy' in text_lower:
            amenities['hasPrivy'] = True
            amenities['services'].append('privy')
        
        # Tent sites
        if any(word in text_lower for word in ['tent', 'tenting', 'camping']):
            amenities['isTenting'] = True
            amenities['services'].append('tent_site')
            
            # Tent platforms
            platform_match = re.search(r'(\d+)\s*tent\s*(?:platforms?|pads?)', text_lower)
            if platform_match:
                amenities['tentPlatforms'] = int(platform_match.group(1))
        
        # Bear protection
        if any(word in text_lower for word in ['bear box', 'bear cable', 'bear bag']):
            amenities['hasBearBox'] = True
            amenities['services'].append('bear_protection')
        
        # Capacity
        capacity_match = re.search(r'\{(\d+)\}', text)
        if capacity_match:
            amenities['capacity'] = int(capacity_match.group(1))
        
        return amenities
    
    def parse_direction_arrows(self, text: str) -> Tuple[Optional[float], Optional[float]]:
        """Parse direction arrows for next shelter distances"""
        # Pattern: 2.6 > 7.9 >> 15.5 (south to north)
        # < means south, > means north
        
        south_match = re.search(r'(\d+\.\d+)\s*<+', text)
        north_match = re.search(r'>+\s*(\d+\.\d+)', text)
        
        next_south = float(south_match.group(1)) if south_match else None
        next_north = float(north_match.group(1)) if north_match else None
        
        return next_south, next_north
    
    def extract_detailed_waypoints(self):
        """Extract waypoints with detailed parsing"""
        logger.info("Starting detailed waypoint extraction...")
        
        try:
            import fitz
            
            doc = fitz.open(self.pdf_path)
            logger.info(f"Processing {doc.page_count} pages")
            
            for page_num in range(doc.page_count):
                page = doc[page_num]
                text = page.get_text()
                
                # Look for shelter entries
                lines = text.split('\n')
                
                for i, line in enumerate(lines):
                    # Shelter pattern
                    if 'Shelter' in line and not line.startswith('Next'):
                        context = '\n'.join(lines[max(0, i-2):min(len(lines), i+10)])
                        waypoint = self._parse_detailed_waypoint(line, context)
                        
                        if waypoint:
                            self.waypoints.append(waypoint)
            
            doc.close()
            logger.info(f"Extracted {len(self.waypoints)} detailed waypoints")
            
        except Exception as e:
            logger.error(f"Extraction error: {e}")
    
    def _parse_detailed_waypoint(self, line: str, context: str) -> Optional[EnhancedWaypoint]:
        """Parse a single waypoint with full details"""
        try:
            # Extract name
            name_match = re.search(r'([A-Z][A-Za-z\s]+Shelter)', line)
            if not name_match:
                return None
            
            name = name_match.group(1).strip()
            
            # Extract GPS coordinates
            coords_match = re.search(r'\[(-?\d+\.\d+),\s*(-?\d+\.\d+)\]', context)
            if not coords_match:
                return None
            
            lat = float(coords_match.group(1))
            lng = float(coords_match.group(2))
            
            # Extract mile marker (look for pattern like "15.7" at start of line)
            mile_match = re.search(r'^(\d+\.\d+)', line)
            mile = float(mile_match.group(1)) if mile_match else 0.0
            
            # Extract elevation (look for 4-digit numbers)
            elev_match = re.search(r'\s(\d{3,5})\s', context)
            elevation = int(elev_match.group(1)) if elev_match else 0
            
            # Determine state
            state = self._determine_state_from_mile(mile)
            
            # Parse amenities
            amenities = self.parse_shelter_description(context)
            
            # Parse direction arrows
            next_south, next_north = self.parse_direction_arrows(line)
            
            # Try to enhance with GPX data
            gpx_point = self.find_closest_gpx_point(lat, lng)
            if gpx_point and gpx_point.get('elevation'):
                elevation = int(gpx_point['elevation'] * 3.28084)  # meters to feet
            
            waypoint = EnhancedWaypoint(
                id=f"wp-enhanced-{len(self.waypoints)+1:04d}",
                name=name,
                mile=mile,
                soboMile=self.TRAIL_LENGTH - mile,
                elevation=elevation,
                lat=lat,
                lng=lng,
                state=state,
                type='shelter',
                services=amenities['services'],
                capacity=amenities['capacity'],
                hasWater=amenities['hasWater'],
                waterDistance=amenities['waterDistance'],
                waterNotes=amenities['waterNotes'],
                hasPrivy=amenities['hasPrivy'],
                isTenting=amenities['isTenting'],
                tentPlatforms=amenities['tentPlatforms'],
                hasBearBox=amenities['hasBearBox'],
                nextShelterNorth=next_north,
                nextShelterSouth=next_south,
                notes=None
            )
            
            return waypoint
            
        except Exception as e:
            logger.debug(f"Error parsing waypoint: {e}")
            return None
    
    def _determine_state_from_mile(self, mile: float) -> str:
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
    
    def save_enhanced_data(self, output_dir: str):
        """Save enhanced waypoint data"""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Save waypoints
        waypoints_file = output_path / "enhanced_waypoints.json"
        with open(waypoints_file, 'w', encoding='utf-8') as f:
            json.dump([asdict(wp) for wp in self.waypoints], f, indent=2)
        
        logger.info(f"Saved {len(self.waypoints)} enhanced waypoints to {waypoints_file}")
        
        # Generate statistics
        stats = self._generate_statistics()
        stats_file = output_path / "extraction_stats.json"
        with open(stats_file, 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2)
        
        logger.info(f"Saved statistics to {stats_file}")
    
    def _generate_statistics(self) -> Dict[str, Any]:
        """Generate extraction statistics"""
        total = len(self.waypoints)
        
        stats = {
            'total_waypoints': total,
            'with_water': sum(1 for wp in self.waypoints if wp.hasWater),
            'with_privy': sum(1 for wp in self.waypoints if wp.hasPrivy),
            'with_tenting': sum(1 for wp in self.waypoints if wp.isTenting),
            'with_bear_protection': sum(1 for wp in self.waypoints if wp.hasBearBox),
            'with_capacity': sum(1 for wp in self.waypoints if wp.capacity),
            'by_state': {}
        }
        
        # Count by state
        for wp in self.waypoints:
            state = wp.state
            stats['by_state'][state] = stats['by_state'].get(state, 0) + 1
        
        return stats

def main():
    """Main execution"""
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    data_dir = backend_dir / "data"
    pdf_path = data_dir / "WBP interactive PDF-V5E.pdf"
    gpx_path = data_dir / "appalachian-trail.gpx"
    output_dir = data_dir / "extracted"
    
    if not pdf_path.exists():
        logger.error(f"PDF not found: {pdf_path}")
        return
    
    extractor = EnhancedExtractor(str(pdf_path), str(data_dir), str(gpx_path))
    
    # Load GPX reference data
    extractor.load_gpx_data()
    
    # Extract with enhanced parsing
    extractor.extract_detailed_waypoints()
    
    # Save results
    extractor.save_enhanced_data(str(output_dir))
    
    logger.info("Enhanced extraction complete!")

if __name__ == "__main__":
    main()
