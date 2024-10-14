from pysword.bible import SwordBible
# Create the bible. The arguments are:
# SwordBible(<module path>, <module type>, <versification>, <encoding>, <text formatting>)
# Only the first is required, the rest have default values which should work in most cases.
bible = SwordBible('/home/dansafee/Desktop/sword/modules/texts/ztext/kjvpce/')
# Get John chapter 3 verse 16
output = bible.get(books=['john', 'matthew'], chapters=[3], verses=[16])


structure = bible.get_structure()

books = structure.get_books()

ot_books = [book.name for book in books['ot']]
nt_books = [book.name for book in books['nt']]

books = ot_books + nt_books

print(books)

for book in books: 
    for chapter in range(1, 800):
        for verse in range(1, 800):
            try:
                output = bible.get(books=[book], chapters=[chapter], verses=[verse])
                print(f'{book} {chapter}:{verse} - {output}')
            except:
                break
