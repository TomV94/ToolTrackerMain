#!/bin/bash

# Configuration
DB_NAME="tool_tracker"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
echo "Creating backup of $DB_NAME..."
pg_dump -U postgres -F p -b -v -f "$BACKUP_FILE" "$DB_NAME"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_FILE"
    
    # Compress the backup
    gzip "$BACKUP_FILE"
    echo "Backup compressed: ${BACKUP_FILE}.gz"
    
    # Keep only the last 7 backups
    ls -t "$BACKUP_DIR"/*.gz | tail -n +8 | xargs -r rm
    echo "Old backups cleaned up"
else
    echo "Backup failed!"
    exit 1
fi

# Optional: Upload to remote storage
# echo "Uploading backup to remote storage..."
# aws s3 cp "${BACKUP_FILE}.gz" "s3://your-bucket/backups/" 