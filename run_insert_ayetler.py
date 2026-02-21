with open('public/Ayetler_Kitabi_extracted.txt', 'r') as f:
    content = f.read()

sql = f"""INSERT INTO book_chapters (book_id, chapter_number, title, content)
VALUES (
  'c7919e26-1eea-467e-9a78-e1053898c145',
  1,
  'Ayetler Kitabı',
  $CONTENT${content}$CONTENT$
);"""

print(sql)
