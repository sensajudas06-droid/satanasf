import { supabase } from '../lib/supabase';

export async function uploadBookContent() {
  const books = [
    {
      title: 'Ayetler Kitabı',
      filePath: '/Ayetler_Kitabi_extracted.txt'
    },
    {
      title: 'Gerçekler Kitabı',
      filePath: '/Gercekler_Kitabi_extracted.txt'
    },
    {
      title: 'İsa Kitabı',
      filePath: '/Isa_Kitabi_extracted.txt'
    }
  ];

  for (const book of books) {
    const { data: bookData } = await supabase
      .from('books')
      .select('id')
      .eq('title', book.title)
      .maybeSingle();

    if (!bookData) continue;

    const response = await fetch(book.filePath);
    const text = await response.text();

    const { error } = await supabase
      .from('book_chapters')
      .insert({
        book_id: bookData.id,
        chapter_number: 1,
        title: book.title,
        content: text
      });

    if (error) {
      console.error(`Error uploading ${book.title}:`, error);
    }
  }
}
