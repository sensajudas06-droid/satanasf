import os
import sys

# Read the three SQL files
with open('public/Isa_Kitabi_extracted.txt', 'r') as f:
    isa_content = f.read()

with open('public/Ayetler_Kitabi_extracted.txt', 'r') as f:
    ayetler_content = f.read()

with open('public/Gercekler_Kitabi_extracted.txt', 'r') as f:
    gercekler_content = f.read()

# Print SQL for Isa Kitabi
print(f"""INSERT INTO book_chapters (book_id, chapter_number, title, content)
VALUES (
  'fc73e71d-ae71-4975-ad32-f20ab0f9bc0d',
  1,
  'İsa Kitabı',
  $CONTENT${isa_content}$CONTENT$
);""")

print("\n--NEXT--\n")

# Print SQL for Ayetler Kitabi
print(f"""INSERT INTO book_chapters (book_id, chapter_number, title, content)
VALUES (
  'c7919e26-1eea-467e-9a78-e1053898c145',
  1,
  'Ayetler Kitabı',
  $CONTENT${ayetler_content}$CONTENT$
);""")

print("\n--NEXT--\n")

# Print SQL for Gercekler Kitabi
print(f"""INSERT INTO book_chapters (book_id, chapter_number, title, content)
VALUES (
  '54158352-f2c5-4fa7-b009-f647064628ba',
  1,
  'Gerçekler Kitabı',
  $CONTENT${gercekler_content}$CONTENT$
);""")
