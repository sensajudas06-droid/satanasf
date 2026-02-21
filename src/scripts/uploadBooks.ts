import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadBookContents() {
  const books = [
    { title: 'Ayetler Kitabı', file: 'Ayetler_Kitabi_extracted.txt' },
    { title: 'Gerçekler Kitabı', file: 'Gercekler_Kitabi_extracted.txt' },
    { title: 'İsa Kitabı', file: 'Isa_Kitabi_extracted.txt' }
  ];

  for (const bookInfo of books) {
    const { data: book } = await supabase
      .from('books')
      .select('id')
      .eq('title', bookInfo.title)
      .maybeSingle();

    if (!book) {
      console.log(`Book not found: ${bookInfo.title}`);
      continue;
    }

    const { data: existingChapter } = await supabase
      .from('book_chapters')
      .select('id')
      .eq('book_id', book.id)
      .eq('chapter_number', 1)
      .maybeSingle();

    if (existingChapter) {
      console.log(`Chapter already exists for: ${bookInfo.title}`);
      continue;
    }

    try {
      const response = await fetch(`/${bookInfo.file}`);
      const text = await response.text();

      const { error } = await supabase
        .from('book_chapters')
        .insert({
          book_id: book.id,
          chapter_number: 1,
          title: bookInfo.title,
          content: text
        });

      if (error) {
        console.error(`Error uploading ${bookInfo.title}:`, error);
      } else {
        console.log(`Successfully uploaded: ${bookInfo.title}`);
      }
    } catch (err) {
      console.error(`Failed to fetch ${bookInfo.file}:`, err);
    }
  }

  console.log('Upload complete!');
}

uploadBookContents();
