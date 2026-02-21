with open('public/Isa_Kitabi_extracted.txt', 'r') as f:
    content = f.read()

sql = f"""INSERT INTO book_chapters (book_id, chapter_number, title, content)
VALUES (
  'fc73e71d-ae71-4975-ad32-f20ab0f9bc0d',
  1,
  'İsa Kitabı',
  $CONTENT${content}$CONTENT$
);"""

print(sql)
