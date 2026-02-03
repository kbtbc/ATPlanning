#!/usr/bin/env python3
"""
Icon Recognition System for AT Planning PDF
Extracts and matches icons from the PDF using the Icon-Legend.png as reference
"""

import cv2
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class IconRecognizer:
    """Recognize and classify icons from PDF pages"""
    
    def __init__(self, legend_path: str):
        self.legend_path = Path(legend_path)
        self.icon_templates = {}
        self.icon_mappings = self._create_icon_mappings()
        
    def _create_icon_mappings(self) -> Dict[str, Dict]:
        """Create comprehensive icon to amenity mappings based on Icon-Legend.png"""
        return {
            # Water sources
            'water_reliable': {
                'amenity': 'water',
                'description': 'Reliable water source',
                'color_hint': 'blue_filled'
            },
            'water_seasonal': {
                'amenity': 'water',
                'description': 'Seasonal water source',
                'color_hint': 'blue_outline'
            },
            
            # Shelters and camping
            'shelter': {
                'amenity': 'shelter',
                'description': 'AT shelter',
                'icon_type': 'house'
            },
            'tent_site': {
                'amenity': 'tent_site',
                'description': 'Tent camping available',
                'icon_type': 'tent'
            },
            'hammock': {
                'amenity': 'hammock',
                'description': 'Hammock camping',
                'icon_type': 'hammock'
            },
            
            # Trail features
            'privy': {
                'amenity': 'privy',
                'description': 'Privy/toilet',
                'icon_type': 'toilet'
            },
            'bear_cables': {
                'amenity': 'bear_cables',
                'description': 'Bear cables or bear box',
                'icon_type': 'bear'
            },
            'cell_signal': {
                'amenity': 'cell_signal',
                'description': 'Cell phone signal',
                'icon_type': 'phone_bars'
            },
            'power_line': {
                'amenity': 'power_line',
                'description': 'Power line crossing',
                'icon_type': 'lightning'
            },
            
            # Landmarks
            'summit': {
                'amenity': 'summit',
                'description': 'Summit or crest',
                'icon_type': 'triangle'
            },
            'views': {
                'amenity': 'views',
                'description': 'Scenic views',
                'icon_type': 'eye'
            },
            'lookout': {
                'amenity': 'lookout',
                'description': 'Fire tower or observation tower',
                'icon_type': 'tower'
            },
            'bridge': {
                'amenity': 'bridge',
                'description': 'Footbridge',
                'icon_type': 'bridge'
            },
            'road': {
                'amenity': 'road',
                'description': 'Road crossing',
                'icon_type': 'road'
            },
            'waterfall': {
                'amenity': 'waterfall',
                'description': 'Waterfall',
                'icon_type': 'waterfall'
            },
            'parking': {
                'amenity': 'parking',
                'description': 'Parking area',
                'icon_type': 'P'
            },
            'warning': {
                'amenity': 'warning',
                'description': 'Warning or caution',
                'icon_type': 'exclamation',
                'color_hint': 'yellow'
            },
            'gps': {
                'amenity': 'gps',
                'description': 'GPS coordinates listed',
                'icon_type': 'brackets'
            },
            
            # Transportation
            'railroad': {
                'amenity': 'railroad',
                'description': 'Railroad crossing',
                'icon_type': 'train'
            },
            'swimming': {
                'amenity': 'swimming',
                'description': 'Swimming area',
                'icon_type': 'swimmer'
            },
            'picnic': {
                'amenity': 'picnic',
                'description': 'Picnic area',
                'icon_type': 'picnic_table'
            },
            'trash': {
                'amenity': 'trash',
                'description': 'Trash can',
                'icon_type': 'trash_can'
            },
            'boat': {
                'amenity': 'boat',
                'description': 'Boating available',
                'icon_type': 'boat'
            },
            
            # Services
            'at_passport': {
                'amenity': 'at_passport',
                'description': 'AT Passport stamp location',
                'icon_type': 'passport'
            },
            'hostel': {
                'amenity': 'hostel',
                'description': 'Hostel',
                'icon_type': 'house',
                'color_hint': 'green'
            },
            'lodging': {
                'amenity': 'lodging',
                'description': 'Lodging',
                'icon_type': 'bed'
            },
            'shuttle': {
                'amenity': 'shuttle',
                'description': 'Shuttle service',
                'icon_type': 'van',
                'color_hint': 'green'
            },
            'post_office': {
                'amenity': 'post_office',
                'description': 'Post Office',
                'icon_type': 'mailbox',
                'color_hint': 'blue'
            },
            'mail_drop': {
                'amenity': 'mail_drop',
                'description': 'Mail drop location',
                'icon_type': 'envelope'
            },
            'email': {
                'amenity': 'email',
                'description': 'Email available',
                'icon_type': 'email'
            },
            
            # Pet services
            'vet': {
                'amenity': 'vet',
                'description': 'Veterinarian',
                'icon_type': 'vet_cross'
            },
            'pet_friendly': {
                'amenity': 'pet_friendly',
                'description': 'Pet friendly',
                'icon_type': 'paw'
            },
            'no_pets': {
                'amenity': 'no_pets',
                'description': 'No pets allowed',
                'icon_type': 'no_pets'
            },
            
            # Amenities
            'work_for_stay': {
                'amenity': 'work_for_stay',
                'description': 'Work for stay',
                'icon_type': 'wfs'
            },
            'fuel': {
                'amenity': 'fuel',
                'description': 'Fuel for stove',
                'icon_type': 'fuel_can'
            },
            'laundry': {
                'amenity': 'laundry',
                'description': 'Laundry',
                'icon_type': 'washing_machine'
            },
            'computer': {
                'amenity': 'computer',
                'description': 'Computer available',
                'icon_type': 'computer'
            },
            'wifi': {
                'amenity': 'wifi',
                'description': 'WiFi available',
                'icon_type': 'wifi'
            },
            'shower': {
                'amenity': 'shower',
                'description': 'Shower available',
                'icon_type': 'shower'
            },
            'slackpacking': {
                'amenity': 'slackpacking',
                'description': 'Slackpacking service',
                'icon_type': 'backpack'
            },
            'insured': {
                'amenity': 'insured',
                'description': 'Insured shuttle provider',
                'icon_type': 'checkmark'
            },
            'atm': {
                'amenity': 'atm',
                'description': 'ATM/Bank',
                'icon_type': 'dollar'
            },
            
            # Food and supplies
            'long_term_resupply': {
                'amenity': 'long_term_resupply',
                'description': 'Long term resupply point',
                'icon_type': 'cart'
            },
            'snacks': {
                'amenity': 'snacks',
                'description': 'Snacks and odds & ends',
                'icon_type': 'snack'
            },
            'restaurant': {
                'amenity': 'restaurant',
                'description': 'Restaurant',
                'icon_type': 'fork_knife'
            },
            'pay_phone': {
                'amenity': 'pay_phone',
                'description': 'Pay phone',
                'icon_type': 'phone'
            },
            
            # Special markers
            'outfitter': {
                'amenity': 'outfitter',
                'description': 'Outfitter',
                'icon_type': 'boot'
            },
            'charging_station': {
                'amenity': 'charging_station',
                'description': 'Charging station',
                'icon_type': 'plug'
            },
            'ice_cream': {
                'amenity': 'ice_cream',
                'description': 'Ice cream',
                'icon_type': 'cone'
            },
            'hardware': {
                'amenity': 'hardware',
                'description': 'Hardware store',
                'icon_type': 'wrench'
            },
            'restroom': {
                'amenity': 'restroom',
                'description': 'Public restroom',
                'icon_type': 'restroom'
            },
            'pharmacy': {
                'amenity': 'pharmacy',
                'description': 'Pharmacy',
                'icon_type': 'rx'
            },
            'barber': {
                'amenity': 'barber',
                'description': 'Barber',
                'icon_type': 'scissors'
            },
            'info': {
                'amenity': 'info',
                'description': 'Information area',
                'icon_type': 'info'
            },
            'alcohol': {
                'amenity': 'alcohol',
                'description': 'Alcohol available',
                'icon_type': 'wine'
            },
            'medical': {
                'amenity': 'medical',
                'description': 'Medical/urgent care',
                'icon_type': 'cross'
            },
            'movie': {
                'amenity': 'movie',
                'description': 'Movie theater',
                'icon_type': 'film'
            },
            'airport': {
                'amenity': 'airport',
                'description': 'Airport',
                'icon_type': 'plane'
            },
            'bus': {
                'amenity': 'bus',
                'description': 'Bus station',
                'icon_type': 'bus'
            },
            'train': {
                'amenity': 'train',
                'description': 'Train station',
                'icon_type': 'train'
            },
        }
    
    def extract_icons_from_legend(self) -> Dict[str, np.ndarray]:
        """Extract individual icon templates from the legend image"""
        logger.info(f"Extracting icon templates from {self.legend_path}")
        
        if not self.legend_path.exists():
            logger.error(f"Legend file not found: {self.legend_path}")
            return {}
        
        # Load the legend image
        legend_img = cv2.imread(str(self.legend_path))
        if legend_img is None:
            logger.error("Failed to load legend image")
            return {}
        
        # Convert to grayscale for processing
        gray = cv2.cvtColor(legend_img, cv2.COLOR_BGR2GRAY)
        
        # Find contours (potential icons)
        _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        templates = {}
        for i, contour in enumerate(contours):
            x, y, w, h = cv2.boundingRect(contour)
            
            # Filter by size (icons should be small, consistent size)
            if 10 < w < 50 and 10 < h < 50:
                icon_img = legend_img[y:y+h, x:x+w]
                templates[f"icon_{i}"] = icon_img
        
        logger.info(f"Extracted {len(templates)} icon templates")
        return templates
    
    def match_icon(self, icon_img: np.ndarray, threshold: float = 0.7) -> Optional[str]:
        """Match an icon image to known templates"""
        if not self.icon_templates:
            return None
        
        best_match = None
        best_score = 0
        
        for icon_name, template in self.icon_templates.items():
            # Resize icon to match template size
            try:
                resized = cv2.resize(icon_img, (template.shape[1], template.shape[0]))
                
                # Calculate similarity using template matching
                result = cv2.matchTemplate(resized, template, cv2.TM_CCOEFF_NORMED)
                _, max_val, _, _ = cv2.minMaxLoc(result)
                
                if max_val > best_score:
                    best_score = max_val
                    best_match = icon_name
            except Exception as e:
                continue
        
        if best_score >= threshold:
            return best_match
        
        return None
    
    def extract_icons_from_page(self, page_img: np.ndarray) -> List[Tuple[str, Tuple[int, int]]]:
        """Extract and identify icons from a PDF page image"""
        icons_found = []
        
        # Convert to grayscale
        gray = cv2.cvtColor(page_img, cv2.COLOR_BGR2GRAY)
        
        # Find potential icon regions
        _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            
            # Filter by icon size
            if 10 < w < 50 and 10 < h < 50:
                icon_img = page_img[y:y+h, x:x+w]
                icon_type = self.match_icon(icon_img)
                
                if icon_type:
                    icons_found.append((icon_type, (x, y)))
        
        return icons_found
    
    def get_amenities_from_icons(self, icon_types: List[str]) -> List[str]:
        """Convert icon types to amenity list"""
        amenities = []
        
        for icon_type in icon_types:
            if icon_type in self.icon_mappings:
                amenity = self.icon_mappings[icon_type]['amenity']
                if amenity not in amenities:
                    amenities.append(amenity)
        
        return amenities

def main():
    """Test icon recognition"""
    script_dir = Path(__file__).parent
    data_dir = script_dir.parent / "data"
    legend_path = data_dir / "Icon-Legend.png"
    
    recognizer = IconRecognizer(str(legend_path))
    templates = recognizer.extract_icons_from_legend()
    
    logger.info(f"Icon recognition system initialized with {len(templates)} templates")

if __name__ == "__main__":
    main()
