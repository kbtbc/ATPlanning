#!/usr/bin/env python3
"""
Comprehensive business extraction for ALL resupply points
Extracts hostels, stores, restaurants, outfitters, shuttles from PDF
"""

import fitz
import json
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ComprehensiveBusinessExtractor:
    """Extract all businesses for all resupply points"""
    
    def __init__(self, pdf_path: str, resupply_file: str):
        self.pdf_path = Path(pdf_path)
        self.resupply_file = Path(resupply_file)
        self.doc = fitz.open(str(self.pdf_path))
        
        # Business type keywords
        self.business_keywords = {
            'hostel': ['hostel', 'bunkhouse', 'hiker house'],
            'lodging': ['hotel', 'motel', 'inn', 'lodge', 'cabin', 'b&b', 'bed and breakfast'],
            'grocery': ['grocery', 'market', 'supermarket', 'ingles', 'walmart', 'food lion', 'iga'],
            'general_store': ['store', 'general store', 'country store', 'convenience'],
            'restaurant': ['restaurant', 'cafe', 'deli', 'grill', 'diner', 'pizza', 'buffet'],
            'outfitter': ['outfitter', 'outdoor', 'gear', 'sporting goods'],
            'shuttle': ['shuttle', 'transport', 'ride'],
        }
    
    def load_resupply_points(self) -> List[Dict]:
        """Load resupply points from TypeScript file"""
        content = self.resupply_file.read_text(encoding='utf-8')
        
        resupply_points = []
        pattern = r'\{\s*id:\s*["\']([^"\']+)["\'][^}]+name:\s*["\']([^"\']+)["\']'
        
        for match in re.finditer(pattern, content, re.DOTALL):
            resupply_points.append({
                'id': match.group(1),
                'name': match.group(2)
            })
        
        logger.info(f"Loaded {len(resupply_points)} resupply points")
        return resupply_points
    
    def find_town_in_pdf(self, town_name: str) -> List[int]:
        """Find all pages where town is mentioned"""
        pages = []
        town_base = town_name.split(',')[0].strip()
        
        for page_num in range(len(self.doc)):
            page = self.doc[page_num]
            text = page.get_text()
            
            if town_base in text:
                pages.append(page_num)
        
        return pages
    
    def extract_businesses_from_page(self, page_num: int, town_name: str) -> List[Dict]:
        """Extract all businesses from a page for a specific town"""
        page = self.doc[page_num]
        text = page.get_text()
        lines = text.split('\n')
        
        businesses = []
        town_base = town_name.split(',')[0].strip()
        
        # Find town section
        town_start = -1
        for i, line in enumerate(lines):
            if town_base in line:
                town_start = i
                break
        
        if town_start == -1:
            return businesses
        
        # Extract businesses in the next 150 lines (typical town section length)
        for i in range(town_start, min(town_start + 150, len(lines))):
            line = lines[i].strip()
            
            # Skip empty lines
            if not line or len(line) < 5:
                continue
            
            # Stop at next major town (but not sub-locations)
            if i > town_start + 10:
                if re.search(r'^[A-Z][a-z]+,\s+[A-Z]{2}', line) and town_base not in line:
                    break
            
            # Check for business types
            business_type = self._identify_business_type(line)
            if business_type:
                business = self._parse_business_line(line, business_type)
                if business and business['name']:
                    businesses.append(business)
        
        return businesses
    
    def _identify_business_type(self, line: str) -> Optional[str]:
        """Identify business type from line"""
        line_lower = line.lower()
        
        for biz_type, keywords in self.business_keywords.items():
            for keyword in keywords:
                if keyword in line_lower:
                    return biz_type
        
        return None
    
    def _parse_business_line(self, line: str, business_type: str) -> Optional[Dict]:
        """Parse business information from line"""
        phone = self._extract_phone(line)
        email = self._extract_email(line)
        website = self._extract_website(line)
        
        # Extract business name
        name = self._extract_business_name(line, phone, email)
        
        if not name or len(name) < 3:
            return None
        
        # Extract hours if present
        hours = self._extract_hours(line)
        
        # Extract address if present
        address = self._extract_address(line)
        
        # Extract pricing/notes
        notes = self._extract_notes(line)
        
        return {
            'name': name,
            'type': business_type,
            'phone': phone,
            'email': email,
            'website': website,
            'hours': hours,
            'address': address,
            'notes': notes,
        }
    
    def _extract_business_name(self, line: str, phone: Optional[str], email: Optional[str]) -> str:
        """Extract business name from line"""
        name = line
        
        # Remove phone number
        if phone:
            name = name.split(phone)[0]
        
        # Remove email
        if email:
            name = name.split(email)[0]
        
        # Remove leading symbols and numbers
        name = re.sub(r'^[^a-zA-Z]+', '', name)
        
        # Remove parenthetical info at end
        name = re.split(r'\s+\(', name)[0]
        
        # Remove common prefixes
        name = re.sub(r'^(AT|PO|M-F|Daily)\s+', '', name, flags=re.IGNORECASE)
        
        # Clean up
        name = name.strip()
        
        # Limit length
        if len(name) > 80:
            name = name[:80]
        
        return name
    
    def _extract_phone(self, text: str) -> Optional[str]:
        """Extract phone number"""
        patterns = [
            r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
            r'\d{3}-\d{3}-\d{4}',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(0)
        return None
    
    def _extract_email(self, text: str) -> Optional[str]:
        """Extract email"""
        match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        return match.group(0) if match else None
    
    def _extract_website(self, text: str) -> Optional[str]:
        """Extract website"""
        match = re.search(r'(?:www\.|https?://)?[\w\-]+\.(?:com|org|net|gov)', text, re.IGNORECASE)
        return match.group(0) if match else None
    
    def _extract_hours(self, text: str) -> Optional[str]:
        """Extract business hours"""
        # Look for hour patterns
        patterns = [
            r'(?:M-F|Mon-Fri|Daily|M-Sa)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)',
            r'\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)\s*-\s*\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0)
        return None
    
    def _extract_address(self, text: str) -> Optional[str]:
        """Extract address"""
        # Look for street addresses
        match = re.search(r'\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:St|Ave|Rd|Dr|Ln|Way|Blvd|Pkwy|Hwy)\.?)?', text)
        return match.group(0) if match else None
    
    def _extract_notes(self, text: str) -> Optional[str]:
        """Extract notes/pricing"""
        # Look for pricing
        price_match = re.search(r'\$\d+(?:-\$?\d+)?', text)
        if price_match:
            return f"Pricing: {price_match.group(0)}"
        
        # Look for AT Passport
        if 'AT Passport' in text or 'passport location' in text.lower():
            return 'AT Passport location'
        
        return None
    
    def extract_all_businesses(self) -> Dict[str, List[Dict]]:
        """Extract businesses for all resupply points"""
        resupply_points = self.load_resupply_points()
        all_businesses = {}
        
        for i, point in enumerate(resupply_points):
            logger.info(f"Processing {i+1}/{len(resupply_points)}: {point['name']}")
            
            # Find pages with this town
            pages = self.find_town_in_pdf(point['name'])
            
            if not pages:
                logger.warning(f"Town not found in PDF: {point['name']}")
                all_businesses[point['id']] = []
                continue
            
            # Extract businesses from all relevant pages
            businesses = []
            for page_num in pages:
                page_businesses = self.extract_businesses_from_page(page_num, point['name'])
                businesses.extend(page_businesses)
            
            # Deduplicate by name
            unique_businesses = self._deduplicate_businesses(businesses)
            
            all_businesses[point['id']] = unique_businesses
            logger.info(f"  Found {len(unique_businesses)} businesses")
        
        return all_businesses
    
    def _deduplicate_businesses(self, businesses: List[Dict]) -> List[Dict]:
        """Remove duplicate businesses"""
        seen_names = set()
        unique = []
        
        for biz in businesses:
            name_key = biz['name'].lower().strip()
            if name_key not in seen_names and len(name_key) > 3:
                seen_names.add(name_key)
                unique.append(biz)
        
        return unique
    
    def generate_report(self):
        """Generate comprehensive business extraction report"""
        logger.info("Starting comprehensive business extraction...")
        
        all_businesses = self.extract_all_businesses()
        
        # Save to JSON
        output_file = Path(__file__).parent.parent / "data" / "extracted" / "all_businesses_comprehensive.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_businesses, f, indent=2)
        
        logger.info(f"Saved comprehensive businesses to {output_file}")
        
        # Generate summary
        total_businesses = sum(len(bizs) for bizs in all_businesses.values())
        towns_with_businesses = sum(1 for bizs in all_businesses.values() if len(bizs) > 0)
        
        print("\n" + "="*80)
        print("COMPREHENSIVE BUSINESS EXTRACTION COMPLETE")
        print("="*80)
        print(f"\nTotal resupply points: {len(all_businesses)}")
        print(f"Points with businesses: {towns_with_businesses}")
        print(f"Total businesses extracted: {total_businesses}")
        print(f"\nTop towns by business count:")
        
        sorted_towns = sorted(all_businesses.items(), key=lambda x: len(x[1]), reverse=True)
        for town_id, bizs in sorted_towns[:10]:
            if len(bizs) > 0:
                # Get town name from resupply points
                town_name = next((p['name'] for p in self.load_resupply_points() if p['id'] == town_id), town_id)
                print(f"  - {town_name}: {len(bizs)} businesses")
        
        print(f"\nOutput: {output_file}")
        print("\nNext: Apply to resupply.ts with merge script")
        print("="*80)

def main():
    """Main execution"""
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    pdf_path = backend_dir / "data" / "WBP interactive PDF-V5E.pdf"
    resupply_file = backend_dir.parent / "webapp" / "src" / "data" / "resupply.ts"
    
    if not pdf_path.exists():
        logger.error(f"PDF not found: {pdf_path}")
        return
    
    if not resupply_file.exists():
        logger.error(f"Resupply file not found: {resupply_file}")
        return
    
    extractor = ComprehensiveBusinessExtractor(str(pdf_path), str(resupply_file))
    extractor.generate_report()

if __name__ == "__main__":
    main()
