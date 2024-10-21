from pysword.bible import SwordBible
from youscraper import get_chapter
import os

bible = SwordBible('/home/dansafee/Desktop/sword/modules/texts/ztext/kjvpce/')

output = bible.get(books=['john', 'matthew'], chapters=[3], verses=[16])


structure = bible.get_structure()

books = structure.get_books()

ot_books = [book.name for book in books['ot']]
nt_books = [book.name for book in books['nt']]

books = ot_books + nt_books

print(books)
books = ['HEB']

for book in books: 
    for chapter in range(1, 800):
        chapter_data = get_chapter(book[0:3].upper(), chapter)

        try:
            os.mkdir(f'bible/{book}')
        except:
            pass

        with open(f'bible/{book}/{str(chapter).zfill(3)}.txt', 'w') as f:
            f.write(chapter_data['pageProps']['chapterInfo']['content'])
        # for verse in range(1, 800):
        #     try:
        #         output = bible.get(books=[book], chapters=[chapter], verses=[verse])
        #         print(f'{book} {chapter}:{verse} - {output}')
        #     except:
        #         break
