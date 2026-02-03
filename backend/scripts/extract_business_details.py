#!/usr/bin/env python3
"""
Extract business directory details from PDF for resupply points
Focuses on town sections with business listings
"""

import fitz
import json
import re
from pathlib import Path
from typing import Dict, List, Optional
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BusinessExtractor:
    """Extract business details from PDF town sections"""
    
    def __init__(self, pdf_path: str):
        self.pdf_path = Path(pdf_path)
        self.doc = fitz.open(str(self.pdf_path))
        
    def extract_town_sections(self) -> Dict[str, Dict]:
        """Extract town sections with business listings"""
        towns = {}
        current_town = None
        
        for page_num in range(len(self.doc)):
            page = self.doc[page_num]
            text = page.get_text()
            
            # Look for town headers (usually in larger font or specific format)
            lines = text.split('\n')
            
            for i, line in enumerate(lines):
                line = line.strip()
                
                # Detect town name (typically has state abbreviation)
                if re.search(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s+[A-Z]{2}\b', line):
                    town_match = re.search(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s+([A-Z]{2})', line)
                    if town_match:
                        town_name = f"{town_match.group(1)}, {town_match.group(2)}"
                        current_town = town_name
                        if current_town not in towns:
                            towns[current_town] = {
                                'name': town_name,
                                'page': page_num,
                                'businesses': [],
                                'amenities_summary': '',
                                'raw_text': []
                            }
                
                # Collect text for current town
                if current_town and line:
                    towns[current_town]['raw_text'].append(line)
                    
                    # Extract business info patterns
                    # Phone numbers
                    phone_match = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', line)
                    
                    # Hours (various formats)
                    hours_match = re.search(r'(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun|M-F|Daily).*?(?:\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM))', line, re.IGNORECASE)
                    
                    # Addresses (street numbers and names)
                    address_match = re.search(r'\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:St|Ave|Rd|Dr|Ln|Way|Blvd|Pkwy)\.?)?', line)
                    
                    # Website/email
                    web_match = re.search(r'(?:www\.|https?://)?[\w\-]+\.(?:com|org|net|gov)', line, re.IGNORECASE)
                    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', line)
                    
                    # Business types (grocery, outfitter, hostel, etc.)
                    business_types = ['grocery', 'outfitter', 'hostel', 'hotel', 'motel', 'restaurant', 
                                    'cafe', 'deli', 'market', 'store', 'lodge', 'inn', 'shuttle']
                    
                    for biz_type in business_types:
                        if biz_type.lower() in line.lower():
                            business = {
                                'name': line.split('(')[0].strip() if '(' in line else line[:50],
                                'type': biz_type,
                                'phone': phone_match.group(0) if phone_match else None,
                                'hours': hours_match.group(0) if hours_match else None,
                                'address': address_match.group(0) if address_match else None,
                                'website': web_match.group(0) if web_match else None,
                                'email': email_match.group(0) if email_match else None,
                                'raw_line': line
                            }
                            towns[current_town]['businesses'].append(business)
        
        logger.info(f"Extracted {len(towns)} town sections")
        return towns
    
    def parse_hiawassee_section(self) -> Dict:
        """Parse Hiawassee as reference example"""
        # Search for Hiawassee specifically
        for page_num in range(len(self.doc)):
            page = self.doc[page_num]
            text = page.get_text()
            
            if 'Hiawassee' in text or 'HIAWASSEE' in text:
                logger.info(f"Found Hiawassee on page {page_num}")
                
                # Extract full section
                lines = text.split('\n')
                hiawassee_data = {
                    'name': 'Hiawassee, GA',
                    'page': page_num,
                    'businesses': [],
                    'amenities_summary': '',
                    'raw_text': []
                }
                
                in_section = False
                for line in lines:
                    if 'Hiawassee' in line:
                        in_section = True
                    
                    if in_section:
                        hiawassee_data['raw_text'].append(line)
                        
                        # Stop at next town
                        if re.search(r'[A-Z][a-z]+,\s+[A-Z]{2}', line) and 'Hiawassee' not in line:
                            break
                
                return hiawassee_data
        
        return None
    
    def extract_all_businesses(self) -> Dict:
        """Extract all business details from PDF"""
        towns = self.extract_town_sections()
        
        # Save raw extraction
        output = {
            'extraction_date': '2026-02-03',
            'total_towns': len(towns),
            'towns': towns
        }
        
        return output
    
    def generate_report(self):
        """Generate business extraction report"""
        data = self.extract_all_businesses()
        
        # Save to JSON
        output_file = Path(__file__).parent.parent / "data" / "extracted" / "business_details.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        
        logger.info(f"Saved business details to {output_file}")
        
        # Generate summary
        print("\n" + "="*80)
        print("BUSINESS DETAILS EXTRACTION")
        print("="*80)
        print(f"\nTotal towns found: {data['total_towns']}")
        
        # Count businesses
        total_businesses = sum(len(town['businesses']) for town in data['towns'].values())
        print(f"Total businesses extracted: {total_businesses}")
        
        # Show sample
        print("\nSample towns with businesses:")
        for town_name, town_data in list(data['towns'].items())[:5]:
            biz_count = len(town_data['businesses'])
            if biz_count > 0:
                print(f"  - {town_name}: {biz_count} businesses")
        
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
    
    extractor = BusinessExtractor(str(pdf_path))
    extractor.generate_report()

if __name__ == "__main__":
    main()
