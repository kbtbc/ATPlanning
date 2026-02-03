#!/usr/bin/env python3
"""
Restore TypeScript data files from backup
"""

import sys
import shutil
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def restore_backup(timestamp: str):
    """Restore data files from backup"""
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    webapp_data_dir = backend_dir.parent / "webapp" / "src" / "data"
    backup_dir = webapp_data_dir / ".backup" / timestamp
    
    if not backup_dir.exists():
        logger.error(f"Backup not found: {backup_dir}")
        logger.info("Available backups:")
        backup_root = webapp_data_dir / ".backup"
        if backup_root.exists():
            for backup in sorted(backup_root.iterdir()):
                if backup.is_dir():
                    logger.info(f"  - {backup.name}")
        return False
    
    logger.info(f"Restoring from backup: {timestamp}")
    
    files_to_restore = ['shelters.ts', 'features.ts', 'resupply.ts']
    
    for filename in files_to_restore:
        source = backup_dir / filename
        if source.exists():
            dest = webapp_data_dir / filename
            shutil.copy2(source, dest)
            logger.info(f"Restored {filename}")
    
    logger.info("Restore complete!")
    return True

def main():
    """Main execution"""
    if len(sys.argv) < 2:
        logger.error("Usage: python restore_backup.py <timestamp>")
        logger.info("Example: python restore_backup.py 20260203_120000")
        
        # List available backups
        script_dir = Path(__file__).parent
        backend_dir = script_dir.parent
        webapp_data_dir = backend_dir.parent / "webapp" / "src" / "data"
        backup_root = webapp_data_dir / ".backup"
        
        if backup_root.exists():
            logger.info("\nAvailable backups:")
            for backup in sorted(backup_root.iterdir()):
                if backup.is_dir():
                    logger.info(f"  - {backup.name}")
        
        sys.exit(1)
    
    timestamp = sys.argv[1]
    success = restore_backup(timestamp)
    
    if success:
        logger.info("\nData restored successfully!")
        logger.info("Restart your development server to see the changes.")
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
