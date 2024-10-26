create table if not exists books
(
    book_id           integer not null
        constraint books_pk
            primary key,
    book_name         text,
    book_abbreviation text,
    testament         text
);

create table if not exists verses
(
    verse_id       integer not null,
    book           integer
        constraint verses_books_book_id_fk
            references books,
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
    on verses using gin (ts_vec);

create index if not exists verses_verse_id_index
    on verses (verse_id);

create table if not exists paragraphs
(
    verse_id integer,
    version  text,
    constraint paragraphs_verses_verse_id_version_fk
        foreign key (verse_id, version) references verses
);

create table if not exists descriptions
(
    verse_id          integer,
    version           text,
    description_plain text,
    constraint descriptions_verses_verse_id_version_fk
        foreign key (verse_id, version) references verses
);

create table if not exists headings
(
    verse_id      integer,
    version       text,
    heading_plain text,
    constraint headings_verses_verse_id_version_fk
        foreign key (verse_id, version) references verses
);

