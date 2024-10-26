create table if not exists public.books
(
    book_id           integer not null
        constraint books_pk
            primary key,
    book_name         text,
    book_abbreviation text,
    testament         text
);

create table if not exists public.verses
(
    verse_id       integer not null,
    book           integer
        constraint verses_books_book_id_fk
            references public.books,
    chapter        integer,
    verse          integer,
    text_plain     text,
    text_formatted text,
    version        text    not null,
    ts_vec         tsvector,
    constraint verses_pk
        primary key (verse_id, version)
);

create index if not exists ix_verses_tsv
    on public.verses using gin (ts_vec);

create index if not exists verses_verse_id_index
    on public.verses (verse_id);

create index if not exists verses_chapter_index
    on public.verses (chapter);

create index if not exists verses_book_index
    on public.verses (book);

create index if not exists verses_book_chapter_index
    on public.verses (book, chapter);

create table if not exists public.paragraphs
(
    verse_id integer,
    version  text,
    constraint paragraphs_verses_verse_id_version_fk
        foreign key (verse_id, version) references public.verses
);

create table if not exists public.descriptions
(
    verse_id          integer,
    version           text,
    description_plain text,
    constraint descriptions_verses_verse_id_version_fk
        foreign key (verse_id, version) references public.verses
);

create table if not exists public.headings
(
    verse_id      integer,
    version       text,
    heading_plain text,
    constraint headings_verses_verse_id_version_fk
        foreign key (verse_id, version) references public.verses
);

