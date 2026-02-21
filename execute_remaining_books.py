#!/usr/bin/env python3
import subprocess
import json

# Read Ayetler content
with open('public/Ayetler_Kitabi_extracted.txt', 'r') as f:
    ayetler_content = f.read()

# Read Gercekler content  
with open('public/Gercekler_Kitabi_extracted.txt', 'r') as f:
    gercekler_content = f.read()

# Write SQL files for execution
with open('ayetler_final.sql', 'w') as f:
    f.write(f"""INSERT INTO book_chapters (book_id, chapter_number, title, content)
VALUES (
  'c7919e26-1eea-467e-9a78-e1053898c145',
  1,
  'Ayetler Kitabı',
  $CONTENT${ayetler_content}$CONTENT$
);""")

with open('gercekler_final.sql', 'w') as f:
    f.write(f"""INSERT INTO book_chapters (book_id, chapter_number, title, content)
VALUES (
  '54158352-f2c5-4fa7-b009-f647064628ba',
  1,
  'Gerçekler Kitabı',
  $CONTENT${gercekler_content}$CONTENT$
);""")

print("SQL files generated successfully")
print(f"Ayetler content length: {len(ayetler_content)} chars")
print(f"Gercekler content length: {len(gercekler_content)} chars")
