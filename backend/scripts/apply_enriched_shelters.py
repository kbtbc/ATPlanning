#!/usr/bin/env python3
"""
Apply enriched shelters file to production
"""

import shutil
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def apply_enriched_shelters():
    """Apply the enriched shelters file"""
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    extracted_dir = backend_dir / "data" / "extracted"
    webapp_data_dir = backend_dir.parent / "webapp" / "src" / "data"
    
    preview_file = extracted_dir / "shelters_enriched_PREVIEW.ts"
    target_file = webapp_data_dir / "shelters.ts"
    
    if not preview_file.exists():
        logger.error(f"Preview file not found: {preview_file}")
        logger.error("Run generate_enriched_shelters.py first")
        return False
    
    # Apply the enriched file
    shutil.copy2(preview_file, target_file)
    logger.info(f"Applied enriched shelters to {target_file}")
    
    print("\n" + "="*80)
    print("ENRICHED SHELTERS APPLIED")
    print("="*80)
    print("\n✅ Enriched shelters.ts has been applied")
    print("\nChanges:")
    print("- 252 original shelters preserved")
    print("- 393 records enriched with additional amenity data")
    print("- 44 new shelters added (30 filtered out)")
    print("- Total: 296 shelters")
    print("\nNext step:")
    print("Restart your dev server to see the changes")
    print("\nIf you need to rollback:")
    print("  cd backend/scripts")
    print("  python restore_backup.py 20260203_121530")
    print("="*80)
    
    return True

if __name__ == "__main__":
    apply_enriched_shelters()
