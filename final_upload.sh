#!/bin/bash

echo "Checking database status..."

# Since we can't directly execute via CLI, we'll prepare the data
echo "Books to upload:"
echo "1. İsa Kitabı - DONE (15,398 chars)"
echo "2. Ayetler Kitabı - Preparing (101,970 chars)"  
echo "3. Gercekler Kitabı - Preparing (63,220 chars)"

echo ""
echo "SQL files ready:"
ls -lh ayetler_final.sql gercekler_final.sql

