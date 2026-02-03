#!/usr/bin/env python3
"""
AT Planning PDF Data Extractor
Extracts waypoint and town data from the Appalachian Trail planning PDF
with icon recognition for amenities and features.
"""

import os
import sys
import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class Waypoint:
    """Waypoint data structure matching the TypeScript interface"""
    id: str
    name: str
    mile: float
    soboMile: float
    elevation: int
    lat: float
    lng: float
    state: str
    county: Optional[str]
    type: str
    services: List[str]
    notes: Optional[str]
    distanceFromTrail: float
    # Shelter-specific
    capacity: Optional[int] = None
    hasWater: Optional[bool] = None
    waterDistance: Optional[float] = None
    hasPrivy: Optional[bool] = None
    isTenting: Optional[bool] = None
    fee: Optional[float] = None

@dataclass
class Business:
    """Business/establishment data structure"""
    id: str
    name: str
    type: str
    phone: Optional[str]
    address: Optional[str]
    hours: Optional[str]
    website: Optional[str]
    email: Optional[str]
    googleMapsUrl: Optional[str]
    notes: Optional[str]
    pricing: Optional[str]
    services: List[str]

@dataclass
class TownData:
    """Town/resupply point data structure"""
    id: str
    name: str
    mile: float
    soboMile: float
    elevation: int
    lat: float
    lng: float
    state: str
    type: str
    hasGrocery: bool
    hasOutfitter: bool
    hasPostOffice: bool
    hasLodging: bool
    hasRestaurant: bool
    hasLaundry: bool
    hasShower: bool
    resupplyQuality: str
    distanceFromTrail: float
    shuttleAvailable: Optional[bool]
    notes: Optional[str]
    services: List[str]
    businesses: List[Business]

class ATDataExtractor:
    """Main extractor class for AT planning data"""
    
    def __init__(self, pdf_path: str, data_dir: str):
        self.pdf_path = Path(pdf_path)
        self.data_dir = Path(data_dir)
        self.icon_legend_path = self.data_dir / "Icon-Legend.png"
        self.waypoints: List[Waypoint] = []
        self.towns: List[TownData] = []
        self.icon_templates = {}
        
        # Trail constants
        self.TRAIL_LENGTH = 2197.4
        
    def load_icon_templates(self):
        """Load and prepare icon templates for recognition"""
        logger.info("Loading icon templates from Icon-Legend.png")
        try:
            import cv2
            import numpy as np
            
            # Load the icon legend image
            legend_img = cv2.imread(str(self.icon_legend_path))
            if legend_img is None:
                logger.error(f"Failed to load icon legend: {self.icon_legend_path}")
                return
            
            # Icon definitions based on the legend
            self.icon_definitions = {
                'water': {'symbol': '💧', 'color': 'blue'},
                'shelter': {'symbol': '🏠', 'type': 'shelter'},
                'tent': {'symbol': '⛺', 'capacity': True},
                'privy': {'symbol': '🚽', 'type': 'privy'},
                'bear_cables': {'symbol': '🐻', 'type': 'bear_box'},
                'cell_signal': {'symbol': '📱', 'type': 'cell'},
                'power': {'symbol': '⚡', 'type': 'power'},
                'summit': {'symbol': '⛰️', 'type': 'summit'},
                'views': {'symbol': '👁️', 'type': 'views'},
                'lookout': {'symbol': '🗼', 'type': 'lookout'},
                'bridge': {'symbol': '🌉', 'type': 'bridge'},
                'road': {'symbol': '🛣️', 'type': 'road'},
                'waterfall': {'symbol': '💦', 'type': 'waterfall'},
                'parking': {'symbol': '🅿️', 'type': 'parking'},
                'bank': {'symbol': '🏦', 'type': 'bank'},
                'warning': {'symbol': '⚠️', 'type': 'warning'},
                'gps': {'symbol': '📍', 'type': 'gps'},
                'railroad': {'symbol': '🚂', 'type': 'railroad'},
                'swimming': {'symbol': '🏊', 'type': 'swimming'},
                'picnic': {'symbol': '🧺', 'type': 'picnic'},
                'trash': {'symbol': '🗑️', 'type': 'trash'},
                'boat': {'symbol': '⛵', 'type': 'boat'},
                'passport': {'symbol': '📖', 'type': 'at_passport'},
                'hostel': {'symbol': '🏨', 'type': 'hostel'},
                'lodging': {'symbol': '🛏️', 'type': 'lodging'},
                'shuttle': {'symbol': '🚐', 'type': 'shuttle'},
                'post_office': {'symbol': '📮', 'type': 'post_office'},
                'mail_drop': {'symbol': '📦', 'type': 'mail_drop'},
                'email': {'symbol': '📧', 'type': 'email'},
                'vet': {'symbol': '🐕', 'type': 'vet'},
                'pet_friendly': {'symbol': '🐾', 'type': 'pet_friendly'},
                'no_pets': {'symbol': '🚫🐕', 'type': 'no_pets'},
                'work_for_stay': {'symbol': '🔨', 'type': 'wfs'},
                'fuel': {'symbol': '⛽', 'type': 'fuel'},
                'laundry': {'symbol': '🧺', 'type': 'laundry'},
                'computer': {'symbol': '💻', 'type': 'computer'},
                'wifi': {'symbol': '📶', 'type': 'wifi'},
                'shower': {'symbol': '🚿', 'type': 'shower'},
                'slackpacking': {'symbol': '🎒', 'type': 'slackpacking'},
                'insured': {'symbol': '✅', 'type': 'insured'},
                'atm': {'symbol': '💰', 'type': 'atm'},
                'resupply': {'symbol': '🛒', 'type': 'long_term_resupply'},
                'snacks': {'symbol': '🍫', 'type': 'snacks'},
                'restaurant': {'symbol': '🍴', 'type': 'restaurant'},
                'phone': {'symbol': '☎️', 'type': 'pay_phone'},
            }
            
            logger.info(f"Loaded {len(self.icon_definitions)} icon definitions")
            
        except ImportError:
            logger.warning("OpenCV not available, icon recognition will be limited")
            
    def parse_gps_coords(self, text: str) -> Optional[Tuple[float, float]]:
        """Extract GPS coordinates from text in format [lat, lon]"""
        # Pattern: [34.62671,-84.19388]
        pattern = r'\[(-?\d+\.\d+),\s*(-?\d+\.\d+)\]'
        match = re.search(pattern, text)
        if match:
            lat = float(match.group(1))
            lon = float(match.group(2))
            return (lat, lon)
        return None
    
    def parse_distance(self, text: str) -> Optional[float]:
        """Extract distance from parentheses notation like (1.3) or (1.3W)"""
        # Pattern: (1.3) or (1.3W) or (1.3E)
        pattern = r'\((\d+\.?\d*)[WE]?\)'
        match = re.search(pattern, text)
        if match:
            return float(match.group(1))
        return 0.0
    
    def parse_capacity(self, text: str) -> Optional[int]:
        """Extract capacity from braces notation like {6}"""
        # Pattern: {6}
        pattern = r'\{(\d+)\}'
        match = re.search(pattern, text)
        if match:
            return int(match.group(1))
        return None
    
    def parse_elevation(self, text: str) -> Optional[int]:
        """Extract elevation from text"""
        # Pattern: 3000 or 3000.
        pattern = r'(\d{3,5})[\s\.]'
        matches = re.findall(pattern, text)
        if matches:
            # Return the last number found (usually elevation)
            return int(matches[-1])
        return None
    
    def extract_with_pymupdf(self):
        """Extract data using PyMuPDF (fitz)"""
        logger.info("Attempting extraction with PyMuPDF...")
        try:
            import fitz
            
            doc = fitz.open(self.pdf_path)
            logger.info(f"Opened PDF: {doc.page_count} pages")
            
            # Process each page
            for page_num in range(doc.page_count):
                page = doc[page_num]
                
                # Extract text
                text = page.get_text()
                
                # Extract images (for icon recognition)
                images = page.get_images()
                
                # Look for waypoint patterns
                self._parse_waypoint_text(text, page_num)
                
            doc.close()
            logger.info(f"PyMuPDF extraction complete: {len(self.waypoints)} waypoints found")
            
        except ImportError:
            logger.warning("PyMuPDF not available")
        except Exception as e:
            logger.error(f"PyMuPDF extraction error: {e}")
    
    def extract_with_pdfplumber(self):
        """Extract data using pdfplumber"""
        logger.info("Attempting extraction with pdfplumber...")
        try:
            import pdfplumber
            
            with pdfplumber.open(self.pdf_path) as pdf:
                logger.info(f"Opened PDF: {len(pdf.pages)} pages")
                
                for page_num, page in enumerate(pdf.pages):
                    # Extract text
                    text = page.extract_text()
                    
                    # Extract tables (useful for town data)
                    tables = page.extract_tables()
                    
                    # Parse waypoints
                    self._parse_waypoint_text(text, page_num)
                    
                    # Parse town data from tables
                    if tables:
                        self._parse_town_tables(tables, page_num)
                
            logger.info(f"pdfplumber extraction complete: {len(self.waypoints)} waypoints, {len(self.towns)} towns")
            
        except ImportError:
            logger.warning("pdfplumber not available")
        except Exception as e:
            logger.error(f"pdfplumber extraction error: {e}")
    
    def _parse_waypoint_text(self, text: str, page_num: int):
        """Parse waypoint data from extracted text"""
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            # Look for shelter patterns
            if 'Shelter' in line or 'shelter' in line:
                waypoint = self._extract_waypoint_from_line(line, lines[i:i+5])
                if waypoint:
                    self.waypoints.append(waypoint)
            
            # Look for town patterns
            if any(indicator in line for indicator in ['(all major services)', 'PO M-F', 'See map of']):
                town = self._extract_town_from_line(line, lines[i:i+10])
                if town:
                    self.towns.append(town)
    
    def _extract_waypoint_from_line(self, line: str, context: List[str]) -> Optional[Waypoint]:
        """Extract a waypoint from a text line with context"""
        try:
            # Extract name (usually in bold or before GPS coords)
            name_match = re.search(r'([A-Z][A-Za-z\s]+(?:Shelter|Gap|Mountain|Creek|Spring))', line)
            if not name_match:
                return None
            
            name = name_match.group(1).strip()
            
            # Extract GPS coordinates
            full_text = ' '.join(context)
            coords = self.parse_gps_coords(full_text)
            if not coords:
                return None
            
            lat, lng = coords
            
            # Extract mile marker
            mile_pattern = r'(\d+\.\d+)'
            mile_matches = re.findall(mile_pattern, line)
            mile = float(mile_matches[0]) if mile_matches else 0.0
            
            # Extract elevation
            elevation = self.parse_elevation(full_text) or 0
            
            # Extract capacity
            capacity = self.parse_capacity(full_text)
            
            # Extract distance from trail
            distance = self.parse_distance(full_text)
            
            # Determine state (would need more context)
            state = self._determine_state_from_mile(mile)
            
            waypoint = Waypoint(
                id=f"wp-{len(self.waypoints)+1:04d}",
                name=name,
                mile=mile,
                soboMile=self.TRAIL_LENGTH - mile,
                elevation=elevation,
                lat=lat,
                lng=lng,
                state=state,
                county=None,
                type='shelter' if 'Shelter' in name else 'feature',
                services=[],
                notes=None,
                distanceFromTrail=distance or 0.0,
                capacity=capacity,
                hasWater=None,
                waterDistance=None,
                hasPrivy=None,
                isTenting=None,
                fee=None
            )
            
            return waypoint
            
        except Exception as e:
            logger.debug(f"Error extracting waypoint: {e}")
            return None
    
    def _extract_town_from_line(self, line: str, context: List[str]) -> Optional[TownData]:
        """Extract town data from a text line with context"""
        try:
            # Extract town name
            town_match = re.search(r'([A-Z][A-Za-z\s]+),\s*([A-Z]{2})', line)
            if not town_match:
                return None
            
            name = town_match.group(1).strip()
            state = town_match.group(2)
            
            # Extract GPS coordinates
            full_text = ' '.join(context)
            coords = self.parse_gps_coords(full_text)
            if not coords:
                return None
            
            lat, lng = coords
            
            # Extract mile marker
            mile_pattern = r'(\d+\.\d+)'
            mile_matches = re.findall(mile_pattern, line)
            mile = float(mile_matches[0]) if mile_matches else 0.0
            
            # Extract elevation
            elevation = self.parse_elevation(full_text) or 0
            
            # Extract distance from trail
            distance_match = re.search(r'\((\d+\.?\d*)E\)', line)
            distance = float(distance_match.group(1)) if distance_match else 0.0
            
            # Determine services from text
            has_grocery = 'grocery' in full_text.lower() or 'market' in full_text.lower()
            has_outfitter = 'outfitter' in full_text.lower()
            has_post_office = 'PO' in full_text or 'post office' in full_text.lower()
            has_lodging = 'lodging' in full_text.lower() or 'hotel' in full_text.lower()
            has_restaurant = 'restaurant' in full_text.lower()
            has_laundry = 'laundry' in full_text.lower()
            has_shower = 'shower' in full_text.lower()
            
            town = TownData(
                id=f"town-{len(self.towns)+1:04d}",
                name=f"{name}, {state}",
                mile=mile,
                soboMile=self.TRAIL_LENGTH - mile,
                elevation=elevation,
                lat=lat,
                lng=lng,
                state=state,
                type='town',
                hasGrocery=has_grocery,
                hasOutfitter=has_outfitter,
                hasPostOffice=has_post_office,
                hasLodging=has_lodging,
                hasRestaurant=has_restaurant,
                hasLaundry=has_laundry,
                hasShower=has_shower,
                resupplyQuality='full' if has_grocery else 'limited',
                distanceFromTrail=distance,
                shuttleAvailable=None,
                notes=None,
                services=[],
                businesses=[]
            )
            
            return town
            
        except Exception as e:
            logger.debug(f"Error extracting town: {e}")
            return None
    
    def _parse_town_tables(self, tables: List[List[List[str]]], page_num: int):
        """Parse town data from extracted tables"""
        # Tables might contain structured town/business data
        for table in tables:
            if not table:
                continue
            
            # Look for business listings
            for row in table:
                if len(row) < 2:
                    continue
                
                # Check if this looks like a business entry
                if any(keyword in str(row).lower() for keyword in ['hostel', 'hotel', 'outfitter', 'grocery']):
                    # Parse business data
                    pass
    
    def _determine_state_from_mile(self, mile: float) -> str:
        """Determine state based on mile marker"""
        state_boundaries = {
            'GA': (0, 78.5),
            'NC': (78.5, 166.2),
            'TN': (166.2, 444.8),
            'VA': (444.8, 1033.0),
            'WV': (1000.7, 1026.0),
            'MD': (1026.0, 1070.0),
            'PA': (1070.0, 1298.0),
            'NJ': (1298.0, 1378.1),
            'NY': (1378.1, 1472.9),
            'CT': (1472.9, 1508.0),
            'MA': (1508.0, 1599.0),
            'VT': (1599.0, 1755.0),
            'NH': (1755.0, 1898.0),
            'ME': (1898.0, 2197.4),
        }
        
        for state, (start, end) in state_boundaries.items():
            if start <= mile <= end:
                return state
        
        return 'UNKNOWN'
    
    def extract_all(self):
        """Run all extraction methods"""
        logger.info("Starting comprehensive PDF extraction...")
        
        # Load icon templates
        self.load_icon_templates()
        
        # Try multiple extraction methods
        self.extract_with_pymupdf()
        self.extract_with_pdfplumber()
        
        logger.info(f"Extraction complete: {len(self.waypoints)} waypoints, {len(self.towns)} towns")
    
    def save_to_json(self, output_dir: str):
        """Save extracted data to JSON files"""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Save waypoints
        waypoints_file = output_path / "extracted_waypoints.json"
        with open(waypoints_file, 'w', encoding='utf-8') as f:
            json.dump([asdict(wp) for wp in self.waypoints], f, indent=2)
        logger.info(f"Saved {len(self.waypoints)} waypoints to {waypoints_file}")
        
        # Save towns
        towns_file = output_path / "extracted_towns.json"
        with open(towns_file, 'w', encoding='utf-8') as f:
            json.dump([asdict(town) for town in self.towns], f, indent=2)
        logger.info(f"Saved {len(self.towns)} towns to {towns_file}")

def main():
    """Main execution function"""
    # Setup paths
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    data_dir = backend_dir / "data"
    pdf_path = data_dir / "WBP interactive PDF-V5E.pdf"
    output_dir = data_dir / "extracted"
    
    if not pdf_path.exists():
        logger.error(f"PDF not found: {pdf_path}")
        sys.exit(1)
    
    # Create extractor
    extractor = ATDataExtractor(str(pdf_path), str(data_dir))
    
    # Extract data
    extractor.extract_all()
    
    # Save results
    extractor.save_to_json(str(output_dir))
    
    logger.info("Extraction complete!")

if __name__ == "__main__":
    main()
