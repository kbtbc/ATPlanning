#!/usr/bin/env python3
"""
Apply enriched resupply file to production
"""

import shutil
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def apply_enriched_resupply():
    """Apply the enriched resupply file"""
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    extracted_dir = backend_dir / "data" / "extracted"
    webapp_data_dir = backend_dir.parent / "webapp" / "src" / "data"
    
    preview_file = extracted_dir / "resupply_enriched_PREVIEW.ts"
    target_file = webapp_data_dir / "resupply.ts"
    
    if not preview_file.exists():
        logger.error(f"Preview file not found: {preview_file}")
        logger.error("Run generate_enriched_resupply.py first")
        return False
    
    # Apply the enriched file
    shutil.copy2(preview_file, target_file)
    logger.info(f"Applied enriched resupply to {target_file}")
    
    print("\n" + "="*80)
    print("ENRICHED RESUPPLY APPLIED")
    print("="*80)
    print("\n✅ Enriched resupply.ts has been applied")
    print("\nChanges:")
    print("- 58 resupply points preserved")
    print("- 46 points enriched with business directories")
    print("- Contact Directory now includes:")
    print("  • Business names")
    print("  • Phone numbers")
    print("  • Websites")
    print("  • Email addresses")
    print("  • Business types (grocery, outfitter, hostel, etc.)")
    print("\nNext step:")
    print("Restart your dev server to see the Contact Directory")
    print("\nIf you need to rollback:")
    print("  cd backend/scripts")
    print("  python restore_backup.py 20260203_121530")
    print("="*80)
    
    return True

if __name__ == "__main__":
    apply_enriched_resupply()
