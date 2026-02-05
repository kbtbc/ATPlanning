#!/usr/bin/env python3
"""
AT Shelter Data Extractor - Pages 232-242
Extracts shelter data from the AWOL AT Guide PDF for audit purposes.
"""

import os
import sys
import json
from pathlib import Path
from typing import Dict, List, Any, Optional

# Try to import pdfplumber
try:
    import pdfplumber
except ImportError:
    print("pdfplumber not found. Installing...")
    os.system("pip install pdfplumber")
    import pdfplumber

def extract_shelter_pages(pdf_path: str, start_page: int = 232, end_page: int = 242) -> Dict[int, List[str]]:
    """Extract text from shelter pages in the PDF."""
    
    results = {}
    
    with pdfplumber.open(pdf_path) as pdf:
        for page_num in range(start_page, end_page + 1):
            # PDF pages are 0-indexed in pdfplumber
            pdf_index = page_num - 1
            
            if pdf_index >= len(pdf.pages):
                print(f"Warning: Page {page_num} does not exist in PDF")
                continue
            
            page = pdf.pages[pdf_index]
            text = page.extract_text()
            
            if text:
                results[page_num] = text
                print(f"✓ Extracted page {page_num} ({len(text)} characters)")
            else:
                print(f"⚠ No text found on page {page_num}")
    
    return results

def main():
    # PDF path
    pdf_path = Path("backend/data/WBP interactive PDF-V5E.pdf")
    
    if not pdf_path.exists():
        print(f"Error: PDF not found at {pdf_path}")
        sys.exit(1)
    
    print("=" * 60)
    print("AT Shelter Data Extractor")
    print("=" * 60)
    print(f"Source: {pdf_path}")
    print(f"Pages: 232-242 (Shelter Listings)")
    print("=" * 60)
    
    # Extract pages
    pages_data = extract_shelter_pages(str(pdf_path), 232, 242)
    
    # Save to JSON for further processing
    output_path = Path("backend/data/extracted/shelter_pages_232_242.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(pages_data, f, indent=2)
    
    print("\n" + "=" * 60)
    print(f"✓ Extracted {len(pages_data)} pages")
    print(f"✓ Saved to: {output_path}")
    print("=" * 60)
    
    # Print preview of each page
    print("\n--- PAGE PREVIEWS ---\n")
    for page_num in sorted(pages_data.keys()):
        text = pages_data[page_num]
        lines = text.split('\n')[:20]  # First 20 lines
        print(f"\n--- PAGE {page_num} ---")
        for line in lines:
            if line.strip():
                print(line[:100])  # First 100 chars of each line
        if len(text.split('\n')) > 20:
            print(f"... ({len(text.split(chr(10))) - 20} more lines)")

if __name__ == "__main__":
    main()
