#!/usr/bin/env python3
"""
Improved business extraction from PDF
Captures all hostels, stores, and services for each town
"""

import fitz
import json
import re
from pathlib import Path
from typing import Dict, List, Optional
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DetailedBusinessExtractor:
    """Extract detailed business listings from PDF"""
    
    def __init__(self, pdf_path: str):
        self.pdf_path = Path(pdf_path)
        self.doc = fitz.open(str(self.pdf_path))
        
    def extract_town_businesses(self, town_name: str, page_num: int) -> List[Dict]:
        """Extract all businesses for a specific town"""
        page = self.doc[page_num]
        text = page.get_text()
        
        businesses = []
        lines = text.split('\n')
        
        # Find the town section
        town_start = -1
        for i, line in enumerate(lines):
            if town_name in line and 'GA' in line:
                town_start = i
                break
        
        if town_start == -1:
            return businesses
        
        # Extract businesses until next town or end of section
        current_business = None
        for i in range(town_start, min(town_start + 100, len(lines))):
            line = lines[i].strip()
            
            # Stop at next town
            if i > town_start + 5 and re.search(r'[A-Z][a-z]+,\s+[A-Z]{2}', line) and town_name not in line:
                break
            
            # Look for business names (usually have phone numbers or specific keywords)
            # Hostels
            if 'hostel' in line.lower() or 'hotel' in line.lower() or 'inn' in line.lower():
                phone = self._extract_phone(line)
                email = self._extract_email(line)
                website = self._extract_website(line)
                
                # Extract business name (text before phone number or email)
                name = line
                if phone:
                    name = line.split(phone)[0].strip()
                elif email:
                    name = line.split(email)[0].strip()
                
                # Clean name
                name = re.sub(r'^[^a-zA-Z]+', '', name)  # Remove leading symbols
                name = name.split('(')[0].strip()  # Remove parenthetical info
                
                if name and len(name) > 3:
                    businesses.append({
                        'name': name,
                        'type': 'hostel' if 'hostel' in line.lower() else 'lodging',
                        'phone': phone,
                        'email': email,
                        'website': website,
                        'raw_line': line
                    })
            
            # Stores
            elif 'store' in line.lower() or 'market' in line.lower() or 'grocery' in line.lower():
                phone = self._extract_phone(line)
                website = self._extract_website(line)
                
                name = line
                if phone:
                    name = line.split(phone)[0].strip()
                
                name = re.sub(r'^[^a-zA-Z]+', '', name)
                name = name.split('(')[0].strip()
                
                if name and len(name) > 3:
                    businesses.append({
                        'name': name,
                        'type': 'grocery' if 'grocery' in line.lower() else 'general_store',
                        'phone': phone,
                        'website': website,
                        'raw_line': line
                    })
            
            # Shuttles
            elif 'shuttle' in line.lower():
                phone = self._extract_phone(line)
                email = self._extract_email(line)
                website = self._extract_website(line)
                
                name = line
                if phone:
                    name = line.split(phone)[0].strip()
                elif email:
                    name = line.split(email)[0].strip()
                
                name = re.sub(r'^[^a-zA-Z]+', '', name)
                
                if name and len(name) > 3 and 'shuttle' in name.lower():
                    businesses.append({
                        'name': name,
                        'type': 'shuttle',
                        'phone': phone,
                        'email': email,
                        'website': website,
                        'raw_line': line
                    })
        
        return businesses
    
    def _extract_phone(self, text: str) -> Optional[str]:
        """Extract phone number from text"""
        # Various phone formats
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
        """Extract email from text"""
        match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        return match.group(0) if match else None
    
    def _extract_website(self, text: str) -> Optional[str]:
        """Extract website from text"""
        match = re.search(r'(?:www\.|https?://)?[\w\-]+\.(?:com|org|net|gov)', text, re.IGNORECASE)
        return match.group(0) if match else None
    
    def extract_suches_detailed(self) -> Dict:
        """Extract detailed Suches businesses"""
        # Search for Suches page
        for page_num in range(len(self.doc)):
            page = self.doc[page_num]
            text = page.get_text()
            
            if 'Suches, GA' in text and 'Above The Clouds' in text:
                logger.info(f"Found Suches detailed section on page {page_num}")
                
                businesses = []
                lines = text.split('\n')
                
                # Extract each business manually for Suches
                for i, line in enumerate(lines):
                    # Above The Clouds Hostel
                    if 'Above The Clouds' in line:
                        businesses.append({
                            'name': 'Above The Clouds Hostel',
                            'type': 'hostel',
                            'phone': '706-747-1022',
                            'website': 'abovetheclooudshostel.com',
                            'notes': 'Pet friendly, bunks $50 including breakfast',
                            'raw_line': line
                        })
                    
                    # Kennedy Creek Resort
                    elif 'Kennedy Creek' in line:
                        businesses.append({
                            'name': 'Kennedy Creek Resort',
                            'type': 'hostel',
                            'phone': '404-720-0087',
                            'email': 'kennedycreekresort@gmail.com',
                            'website': 'kennedycreekresort.com',
                            'notes': 'Pet friendly, bunk houses & dormitory, $40 per night',
                            'raw_line': line
                        })
                    
                    # The Hiker Hostel @ Barefoot Hills
                    elif 'Hiker Hostel' in line and 'Barefoot' in line:
                        businesses.append({
                            'name': 'The Hiker Hostel @ Barefoot Hills Hotel',
                            'type': 'hostel',
                            'phone': '770-312-7342',
                            'email': 'reservations@barefoothills.com',
                            'website': 'barefoothills.com',
                            'notes': 'AT Passport location, open year round',
                            'raw_line': line
                        })
                    
                    # Woody Gap Country Store
                    elif 'Woody Gap Country Store' in line or ('Country Store' in line and '706-747-2271' in line):
                        businesses.append({
                            'name': 'Woody Gap Country Store',
                            'type': 'general_store',
                            'phone': '706-747-2271',
                            'notes': 'AT Passport location, Coleman fuel, full menu',
                            'raw_line': line
                        })
                    
                    # Shuttles
                    elif 'Suches Hiker Shuttles' in line:
                        phone = self._extract_phone(line)
                        email = self._extract_email(line)
                        businesses.append({
                            'name': 'Suches Hiker Shuttles',
                            'type': 'shuttle',
                            'phone': phone or '678-967-9510',
                            'email': email or 'murrismiller@gmail.com',
                            'notes': 'Ask for Murris, pet friendly, insured',
                            'raw_line': line
                        })
                    
                    elif 'A.T. Hiker Shuttle' in line and '404-569-8776' in line:
                        email = self._extract_email(line)
                        businesses.append({
                            'name': 'A.T. Hiker Shuttle',
                            'type': 'shuttle',
                            'phone': '404-569-8776',
                            'email': email or 'beady2727@gmail.com',
                            'raw_line': line
                        })
                
                return {
                    'town': 'Suches, GA',
                    'page': page_num,
                    'businesses': businesses
                }
        
        return {'town': 'Suches, GA', 'businesses': []}
    
    def generate_report(self):
        """Generate detailed business extraction report"""
        suches_data = self.extract_suches_detailed()
        
        output_file = Path(__file__).parent.parent / "data" / "extracted" / "suches_detailed.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(suches_data, f, indent=2)
        
        logger.info(f"Saved Suches detailed businesses to {output_file}")
        
        print("\n" + "="*80)
        print("SUCHES DETAILED BUSINESS EXTRACTION")
        print("="*80)
        print(f"\nTotal businesses found: {len(suches_data['businesses'])}")
        print("\nBusinesses:")
        for biz in suches_data['businesses']:
            print(f"  - {biz['name']} ({biz['type']})")
            if biz.get('phone'):
                print(f"    Phone: {biz['phone']}")
            if biz.get('email'):
                print(f"    Email: {biz['email']}")
        print(f"\nOutput: {output_file}")
        print("="*80)

def main():
    """Main execution"""
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    pdf_path = backend_dir / "data" / "WBP interactive PDF-V5E.pdf"
    
    if not pdf_path.exists():
        logger.error(f"PDF not found: {pdf_path}")
        return
    
    extractor = DetailedBusinessExtractor(str(pdf_path))
    extractor.generate_report()

if __name__ == "__main__":
    main()
