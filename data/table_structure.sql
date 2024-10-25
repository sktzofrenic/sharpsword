create table books
(
    book_id           integer not null
        constraint books_pk
            primary key,
    book_name         text,
    book_abbreviation text,
    testament         text
);

create table verses
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

create index ix_verses_tsv
    on verses using gin (ts_vec);

create index verses_verse_id_index
    on verses (verse_id);

create table paragraphs
(
    verse_id integer,
    version  text,
    constraint paragraphs_verses_verse_id_version_fk
        foreign key (verse_id, version) references verses
);

create table descriptions
(
    verse_id          integer,
    version           text,
    description_plain text,
    constraint descriptions_verses_verse_id_version_fk
        foreign key (verse_id, version) references verses
);

create table headings
(
    verse_id      integer,
    version       text,
    heading_plain text,
    constraint headings_verses_verse_id_version_fk
        foreign key (verse_id, version) references verses
);

