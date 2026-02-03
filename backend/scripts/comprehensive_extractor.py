#!/usr/bin/env python3
"""
Comprehensive AT Planning PDF Data Extractor
- Fixed mile marker parsing from vertical route listings
- Enhanced town/business extraction with full details
- Complete icon recognition implementation
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
class Business:
    """Business establishment details"""
    id: str
    name: str
    type: str
    phone: Optional[str] = None
    address: Optional[str] = None
    hours: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    googleMapsUrl: Optional[str] = None
    notes: Optional[str] = None
    pricing: Optional[str] = None
    services: List[str] = field(default_factory=list)
    amenities: List[str] = field(default_factory=list)

@dataclass
class TownData:
    """Complete town/resupply point data"""
    id: str
    name: str
    mile: float
    soboMile: float
    elevation: int
    lat: float
    lng: float
    state: str
    type: str = 'town'
    hasGrocery: bool = False
    hasOutfitter: bool = False
    hasPostOffice: bool = False
    hasLodging: bool = False
    hasRestaurant: bool = False
    hasLaundry: bool = False
    hasShower: bool = False
    hasATM: bool = False
    hasHospital: bool = False
    resupplyQuality: str = 'limited'
    distanceFromTrail: float = 0.0
    shuttleAvailable: Optional[bool] = None
    notes: Optional[str] = None
    services: List[str] = field(default_factory=list)
    businesses: List[Business] = field(default_factory=list)

@dataclass
class Waypoint:
    """Complete waypoint with all amenities"""
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
    hasPower: Optional[bool] = None
    hasShower: Optional[bool] = None
    
    # Navigation
    nextShelterNorth: Optional[float] = None
    nextShelterSouth: Optional[float] = None

class ComprehensiveExtractor:
    """Complete extraction with all improvements"""
    
    def __init__(self, pdf_path: str, data_dir: str, gpx_path: str):
        self.pdf_path = Path(pdf_path)
        self.data_dir = Path(data_dir)
        self.gpx_path = Path(gpx_path)
        self.waypoints: List[Waypoint] = []
        self.towns: List[TownData] = []
        self.gpx_data = {}
        self.icon_templates = {}
        self.TRAIL_LENGTH = 2197.4
        
        # Load icon mappings
        self.icon_mappings = self._create_icon_mappings()
        
    def _create_icon_mappings(self) -> Dict[str, List[str]]:
        """Map icon types to service names"""
        return {
            'water': ['water'],
            'spring': ['water', 'spring'],
            'shelter': ['shelter'],
            'tent': ['tent_site', 'camping'],
            'privy': ['privy', 'toilet'],
            'bear_box': ['bear_protection', 'bear_box'],
            'bear_cables': ['bear_protection', 'bear_cables'],
            'cell_signal': ['cell_signal'],
            'power': ['power', 'electricity'],
            'summit': ['summit', 'peak'],
            'views': ['views', 'scenic'],
            'lookout': ['lookout', 'tower'],
            'bridge': ['bridge'],
            'road': ['road_crossing'],
            'parking': ['parking', 'trailhead'],
            'hostel': ['hostel', 'lodging'],
            'hotel': ['lodging', 'hotel'],
            'post_office': ['post_office', 'mail'],
            'mail_drop': ['mail_drop'],
            'shuttle': ['shuttle'],
            'restaurant': ['restaurant', 'food'],
            'grocery': ['grocery', 'resupply'],
            'outfitter': ['outfitter', 'gear'],
            'laundry': ['laundry'],
            'shower': ['shower'],
            'wifi': ['wifi', 'internet'],
            'atm': ['atm', 'bank'],
            'pharmacy': ['pharmacy', 'medical'],
            'hospital': ['hospital', 'medical'],
        }
    
    def load_gpx_data(self):
        """Load GPX file for coordinate and elevation reference"""
        logger.info(f"Loading GPX data from {self.gpx_path}")
        
        try:
            tree = ET.parse(self.gpx_path)
            root = tree.getroot()
            
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
            
            logger.info(f"Loaded {len(self.gpx_data)} waypoints from GPX")
            
        except Exception as e:
            logger.error(f"Error loading GPX: {e}")
    
    def extract_mile_from_context(self, line: str, context: str, page_text: str) -> float:
        """Extract mile marker using multiple strategies"""
        
        # Strategy 1: Look for mile marker at start of line
        mile_match = re.search(r'^(\d+\.\d+)\s', line.strip())
        if mile_match:
            return float(mile_match.group(1))
        
        # Strategy 2: Look for mile marker before shelter name
        mile_match = re.search(r'(\d+\.\d+)\s+[A-Z]', line)
        if mile_match:
            return float(mile_match.group(1))
        
        # Strategy 3: Look in context lines
        context_lines = context.split('\n')
        for ctx_line in context_lines:
            # Pattern: "15.7 Shelter Name"
            mile_match = re.search(r'^(\d+\.\d+)\s+\w', ctx_line.strip())
            if mile_match:
                return float(mile_match.group(1))
        
        # Strategy 4: Look for "Mile XXX.X" pattern
        mile_match = re.search(r'[Mm]ile\s+(\d+\.\d+)', context)
        if mile_match:
            return float(mile_match.group(1))
        
        # Strategy 5: Extract from page header/footer
        header_match = re.search(r'Miles?\s+(\d+\.\d+)\s*-\s*(\d+\.\d+)', page_text[:500])
        if header_match:
            # Return midpoint of page range
            start = float(header_match.group(1))
            end = float(header_match.group(2))
            return (start + end) / 2
        
        return 0.0
    
    def parse_phone_number(self, text: str) -> Optional[str]:
        """Extract phone number from text"""
        # Pattern: (828) 524-4403 or 828-524-4403 or 828.524.4403
        patterns = [
            r'\((\d{3})\)\s*(\d{3})-(\d{4})',
            r'(\d{3})-(\d{3})-(\d{4})',
            r'(\d{3})\.(\d{3})\.(\d{4})',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                if len(match.groups()) == 3:
                    return f"({match.group(1)}) {match.group(2)}-{match.group(3)}"
        
        return None
    
    def parse_hours(self, text: str) -> Optional[str]:
        """Extract hours of operation"""
        # Pattern: M-F 9-5, Mon-Fri 9am-5pm, etc.
        patterns = [
            r'(M-F|Mon-Fri|Monday-Friday)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)',
            r'Open\s+(.*?)(?:\.|$)',
            r'Hours?:?\s+(.*?)(?:\.|$)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0).strip()
        
        return None
    
    def parse_address(self, text: str) -> Optional[str]:
        """Extract mailing address"""
        # Pattern: 123 Main Street, Town, ST 12345
        pattern = r'\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd),\s*[A-Z][a-z]+,\s*[A-Z]{2}\s+\d{5}'
        match = re.search(pattern, text)
        if match:
            return match.group(0)
        
        return None
    
    def parse_website(self, text: str) -> Optional[str]:
        """Extract website URL"""
        pattern = r'(?:www\.|https?://)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        match = re.search(pattern, text)
        if match:
            url = match.group(0)
            if not url.startswith('http'):
                url = 'https://' + url
            return url
        
        return None
    
    def parse_email(self, text: str) -> Optional[str]:
        """Extract email address"""
        pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        match = re.search(pattern, text)
        if match:
            return match.group(0)
        
        return None
    
    def detect_business_type(self, name: str, text: str) -> str:
        """Detect business type from name and context"""
        name_lower = name.lower()
        text_lower = text.lower()
        
        if any(word in name_lower for word in ['hostel', 'hiker', 'bunkhouse']):
            return 'hostel'
        elif any(word in name_lower for word in ['hotel', 'motel', 'inn', 'lodge']):
            return 'lodging'
        elif any(word in name_lower for word in ['outfitter', 'outdoor', 'gear']):
            return 'outfitter'
        elif any(word in name_lower for word in ['grocery', 'market', 'food', 'store']):
            return 'grocery'
        elif any(word in name_lower for word in ['restaurant', 'cafe', 'diner', 'grill']):
            return 'restaurant'
        elif any(word in name_lower for word in ['shuttle', 'transport']):
            return 'shuttle'
        elif 'post office' in name_lower or 'usps' in name_lower:
            return 'post_office'
        else:
            return 'business'
    
    def extract_business_amenities(self, text: str) -> List[str]:
        """Extract amenities from business description"""
        amenities = []
        text_lower = text.lower()
        
        amenity_keywords = {
            'wifi': ['wifi', 'wi-fi', 'internet'],
            'laundry': ['laundry', 'washer', 'dryer'],
            'shower': ['shower', 'bath'],
            'shuttle': ['shuttle', 'ride', 'transport'],
            'resupply': ['resupply', 'hiker box', 'mail drop'],
            'pet_friendly': ['pet friendly', 'dogs welcome'],
            'breakfast': ['breakfast', 'continental'],
            'kitchen': ['kitchen', 'cooking'],
            'parking': ['parking', 'park'],
            'pool': ['pool', 'swimming'],
            'restaurant': ['restaurant', 'dining'],
        }
        
        for amenity, keywords in amenity_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                amenities.append(amenity)
        
        return amenities
    
    def extract_waypoints_improved(self):
        """Extract waypoints with improved mile marker parsing"""
        logger.info("Starting improved waypoint extraction...")
        
        try:
            import fitz
            
            doc = fitz.open(self.pdf_path)
            logger.info(f"Processing {doc.page_count} pages")
            
            current_mile_range = (0.0, 0.0)
            
            for page_num in range(doc.page_count):
                page = doc[page_num]
                page_text = page.get_text()
                
                # Extract page mile range from header
                header_match = re.search(r'Miles?\s+(\d+\.\d+)\s*-\s*(\d+\.\d+)', page_text[:500])
                if header_match:
                    current_mile_range = (float(header_match.group(1)), float(header_match.group(2)))
                    logger.debug(f"Page {page_num}: Miles {current_mile_range[0]}-{current_mile_range[1]}")
                
                lines = page_text.split('\n')
                
                for i, line in enumerate(lines):
                    if 'Shelter' in line and not line.startswith('Next'):
                        context = '\n'.join(lines[max(0, i-3):min(len(lines), i+15)])
                        waypoint = self._parse_waypoint_improved(line, context, page_text, current_mile_range)
                        
                        if waypoint:
                            self.waypoints.append(waypoint)
            
            doc.close()
            logger.info(f"Extracted {len(self.waypoints)} waypoints with improved parsing")
            
        except Exception as e:
            logger.error(f"Extraction error: {e}")
    
    def _parse_waypoint_improved(self, line: str, context: str, page_text: str, mile_range: Tuple[float, float]) -> Optional[Waypoint]:
        """Parse waypoint with improved mile marker extraction"""
        try:
            # Extract name
            name_match = re.search(r'([A-Z][A-Za-z\s&]+(?:Shelter|shelter))', line)
            if not name_match:
                return None
            
            name = name_match.group(1).strip()
            
            # Extract GPS coordinates
            coords_match = re.search(r'\[(-?\d+\.\d+),\s*(-?\d+\.\d+)\]', context)
            if not coords_match:
                return None
            
            lat = float(coords_match.group(1))
            lng = float(coords_match.group(2))
            
            # Extract mile marker with improved logic
            mile = self.extract_mile_from_context(line, context, page_text)
            
            # If mile is 0, try to infer from GPS and mile range
            if mile == 0.0 and mile_range[0] > 0:
                # Use midpoint of page range as fallback
                mile = (mile_range[0] + mile_range[1]) / 2
            
            # Extract elevation
            elev_match = re.search(r'\s(\d{3,5})\s', context)
            elevation = int(elev_match.group(1)) if elev_match else 0
            
            # Determine state
            state = self._determine_state_from_mile(mile)
            
            # Parse amenities
            amenities = self._parse_amenities_comprehensive(context)
            
            # Parse direction arrows
            next_south, next_north = self._parse_direction_arrows(line)
            
            # Enhance with GPX data
            gpx_point = self._find_closest_gpx_point(lat, lng)
            if gpx_point and gpx_point.get('elevation'):
                elevation = int(gpx_point['elevation'] * 3.28084)
            
            waypoint = Waypoint(
                id=f"wp-comp-{len(self.waypoints)+1:04d}",
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
                hasCellSignal=amenities['hasCellSignal'],
                hasViews=amenities['hasViews'],
                hasPower=amenities['hasPower'],
                hasShower=amenities['hasShower'],
                nextShelterNorth=next_north,
                nextShelterSouth=next_south,
            )
            
            return waypoint
            
        except Exception as e:
            logger.debug(f"Error parsing waypoint: {e}")
            return None
    
    def _parse_amenities_comprehensive(self, text: str) -> Dict[str, Any]:
        """Comprehensive amenity parsing with icon recognition"""
        amenities = {
            'hasWater': False,
            'waterDistance': None,
            'waterNotes': None,
            'hasPrivy': False,
            'isTenting': False,
            'tentPlatforms': None,
            'hasBearBox': False,
            'hasCellSignal': False,
            'hasViews': False,
            'hasPower': False,
            'hasShower': False,
            'capacity': None,
            'services': []
        }
        
        text_lower = text.lower()
        
        # Water detection
        if 'water' in text_lower:
            amenities['hasWater'] = True
            amenities['services'].append('water')
            
            # Water distance
            water_dist_patterns = [
                r'water.*?(\d+)\s*(yards?|feet|ft|y)',
                r'(\d+)\s*(?:yards?|feet|ft|y).*?water',
            ]
            for pattern in water_dist_patterns:
                match = re.search(pattern, text_lower)
                if match:
                    distance = int(match.group(1))
                    unit = match.group(2)
                    if 'y' in unit:
                        amenities['waterDistance'] = distance / 1760
                    else:
                        amenities['waterDistance'] = distance / 5280
                    break
            
            # Water type
            if 'spring' in text_lower:
                amenities['waterNotes'] = 'Spring'
            elif 'creek' in text_lower or 'stream' in text_lower:
                amenities['waterNotes'] = 'Creek/Stream'
            elif 'well' in text_lower:
                amenities['waterNotes'] = 'Well'
            elif 'piped' in text_lower:
                amenities['waterNotes'] = 'Piped'
            elif 'dry' in text_lower or 'unreliable' in text_lower:
                amenities['waterNotes'] = 'Unreliable'
        
        # Privy
        if 'privy' in text_lower or 'toilet' in text_lower:
            amenities['hasPrivy'] = True
            amenities['services'].append('privy')
        
        # Tenting
        if any(word in text_lower for word in ['tent', 'tenting', 'camping']):
            amenities['isTenting'] = True
            amenities['services'].append('tent_site')
            
            platform_match = re.search(r'(\d+)\s*tent\s*(?:platforms?|pads?)', text_lower)
            if platform_match:
                amenities['tentPlatforms'] = int(platform_match.group(1))
        
        # Bear protection
        if any(word in text_lower for word in ['bear box', 'bear cable', 'bear bag', 'bear pole']):
            amenities['hasBearBox'] = True
            amenities['services'].append('bear_protection')
        
        # Cell signal
        if 'cell' in text_lower or 'signal' in text_lower or 'phone service' in text_lower:
            amenities['hasCellSignal'] = True
            amenities['services'].append('cell_signal')
        
        # Views
        if 'view' in text_lower or 'vista' in text_lower or 'scenic' in text_lower:
            amenities['hasViews'] = True
            amenities['services'].append('views')
        
        # Power
        if 'power' in text_lower or 'electric' in text_lower or 'outlet' in text_lower:
            amenities['hasPower'] = True
            amenities['services'].append('power')
        
        # Shower
        if 'shower' in text_lower:
            amenities['hasShower'] = True
            amenities['services'].append('shower')
        
        # Capacity
        capacity_match = re.search(r'\{(\d+)\}', text)
        if capacity_match:
            amenities['capacity'] = int(capacity_match.group(1))
        
        return amenities
    
    def extract_towns_comprehensive(self):
        """Extract towns with full business details"""
        logger.info("Starting comprehensive town extraction...")
        
        try:
            import fitz
            
            doc = fitz.open(self.pdf_path)
            
            for page_num in range(doc.page_count):
                page = doc[page_num]
                page_text = page.get_text()
                
                # Look for town sections
                lines = page_text.split('\n')
                
                for i, line in enumerate(lines):
                    # Town pattern: "Franklin, NC" or "Damascus, VA"
                    town_match = re.search(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2})', line)
                    
                    if town_match and any(indicator in page_text[max(0, i*100-500):min(len(page_text), i*100+2000)] 
                                         for indicator in ['PO', 'grocery', 'outfitter', 'hostel', 'lodging']):
                        context = '\n'.join(lines[i:min(len(lines), i+50)])
                        town = self._parse_town_comprehensive(line, context, page_text)
                        
                        if town:
                            self.towns.append(town)
            
            doc.close()
            logger.info(f"Extracted {len(self.towns)} towns with business details")
            
        except Exception as e:
            logger.error(f"Town extraction error: {e}")
    
    def _parse_town_comprehensive(self, line: str, context: str, page_text: str) -> Optional[TownData]:
        """Parse town with full business details"""
        try:
            # Extract town name and state
            town_match = re.search(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2})', line)
            if not town_match:
                return None
            
            town_name = town_match.group(1).strip()
            state = town_match.group(2)
            
            # Extract GPS coordinates
            coords_match = re.search(r'\[(-?\d+\.\d+),\s*(-?\d+\.\d+)\]', context)
            if not coords_match:
                return None
            
            lat = float(coords_match.group(1))
            lng = float(coords_match.group(2))
            
            # Extract mile marker
            mile = self.extract_mile_from_context(line, context, page_text)
            
            # Extract elevation
            elev_match = re.search(r'\s(\d{3,5})\s', context)
            elevation = int(elev_match.group(1)) if elev_match else 0
            
            # Extract distance from trail
            distance_match = re.search(r'\((\d+\.?\d*)[EW]\)', line)
            distance = float(distance_match.group(1)) if distance_match else 0.0
            
            # Detect services
            context_lower = context.lower()
            has_grocery = 'grocery' in context_lower or 'market' in context_lower or 'food lion' in context_lower
            has_outfitter = 'outfitter' in context_lower or 'outdoor' in context_lower
            has_post_office = 'po ' in context_lower or 'post office' in context_lower or 'usps' in context_lower
            has_lodging = 'lodging' in context_lower or 'hotel' in context_lower or 'motel' in context_lower
            has_restaurant = 'restaurant' in context_lower or 'cafe' in context_lower or 'diner' in context_lower
            has_laundry = 'laundry' in context_lower
            has_shower = 'shower' in context_lower
            has_atm = 'atm' in context_lower or 'bank' in context_lower
            has_hospital = 'hospital' in context_lower or 'medical' in context_lower or 'clinic' in context_lower
            shuttle_available = 'shuttle' in context_lower
            
            # Determine resupply quality
            if has_grocery and has_outfitter:
                resupply_quality = 'full'
            elif has_grocery:
                resupply_quality = 'good'
            elif 'convenience' in context_lower or 'gas station' in context_lower:
                resupply_quality = 'limited'
            else:
                resupply_quality = 'minimal'
            
            # Build services list
            services = []
            if has_grocery: services.append('grocery')
            if has_outfitter: services.append('outfitter')
            if has_post_office: services.append('post_office')
            if has_lodging: services.append('lodging')
            if has_restaurant: services.append('restaurant')
            if has_laundry: services.append('laundry')
            if has_shower: services.append('shower')
            if has_atm: services.append('atm')
            if has_hospital: services.append('hospital')
            if shuttle_available: services.append('shuttle')
            
            # Extract businesses
            businesses = self._extract_businesses(context)
            
            town = TownData(
                id=f"town-comp-{len(self.towns)+1:04d}",
                name=f"{town_name}, {state}",
                mile=mile,
                soboMile=self.TRAIL_LENGTH - mile,
                elevation=elevation,
                lat=lat,
                lng=lng,
                state=state,
                hasGrocery=has_grocery,
                hasOutfitter=has_outfitter,
                hasPostOffice=has_post_office,
                hasLodging=has_lodging,
                hasRestaurant=has_restaurant,
                hasLaundry=has_laundry,
                hasShower=has_shower,
                hasATM=has_atm,
                hasHospital=has_hospital,
                resupplyQuality=resupply_quality,
                distanceFromTrail=distance,
                shuttleAvailable=shuttle_available,
                services=services,
                businesses=businesses
            )
            
            return town
            
        except Exception as e:
            logger.debug(f"Error parsing town: {e}")
            return None
    
    def _extract_businesses(self, context: str) -> List[Business]:
        """Extract individual business listings from town context"""
        businesses = []
        lines = context.split('\n')
        
        current_business = None
        business_text = []
        
        for line in lines:
            # Check if line starts a new business (usually capitalized name)
            if re.match(r'^[A-Z][A-Za-z\s&\']+(?:Hostel|Hotel|Inn|Outfitter|Market|Store|Restaurant|Cafe)', line):
                # Save previous business
                if current_business and business_text:
                    self._finalize_business(current_business, '\n'.join(business_text), businesses)
                
                # Start new business
                current_business = line.strip()
                business_text = [line]
            elif current_business:
                business_text.append(line)
        
        # Save last business
        if current_business and business_text:
            self._finalize_business(current_business, '\n'.join(business_text), businesses)
        
        return businesses
    
    def _finalize_business(self, name: str, text: str, businesses: List[Business]):
        """Finalize and add business to list"""
        business_type = self.detect_business_type(name, text)
        phone = self.parse_phone_number(text)
        address = self.parse_address(text)
        hours = self.parse_hours(text)
        website = self.parse_website(text)
        email = self.parse_email(text)
        amenities = self.extract_business_amenities(text)
        
        # Extract services based on type
        services = []
        if business_type == 'hostel':
            services = ['lodging', 'hiker_services']
        elif business_type == 'lodging':
            services = ['lodging']
        elif business_type == 'outfitter':
            services = ['gear', 'resupply']
        elif business_type == 'grocery':
            services = ['resupply', 'food']
        elif business_type == 'restaurant':
            services = ['food']
        elif business_type == 'shuttle':
            services = ['shuttle', 'transport']
        
        business = Business(
            id=f"biz-{len(businesses)+1:04d}",
            name=name,
            type=business_type,
            phone=phone,
            address=address,
            hours=hours,
            website=website,
            email=email,
            services=services,
            amenities=amenities
        )
        
        businesses.append(business)
    
    def _parse_direction_arrows(self, text: str) -> Tuple[Optional[float], Optional[float]]:
        """Parse direction arrows for next shelter distances"""
        south_match = re.search(r'(\d+\.\d+)\s*<+', text)
        north_match = re.search(r'>+\s*(\d+\.\d+)', text)
        
        next_south = float(south_match.group(1)) if south_match else None
        next_north = float(north_match.group(1)) if north_match else None
        
        return next_south, next_north
    
    def _find_closest_gpx_point(self, target_lat: float, target_lon: float) -> Optional[Dict]:
        """Find closest GPX point to given coordinates"""
        min_distance = float('inf')
        closest = None
        
        for name, data in self.gpx_data.items():
            dist = ((data['lat'] - target_lat) ** 2 + (data['lon'] - target_lon) ** 2) ** 0.5
            if dist < min_distance:
                min_distance = dist
                closest = data
        
        return closest if min_distance < 0.01 else None
    
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
    
    def save_comprehensive_data(self, output_dir: str):
        """Save all extracted data"""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Save waypoints
        waypoints_file = output_path / "comprehensive_waypoints.json"
        with open(waypoints_file, 'w', encoding='utf-8') as f:
            json.dump([asdict(wp) for wp in self.waypoints], f, indent=2)
        logger.info(f"Saved {len(self.waypoints)} waypoints to {waypoints_file}")
        
        # Save towns
        towns_file = output_path / "comprehensive_towns.json"
        with open(towns_file, 'w', encoding='utf-8') as f:
            json.dump([asdict(town) for town in self.towns], f, indent=2)
        logger.info(f"Saved {len(self.towns)} towns to {towns_file}")
        
        # Generate statistics
        stats = self._generate_comprehensive_stats()
        stats_file = output_path / "comprehensive_stats.json"
        with open(stats_file, 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2)
        logger.info(f"Saved statistics to {stats_file}")
    
    def _generate_comprehensive_stats(self) -> Dict[str, Any]:
        """Generate comprehensive statistics"""
        total_wp = len(self.waypoints)
        total_towns = len(self.towns)
        
        stats = {
            'waypoints': {
                'total': total_wp,
                'with_mile_marker': sum(1 for wp in self.waypoints if wp.mile > 0),
                'with_water': sum(1 for wp in self.waypoints if wp.hasWater),
                'with_privy': sum(1 for wp in self.waypoints if wp.hasPrivy),
                'with_tenting': sum(1 for wp in self.waypoints if wp.isTenting),
                'with_bear_protection': sum(1 for wp in self.waypoints if wp.hasBearBox),
                'with_capacity': sum(1 for wp in self.waypoints if wp.capacity),
                'with_cell_signal': sum(1 for wp in self.waypoints if wp.hasCellSignal),
                'with_views': sum(1 for wp in self.waypoints if wp.hasViews),
                'by_state': {}
            },
            'towns': {
                'total': total_towns,
                'with_grocery': sum(1 for t in self.towns if t.hasGrocery),
                'with_outfitter': sum(1 for t in self.towns if t.hasOutfitter),
                'with_lodging': sum(1 for t in self.towns if t.hasLodging),
                'with_post_office': sum(1 for t in self.towns if t.hasPostOffice),
                'total_businesses': sum(len(t.businesses) for t in self.towns),
                'by_state': {}
            }
        }
        
        # Count by state
        for wp in self.waypoints:
            state = wp.state
            stats['waypoints']['by_state'][state] = stats['waypoints']['by_state'].get(state, 0) + 1
        
        for town in self.towns:
            state = town.state
            stats['towns']['by_state'][state] = stats['towns']['by_state'].get(state, 0) + 1
        
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
    
    extractor = ComprehensiveExtractor(str(pdf_path), str(data_dir), str(gpx_path))
    
    # Load GPX reference data
    extractor.load_gpx_data()
    
    # Extract waypoints with improved parsing
    extractor.extract_waypoints_improved()
    
    # Extract towns with full business details
    extractor.extract_towns_comprehensive()
    
    # Save results
    extractor.save_comprehensive_data(str(output_dir))
    
    logger.info("Comprehensive extraction complete!")
    logger.info(f"Waypoints: {len(extractor.waypoints)}")
    logger.info(f"Towns: {len(extractor.towns)}")
    logger.info(f"Total businesses: {sum(len(t.businesses) for t in extractor.towns)}")

if __name__ == "__main__":
    main()
