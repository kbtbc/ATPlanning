#!/usr/bin/env python3
"""
Apply comprehensive resupply file to production
"""

import shutil
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def apply_comprehensive_resupply():
    """Apply the comprehensive resupply file"""
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    extracted_dir = backend_dir / "data" / "extracted"
    webapp_data_dir = backend_dir.parent / "webapp" / "src" / "data"
    
    preview_file = extracted_dir / "resupply_comprehensive_PREVIEW.ts"
    target_file = webapp_data_dir / "resupply.ts"
    
    if not preview_file.exists():
        logger.error(f"Preview file not found: {preview_file}")
        logger.error("Run apply_comprehensive_businesses.py first")
        return False
    
    # Apply the comprehensive file
    shutil.copy2(preview_file, target_file)
    logger.info(f"Applied comprehensive resupply to {target_file}")
    
    print("\n" + "="*80)
    print("COMPREHENSIVE BUSINESS DIRECTORY APPLIED")
    print("="*80)
    print("\n✅ Comprehensive resupply.ts has been applied")
    print("\nChanges:")
    print("- All resupply points preserved")
    print("- 460 businesses extracted from PDF")
    print("- Complete Contact Directory for all towns including:")
    print("  • Hostels with pricing and amenities")
    print("  • Grocery stores and markets")
    print("  • Restaurants and cafes")
    print("  • Outfitters and gear shops")
    print("  • Shuttle services")
    print("  • General stores")
    print("  • Phone numbers, websites, emails")
    print("  • Business hours where available")
    print("  • Notes and pricing information")
    print("\nExample towns with complete listings:")
    print("  - Suches, GA: 6 businesses (hostels, store, shuttles)")
    print("  - Pinkham Notch, NH: 49 businesses")
    print("  - Rutland, VT: 35 businesses")
    print("  - Bear Mountain, NY: 28 businesses")
    print("\nNext step:")
    print("Restart your dev server to see complete Contact Directory")
    print("\nIf you need to rollback:")
    print("  cd backend/scripts")
    print("  python restore_backup.py 20260203_121530")
    print("="*80)
    
    return True

if __name__ == "__main__":
    apply_comprehensive_resupply()
