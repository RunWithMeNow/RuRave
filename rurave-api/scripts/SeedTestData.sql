/*

================================================================================

  RuRave — seed тестовых данных (T-SQL / Microsoft SQL Server)

================================================================================

  Запуск:

    scripts\seed.ps1

    sqlcmd -S <server> -d RuRaveDB -E -C -i SeedTestData.sql -b -f i:65001



  SSMS: выберите базу RuRaveDB в списке (или раскомментируйте USE ниже).

  Не нужен SQLCMD Mode — скрипт без :setvar / $(переменных).



  Кодировка: UTF-8 (кириллица в N'' строках).



  Площадки: реальные адреса до номера дома (для OSM / Nominatim).

  ConcertStatus: 0 = Draft, 1 = Published, 2 = Cancelled

================================================================================

*/



SET NOCOUNT ON;

SET XACT_ABORT ON;

SET ANSI_NULLS ON;

SET QUOTED_IDENTIFIER ON;

GO



USE [RuRaveDB];

GO



/* --- Справочные таблицы (данные) ------------------------------------------ */



DECLARE @Cities TABLE (

    [Id]         INT           NOT NULL PRIMARY KEY,

    [Name]       NVARCHAR(100) NOT NULL,

    [Slug]       NVARCHAR(100) NOT NULL,

    [TimeZoneId] NVARCHAR(64)  NOT NULL

);



INSERT INTO @Cities ([Id], [Name], [Slug], [TimeZoneId]) VALUES

    (1, N'Москва',          N'moskva',          N'Europe/Moscow'),

    (2, N'Санкт-Петербург', N'sankt-peterburg', N'Europe/Moscow'),

    (3, N'Новосибирск',     N'novosibirsk',     N'Asia/Novosibirsk');



DECLARE @Venues TABLE (

    [Id]      INT            NOT NULL PRIMARY KEY,

    [CityId]  INT            NOT NULL,

    [Name]    NVARCHAR(200)  NOT NULL,

    [Address] NVARCHAR(500)  NULL

);



/* Адрес: улица, номер дома, город — без корпусов, строений, этажей */

INSERT INTO @Venues ([Id], [CityId], [Name], [Address]) VALUES

    (1,  1, N'Цирк на Цветном',           N'Цветной бульвар, 13, Москва'),

    (2,  1, N'Stadium Live',              N'Ленинградский проспект, 80, Москва'),

    (3,  1, N'ВТБ Арена',                 N'Ленинградский проспект, 36, Москва'),

    (4,  1, N'ГлавClub',                  N'Кутузовский проспект, 32, Москва'),

    (5,  1, N'Adrenaline Stadium',        N'Большая Филёвская улица, 22, Москва'),

    (6,  1, N'Crocus City Hall',          N'Международная улица, 65, Москва'),

    (7,  1, N'Москвариум',                N'проспект Вернадского, 41, Москва'),

    (8,  1, N'Live Arena',                N'проспект Андропова, 1, Москва'),

    (9,  1, N'СК Олимпийский',            N'Олимпийский проспект, 16, Москва'),

    (10, 1, N'Клуб 16 Тонн',              N'Пресненский Вал, 6, Москва'),

    (11, 2, N'A2 Green Concert',          N'проспект Медиков, 3, Санкт-Петербург'),

    (12, 2, N'Aurora Concert Hall',       N'Петроградская набережная, 34, Санкт-Петербург'),

    (13, 2, N'Газпром Арена',             N'Футбольная аллея, 1, Санкт-Петербург'),

    (14, 2, N'Дворец спорта «Юбилейный»', N'проспект Добролюбова, 18, Санкт-Петербург'),

    (15, 2, N'БКЗ «Октябрьский»',         N'Лиговский проспект, 6, Санкт-Петербург'),

    (16, 2, N'Севкабель Порт',           N'Кожевенная линия, 34, Санкт-Петербург'),

    (17, 2, N'Клуб А2',                   N'Невский проспект, 104, Санкт-Петербург'),

    (18, 3, N'Клуб LUXOR',                N'улица Челюскинцев, 21, Новосибирск'),

    (19, 3, N'ROCK Сити',                 N'Красный проспект, 80, Новосибирск'),

    (20, 3, N'Подземка',                  N'улица Каменская, 7, Новосибирск'),

    (21, 3, N'Новосибирская филармония',  N'Красный проспект, 36, Новосибирск'),

    (22, 3, N'ДК им. Кирова',             N'улица Ленина, 12, Новосибирск');



DECLARE @Artists TABLE (

    [Id]   INT           NOT NULL PRIMARY KEY,

    [Name] NVARCHAR(200) NOT NULL,

    [Slug] NVARCHAR(200) NOT NULL

);



INSERT INTO @Artists ([Id], [Name], [Slug]) VALUES

    (1,  N'DK',           N'dk'),

    (2,  N'Lida',         N'lida'),

    (3,  N'Скриптонит',   N'skriptonit'),

    (4,  N'Земфира',      N'zemfira'),

    (5,  N'Nina Kraviz',  N'nina-kraviz'),

    (6,  N'Хаски',        N'husky'),

    (7,  N'MOT',          N'mot'),

    (8,  N'Баста',        N'basta'),

    (9,  N'Pharaoh',      N'pharaoh'),

    (10, N'Мукка',        N'mukka'),

    (11, N'Feduk',        N'feduk'),

    (12, N'ЛСП',          N'lsp'),

    (13, N'Miyagi',       N'miyagi'),

    (14, N'Zivert',       N'zivert'),

    (15, N'Кис-Кис',      N'kis-kis');



DECLARE @Concerts TABLE (

    [Id]          INT                NOT NULL PRIMARY KEY,

    [Title]       NVARCHAR(300)      NOT NULL,

    [Slug]        NVARCHAR(300)      NOT NULL,

    [StartsAt]    DATETIMEOFFSET(0)  NOT NULL,

    [VenueId]     INT                NOT NULL,

    [ImageUrl]    NVARCHAR(1000)     NOT NULL,

    [Description] NVARCHAR(4000)     NOT NULL,

    [Status]      INT                NOT NULL

);



INSERT INTO @Concerts ([Id], [Title], [Slug], [StartsAt], [VenueId], [ImageUrl], [Description], [Status]) VALUES

    (1,  N'DCOnTour',                    N'dc-on-tour-moscow-2026',           CAST(N'2026-12-12T20:00:00+03:00' AS DATETIMEOFFSET(0)),  1,

        N'https://picsum.photos/seed/rurave-c01/800/450',  N'Тур DK: электроника и визуал в формате ночного шоу.', 1),

    (2,  N'Скриптонит Live',             N'skriptonit-stadium-live-2026',    CAST(N'2026-09-20T20:00:00+03:00' AS DATETIMEOFFSET(0)),  2,

        N'https://picsum.photos/seed/rurave-c02/800/450',  N'Большой сольный концерт на Stadium Live.', 1),

    (3,  N'Festival Night',              N'festival-night-vtb-2026',         CAST(N'2026-08-30T18:00:00+03:00' AS DATETIMEOFFSET(0)),  3,

        N'https://picsum.photos/seed/rurave-c03/800/450',  N'Ночной фестиваль на ВТБ Арене: две сцены и электронная зона.', 1),

    (4,  N'Nina Kraviz — Moscow Rave',   N'nina-kraviz-glavclub-2026',       CAST(N'2026-10-18T23:00:00+03:00' AS DATETIMEOFFSET(0)),  4,

        N'https://picsum.photos/seed/rurave-c04/800/450',  N'Сет Nina Kraviz в ГлавClub. Техно до утра.', 1),

    (5,  N'Баста Arena Show',            N'basta-adrenaline-2026',           CAST(N'2026-11-22T19:00:00+03:00' AS DATETIMEOFFSET(0)),  5,

        N'https://picsum.photos/seed/rurave-c05/800/450',  N'Арена-шоу в Adrenaline Stadium.', 1),

    (6,  N'Zivert — Super Tour',         N'zivert-crocus-2026',              CAST(N'2026-07-25T19:00:00+03:00' AS DATETIMEOFFSET(0)),  6,

        N'https://picsum.photos/seed/rurave-c06/800/450',  N'Поп-шоу в Crocus City Hall.', 1),

    (7,  N'Feduk Live',                  N'feduk-moskvarium-2026',           CAST(N'2026-06-14T20:00:00+03:00' AS DATETIMEOFFSET(0)),  7,

        N'https://picsum.photos/seed/rurave-c07/800/450',  N'Сольный концерт Feduk в Москвариуме.', 1),

    (8,  N'ЛСП — Большой сольник',       N'lsp-live-arena-2026',             CAST(N'2026-05-30T20:00:00+03:00' AS DATETIMEOFFSET(0)),  8,

        N'https://picsum.photos/seed/rurave-c08/800/450',  N'Сольный концерт на Live Arena.', 1),

    (9,  N'Miyagi & Эндшпиль',           N'miyagi-olympic-2026',             CAST(N'2026-10-03T19:00:00+03:00' AS DATETIMEOFFSET(0)),  9,

        N'https://picsum.photos/seed/rurave-c09/800/450',  N'Хип-хоп вечер в СК Олимпийский.', 1),

    (10, N'Кис-Кис. Акустика',           N'kis-kis-16tons-2026',             CAST(N'2026-04-18T20:00:00+03:00' AS DATETIMEOFFSET(0)), 10,

        N'https://picsum.photos/seed/rurave-c10/800/450',  N'Камерный концерт в клубе 16 Тонн.', 1),

    (11, N'Lida SuperStar',              N'lida-a2-spb-2026',                CAST(N'2026-07-17T19:30:00+03:00' AS DATETIMEOFFSET(0)), 11,

        N'https://picsum.photos/seed/rurave-c11/800/450',  N'Сольный концерт Lida в A2 Green Concert.', 1),

    (12, N'Земфира. Акустика',           N'zemfira-aurora-spb-2026',         CAST(N'2026-10-05T19:00:00+03:00' AS DATETIMEOFFSET(0)), 12,

        N'https://picsum.photos/seed/rurave-c12/800/450',  N'Акустический вечер в Aurora Concert Hall.', 1),

    (13, N'Хаски — Большой сольник',     N'husky-gazprom-spb-2026',          CAST(N'2026-08-08T20:00:00+03:00' AS DATETIMEOFFSET(0)), 13,

        N'https://picsum.photos/seed/rurave-c13/800/450',  N'Сольный концерт на Газпром Арене.', 1),

    (14, N'MOT Live',                    N'mot-yubileyny-spb-2026',          CAST(N'2026-09-12T19:00:00+03:00' AS DATETIMEOFFSET(0)), 14,

        N'https://picsum.photos/seed/rurave-c14/800/450',  N'Живой концерт MOT в Дворце спорта «Юбилейный».', 1),

    (15, N'Pharaoh Live',                N'pharaoh-oktyabrsky-2026',         CAST(N'2026-11-15T19:00:00+03:00' AS DATETIMEOFFSET(0)), 15,

        N'https://picsum.photos/seed/rurave-c15/800/450',  N'Рэп-концерт Pharaoh в БКЗ «Октябрьский».', 1),

    (16, N'Мукка',                       N'mukka-sevkabel-2026',             CAST(N'2026-06-22T19:00:00+03:00' AS DATETIMEOFFSET(0)), 16,

        N'https://picsum.photos/seed/rurave-c16/800/450',  N'Поп-концерт Мукка на открытой площадке Севкабель Порт.', 1),

    (17, N'DK — Petersburg Night',       N'dk-a2-nevsky-2026',               CAST(N'2026-12-05T22:00:00+03:00' AS DATETIMEOFFSET(0)), 17,

        N'https://picsum.photos/seed/rurave-c17/800/450',  N'Ночной электронный сет в клубе А2.', 1),

    (18, N'Скриптонит — Aurora',         N'skriptonit-aurora-spb-2027',      CAST(N'2027-02-14T20:00:00+03:00' AS DATETIMEOFFSET(0)), 12,

        N'https://picsum.photos/seed/rurave-c18/800/450',  N'Повторный сольник в Aurora Concert Hall.', 1),

    (19, N'Баста — Юбилейный',           N'basta-yubileyny-spb-2026',        CAST(N'2026-03-28T19:00:00+03:00' AS DATETIMEOFFSET(0)), 14,

        N'https://picsum.photos/seed/rurave-c19/800/450',  N'Большой зал, живой оркестр и гости.', 1),

    (20, N'Nina Kraviz — Port Session',  N'nina-kraviz-sevkabel-2026',       CAST(N'2026-08-21T23:30:00+03:00' AS DATETIMEOFFSET(0)), 16,

        N'https://picsum.photos/seed/rurave-c20/800/450',  N'Техно-сессия на Севкабель Порт.', 1),

    (21, N'DK — Сибирь',                 N'dk-luxor-nsk-2027',               CAST(N'2027-01-15T19:00:00+07:00' AS DATETIMEOFFSET(0)), 18,

        N'https://picsum.photos/seed/rurave-c21/800/450',  N'Рейв-сет DK в клубе LUXOR.', 1),

    (22, N'Скриптонит — Новосибирск',    N'skriptonit-rockcity-nsk-2026',    CAST(N'2026-06-28T20:00:00+07:00' AS DATETIMEOFFSET(0)), 19,

        N'https://picsum.photos/seed/rurave-c22/800/450',  N'Концерт в ROCK Сити.', 1),

    (23, N'Underground Session',         N'underground-podzemka-nsk-2026',   CAST(N'2026-11-08T22:00:00+07:00' AS DATETIMEOFFSET(0)), 20,

        N'https://picsum.photos/seed/rurave-c23/800/450',  N'Ночная электронная сессия в клубе Подземка.', 1),

    (24, N'Земфира с оркестром',         N'zemfira-philharmonic-nsk-2026',   CAST(N'2026-09-06T19:00:00+07:00' AS DATETIMEOFFSET(0)), 21,

        N'https://picsum.photos/seed/rurave-c24/800/450',  N'Симфоническое сопровождение в филармонии.', 1),

    (25, N'ЛСП — Новосибирск',           N'lsp-dk-kirova-nsk-2026',          CAST(N'2026-10-24T19:00:00+07:00' AS DATETIMEOFFSET(0)), 22,

        N'https://picsum.photos/seed/rurave-c25/800/450',  N'Сольник в ДК им. Кирова.', 1),

    (26, N'Feduk — Сибирь',              N'feduk-luxor-nsk-2026',            CAST(N'2026-07-12T20:00:00+07:00' AS DATETIMEOFFSET(0)), 18,

        N'https://picsum.photos/seed/rurave-c26/800/450',  N'Сольный концерт Feduk в LUXOR.', 1),

    (27, N'Хаски — ROCK Сити',           N'husky-rockcity-nsk-2026',         CAST(N'2026-05-16T20:00:00+07:00' AS DATETIMEOFFSET(0)), 19,

        N'https://picsum.photos/seed/rurave-c27/800/450',  N'Рэп-рок вечер в ROCK Сити.', 1),

    (28, N'Мукка — Подземка',            N'mukka-podzemka-nsk-2026',         CAST(N'2026-12-20T19:00:00+07:00' AS DATETIMEOFFSET(0)), 20,

        N'https://picsum.photos/seed/rurave-c28/800/450',  N'Камерный зал, живой звук Мукка.', 1),

    (29, N'Черновик (не в ленте)',       N'draft-internal-moscow',           CAST(N'2026-11-01T20:00:00+03:00' AS DATETIMEOFFSET(0)),  4,

        N'https://picsum.photos/seed/rurave-c29/800/450',  N'Черновик для проверки статуса Draft.', 0),

    (30, N'Отменённый концерт',         N'cancelled-stadium-live',          CAST(N'2026-06-01T20:00:00+03:00' AS DATETIMEOFFSET(0)),  2,

        N'https://picsum.photos/seed/rurave-c30/800/450',  N'Мероприятие отменено организатором.', 2);



DECLARE @ConcertArtists TABLE (

    [ConcertId]     INT NOT NULL,

    [ArtistId]      INT NOT NULL,

    [DisplayOrder]  INT NOT NULL,

    [IsHeadliner]   BIT NOT NULL,

    PRIMARY KEY ([ConcertId], [ArtistId])

);



INSERT INTO @ConcertArtists ([ConcertId], [ArtistId], [DisplayOrder], [IsHeadliner]) VALUES

    (1,  1,  0, 1),

    (2,  3,  0, 1),

    (3,  1,  0, 1), (3,  5,  1, 0),

    (4,  5,  0, 1),

    (5,  8,  0, 1),

    (6,  14, 0, 1),

    (7,  11, 0, 1),

    (8,  12, 0, 1),

    (9,  13, 0, 1),

    (10, 15, 0, 1),

    (11, 2,  0, 1),

    (12, 4,  0, 1),

    (13, 6,  0, 1),

    (14, 7,  0, 1),

    (15, 9,  0, 1),

    (16, 10, 0, 1),

    (17, 1,  0, 1), (17, 5,  1, 0),

    (18, 3,  0, 1),

    (19, 8,  0, 1),

    (20, 5,  0, 1),

    (21, 1,  0, 1),

    (22, 3,  0, 1),

    (23, 5,  0, 1), (23, 1,  1, 0),

    (24, 4,  0, 1),

    (25, 12, 0, 1),

    (26, 11, 0, 1),

    (27, 6,  0, 1),

    (28, 10, 0, 1),

    (29, 3,  0, 1),

    (30, 2,  0, 1);



DECLARE @TicketCategories TABLE (

    [ConcertId]  INT            NOT NULL,

    [Name]       NVARCHAR(200)  NOT NULL,

    [Price]      DECIMAL(18, 2) NOT NULL,

    [SortOrder]  INT            NOT NULL,

    [IsActive]   BIT            NOT NULL

);



INSERT INTO @TicketCategories ([ConcertId], [Name], [Price], [SortOrder], [IsActive]) VALUES

    (1,  N'Танцпол',  3000.00, 1, 1), (1,  N'Партер',   5000.00, 2, 1), (1,  N'VIP',      8000.00, 3, 1),

    (2,  N'Фан-зона', 2500.00, 1, 1), (2,  N'Трибуна',  4000.00, 2, 1),

    (3,  N'Танцпол',  4000.00, 1, 1), (3,  N'Партер',   7000.00, 2, 1), (3,  N'VIP',     12000.00, 3, 1),

    (4,  N'Вход',     3500.00, 1, 1), (4,  N'VIP-бар',  7000.00, 2, 1),

    (5,  N'Стандарт', 4500.00, 1, 1), (5,  N'Партер',   7500.00, 2, 1),

    (6,  N'Стандарт', 3200.00, 1, 1), (6,  N'Партер',   5500.00, 2, 1), (6,  N'VIP',      9000.00, 3, 1),

    (7,  N'Стандарт', 2800.00, 1, 1), (7,  N'Партер',   4200.00, 2, 1),

    (8,  N'Стандарт', 3500.00, 1, 1), (8,  N'Партер',   5200.00, 2, 1),

    (9,  N'Танцпол',  3000.00, 1, 1), (9,  N'Партер',   4800.00, 2, 1),

    (10, N'Стандарт', 2200.00, 1, 1), (10, N'VIP',      4000.00, 2, 1),

    (11, N'Стандарт', 3000.00, 1, 1), (11, N'Партер',   4500.00, 2, 1),

    (12, N'Партер',   3500.00, 1, 1),

    (13, N'Стандарт', 2800.00, 1, 1), (13, N'Партер',   4200.00, 2, 1),

    (14, N'Стандарт', 3200.00, 1, 1),

    (15, N'Стандарт', 3800.00, 1, 1), (15, N'Партер',   5500.00, 2, 1),

    (16, N'Стандарт', 2500.00, 1, 1), (16, N'VIP',      4500.00, 2, 1),

    (17, N'Ранний',   1800.00, 1, 1), (17, N'Стандарт', 2600.00, 2, 1),

    (18, N'Партер',   4000.00, 1, 1), (18, N'VIP',      6500.00, 2, 1),

    (19, N'Стандарт', 3500.00, 1, 1), (19, N'Партер',   5000.00, 2, 1),

    (20, N'Вход',     3200.00, 1, 1), (20, N'VIP',      6000.00, 2, 1),

    (21, N'Стандарт', 2800.00, 1, 1), (21, N'VIP',      6000.00, 2, 1),

    (22, N'Танцпол',  2200.00, 1, 1), (22, N'Партер',   3800.00, 2, 1),

    (23, N'Ранний',   1500.00, 1, 1), (23, N'Стандарт', 2200.00, 2, 1),

    (24, N'Партер',   3000.00, 1, 1), (24, N'VIP',      5500.00, 2, 1),

    (25, N'Стандарт', 2400.00, 1, 1), (25, N'Партер',   3600.00, 2, 1),

    (26, N'Стандарт', 2600.00, 1, 1), (26, N'VIP',      4800.00, 2, 1),

    (27, N'Танцпол',  2000.00, 1, 1), (27, N'Партер',   3200.00, 2, 1),

    (28, N'Стандарт', 2100.00, 1, 1);



DECLARE @CityCount      INT;

DECLARE @VenueCount     INT;

DECLARE @ArtistCount    INT;

DECLARE @ConcertCount   INT;

DECLARE @PublishedCount INT;



/* --- Применение к БД ------------------------------------------------------ */



BEGIN TRY

    BEGIN TRANSACTION;



    DELETE FROM dbo.[TicketCategories];

    DELETE FROM dbo.[ConcertArtists];

    DELETE FROM dbo.[Concerts];

    DELETE FROM dbo.[Artists];

    DELETE FROM dbo.[Venues];

    DELETE FROM dbo.[Cities];



    DBCC CHECKIDENT (N'dbo.Cities', RESEED, 0) WITH NO_INFOMSGS;

    DBCC CHECKIDENT (N'dbo.Venues', RESEED, 0) WITH NO_INFOMSGS;

    DBCC CHECKIDENT (N'dbo.Artists', RESEED, 0) WITH NO_INFOMSGS;

    DBCC CHECKIDENT (N'dbo.Concerts', RESEED, 0) WITH NO_INFOMSGS;

    DBCC CHECKIDENT (N'dbo.TicketCategories', RESEED, 0) WITH NO_INFOMSGS;



    SET IDENTITY_INSERT dbo.[Cities] ON;

    INSERT INTO dbo.[Cities] ([Id], [Name], [Slug], [TimeZoneId])

    SELECT [Id], [Name], [Slug], [TimeZoneId] FROM @Cities;

    SET IDENTITY_INSERT dbo.[Cities] OFF;



    SET IDENTITY_INSERT dbo.[Venues] ON;

    INSERT INTO dbo.[Venues] ([Id], [CityId], [Name], [Address])

    SELECT [Id], [CityId], [Name], [Address] FROM @Venues;

    SET IDENTITY_INSERT dbo.[Venues] OFF;



    SET IDENTITY_INSERT dbo.[Artists] ON;

    INSERT INTO dbo.[Artists] ([Id], [Name], [Slug])

    SELECT [Id], [Name], [Slug] FROM @Artists;

    SET IDENTITY_INSERT dbo.[Artists] OFF;



    SET IDENTITY_INSERT dbo.[Concerts] ON;

    INSERT INTO dbo.[Concerts] ([Id], [Title], [Slug], [StartsAt], [VenueId], [ImageUrl], [Description], [Status])

    SELECT [Id], [Title], [Slug], [StartsAt], [VenueId], [ImageUrl], [Description], [Status]

    FROM @Concerts;

    SET IDENTITY_INSERT dbo.[Concerts] OFF;



    INSERT INTO dbo.[ConcertArtists] ([ConcertId], [ArtistId], [DisplayOrder], [IsHeadliner])

    SELECT [ConcertId], [ArtistId], [DisplayOrder], [IsHeadliner]

    FROM @ConcertArtists;



    INSERT INTO dbo.[TicketCategories] ([ConcertId], [Name], [Price], [SortOrder], [IsActive])

    SELECT [ConcertId], [Name], [Price], [SortOrder], [IsActive]

    FROM @TicketCategories;



    COMMIT TRANSACTION;



    SELECT @CityCount = COUNT(*) FROM @Cities;

    SELECT @VenueCount = COUNT(*) FROM @Venues;

    SELECT @ArtistCount = COUNT(*) FROM @Artists;

    SELECT @ConcertCount = COUNT(*) FROM @Concerts;

    SELECT @PublishedCount = COUNT(*) FROM @Concerts WHERE [Status] = 1;



    PRINT N'';

    PRINT N'RuRave seed: успешно.';

    PRINT N'  База:     ' + DB_NAME();

    PRINT N'  Города:   ' + CAST(@CityCount AS NVARCHAR(10));

    PRINT N'  Площадки: ' + CAST(@VenueCount AS NVARCHAR(10)) + N' (реальные адреса)';

    PRINT N'  Артисты:  ' + CAST(@ArtistCount AS NVARCHAR(10));

    PRINT N'  Концерты: ' + CAST(@ConcertCount AS NVARCHAR(10))

        + N' (Published: ' + CAST(@PublishedCount AS NVARCHAR(10)) + N')';

END TRY

BEGIN CATCH

    IF @@TRANCOUNT > 0

        ROLLBACK TRANSACTION;



    THROW;

END CATCH;

GO


