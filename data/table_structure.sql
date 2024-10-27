grant connect, create, temporary on database db_07cf41ed to us_45a313c2;

create table public.books
(
    book_id           integer not null
        constraint books_pk
            primary key,
    book_name         text,
    book_abbreviation text,
    testament         text
);

create table public.verses
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

create index ix_verses_tsv
    on public.verses using gin (ts_vec);

create index verses_verse_id_index
    on public.verses (verse_id);

create index verses_chapter_index
    on public.verses (chapter);

create index verses_book_index
    on public.verses (book);

create index verses_book_chapter_index
    on public.verses (book, chapter);

create table public.paragraphs
(
    verse_id integer,
    version  text,
    constraint unique_paragraphs
        unique (verse_id, version),
    constraint paragraphs_verses_verse_id_version_fk
        foreign key (verse_id, version) references public.verses
);

create table public.descriptions
(
    verse_id          integer,
    version           text,
    description_plain text,
    constraint descriptions_pk
        unique (verse_id, version),
    constraint descriptions_verses_verse_id_version_fk
        foreign key (verse_id, version) references public.verses
);

create table public.headings
(
    verse_id      integer,
    version       text,
    heading_plain text,
    constraint headings_pk
        unique (verse_id, version),
    constraint headings_verses_verse_id_version_fk
        foreign key (verse_id, version) references public.verses
);

