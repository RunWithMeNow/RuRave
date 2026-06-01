/*
================================================================================
  RuRave — дополнение тестовых данных (без очистки существующих записей)

  Этапы в одной транзакции:
    1. 4 крупных города РФ (Казань, Екатеринбург, Нижний Новгород, Краснодар)
    2. По 3 площадки на каждый новый город
    3. По 5 опубликованных концертов на каждый новый город (с билетами и артистами)

  Повторный запуск: пропускает уже добавленные города, площадки и концерты
  (проверка по Slug города / паре город+площадка / Slug концерта).

  Запуск:
    sqlcmd -S <server> -d RuRaveDB -E -C -i SeedAdditionalCities.sql -b -f i:65001

  SSMS: выберите базу RuRaveDB (или раскомментируйте USE ниже).

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

DECLARE @CitiesAdded      INT = 0;
DECLARE @VenuesAdded      INT = 0;
DECLARE @ConcertsAdded    INT = 0;
DECLARE @TicketRowsAdded  INT = 0;
DECLARE @ArtistLinksAdded INT = 0;

BEGIN TRY
    BEGIN TRANSACTION;

    /* =========================================================================
       Этап 1 — города
       ========================================================================= */

    DECLARE @CityIds TABLE (
        [Slug]   NVARCHAR(100) NOT NULL PRIMARY KEY,
        [CityId] INT           NOT NULL
    );

    IF NOT EXISTS (SELECT 1 FROM dbo.[Cities] WHERE [Slug] = N'kazan')
    BEGIN
        INSERT INTO dbo.[Cities] ([Name], [Slug], [TimeZoneId], [ImageUrl])
        VALUES (N'Казань', N'kazan', N'Europe/Moscow', N'/cities/kazan.jpg');
        SET @CitiesAdded += 1;
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.[Cities] WHERE [Slug] = N'ekaterinburg')
    BEGIN
        INSERT INTO dbo.[Cities] ([Name], [Slug], [TimeZoneId], [ImageUrl])
        VALUES (N'Екатеринбург', N'ekaterinburg', N'Asia/Yekaterinburg', N'/cities/ekaterinburg.jpg');
        SET @CitiesAdded += 1;
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.[Cities] WHERE [Slug] = N'nizhniy-novgorod')
    BEGIN
        INSERT INTO dbo.[Cities] ([Name], [Slug], [TimeZoneId], [ImageUrl])
        VALUES (N'Нижний Новгород', N'nizhniy-novgorod', N'Europe/Moscow', N'/cities/nizhniy-novgorod.jpg');
        SET @CitiesAdded += 1;
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.[Cities] WHERE [Slug] = N'krasnodar')
    BEGIN
        INSERT INTO dbo.[Cities] ([Name], [Slug], [TimeZoneId], [ImageUrl])
        VALUES (N'Краснодар', N'krasnodar', N'Europe/Moscow', N'/cities/krasnodar.webp');
        SET @CitiesAdded += 1;
    END;

    UPDATE dbo.[Cities]
    SET [ImageUrl] = CASE [Slug]
        WHEN N'kazan'             THEN N'/cities/kazan.jpg'
        WHEN N'ekaterinburg'      THEN N'/cities/ekaterinburg.jpg'
        WHEN N'nizhniy-novgorod'  THEN N'/cities/nizhniy-novgorod.jpg'
        WHEN N'krasnodar'         THEN N'/cities/krasnodar.webp'
    END
    WHERE [Slug] IN (N'kazan', N'ekaterinburg', N'nizhniy-novgorod', N'krasnodar')
      AND ([ImageUrl] IS NULL OR [ImageUrl] = N'');

    INSERT INTO @CityIds ([Slug], [CityId])
    SELECT [Slug], [Id]
    FROM dbo.[Cities]
    WHERE [Slug] IN (N'kazan', N'ekaterinburg', N'nizhniy-novgorod', N'krasnodar');

    IF (SELECT COUNT(*) FROM @CityIds) <> 4
    BEGIN
        THROW 50001, N'Не все 4 целевых города найдены после этапа 1. Проверьте dbo.Cities.', 1;
    END;

    /* =========================================================================
       Этап 2 — площадки (по 3 на город)
       ========================================================================= */

    DECLARE @VenueSeed TABLE (
        [CitySlug] NVARCHAR(100) NOT NULL,
        [Name]     NVARCHAR(200) NOT NULL,
        [Address]  NVARCHAR(500) NOT NULL
    );

    INSERT INTO @VenueSeed ([CitySlug], [Name], [Address]) VALUES
        (N'kazan',            N'Kazan Arena',                 N'улица Чистопольская, 62, Казань'),
        (N'kazan',            N'Pyramid RTC',                 N'Оренбургский тракт, 138, Казань'),
        (N'kazan',            N'Клуб «Таврида»',             N'улица Братьев Касимовых, 36, Казань'),

        (N'ekaterinburg',     N'Дворец спорта «Уралочка»',    N'улица Еремина, 10, Екатеринбург'),
        (N'ekaterinburg',     N'Свердловская филармония',     N'проспект Ленина, 38, Екатеринбург'),
        (N'ekaterinburg',     N'Tele-Club',                   N'улица Карьерная, 16, Екатеринбург'),

        (N'nizhniy-novgorod', N'Нижегородская филармония',   N'Кремль, 3, Нижний Новгород'),
        (N'nizhniy-novgorod', N'Club Stalker',                N'улица Родионова, 165, Нижний Новгород'),
        (N'nizhniy-novgorod', N'Дворец спорта «Нагорный»',    N'набережная Оки, 14, Нижний Новгород'),

        (N'krasnodar',        N'Краснодар Expo',              N'улица 40-летия Победы, 33, Краснодар'),
        (N'krasnodar',        N'Баскет-холл',                 N'улица Зиповская, 5, Краснодар'),
        (N'krasnodar',        N'Филармония',                  N'улица Красная, 35, Краснодар');

    INSERT INTO dbo.[Venues] ([CityId], [Name], [Address])
    SELECT c.[CityId], s.[Name], s.[Address]
    FROM @VenueSeed AS s
    INNER JOIN @CityIds AS c ON c.[Slug] = s.[CitySlug]
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.[Venues] AS v
        WHERE v.[CityId] = c.[CityId]
          AND v.[Name] = s.[Name]
    );

    SET @VenuesAdded = @@ROWCOUNT;

    DECLARE @VenueIds TABLE (
        [CitySlug] NVARCHAR(100) NOT NULL,
        [VenueName] NVARCHAR(200) NOT NULL,
        [VenueId]  INT NOT NULL,
        PRIMARY KEY ([CitySlug], [VenueName])
    );

    INSERT INTO @VenueIds ([CitySlug], [VenueName], [VenueId])
    SELECT c.[Slug], v.[Name], v.[Id]
    FROM dbo.[Venues] AS v
    INNER JOIN @CityIds AS c ON c.[CityId] = v.[CityId]
    INNER JOIN @VenueSeed AS s ON s.[CitySlug] = c.[Slug] AND s.[Name] = v.[Name];

    IF (SELECT COUNT(*) FROM @VenueIds) <> 12
    BEGIN
        THROW 50002, N'Ожидалось 12 площадок (3 × 4 города). Проверьте этап 2.', 1;
    END;

    /* =========================================================================
       Этап 3 — концерты (по 5 на город), артисты и билеты
       ========================================================================= */

    DECLARE @ConcertSeed TABLE (
        [Slug]        NVARCHAR(300)      NOT NULL PRIMARY KEY,
        [CitySlug]    NVARCHAR(100)      NOT NULL,
        [VenueName]   NVARCHAR(200)      NOT NULL,
        [Title]       NVARCHAR(300)      NOT NULL,
        [StartsAt]    DATETIMEOFFSET(0)  NOT NULL,
        [ImageUrl]    NVARCHAR(1000)     NOT NULL,
        [Description] NVARCHAR(4000)     NOT NULL,
        [ArtistSlug]  NVARCHAR(200)      NOT NULL
    );

    INSERT INTO @ConcertSeed (
        [Slug], [CitySlug], [VenueName], [Title], [StartsAt], [ImageUrl], [Description], [ArtistSlug]
    ) VALUES
        /* Казань */
        (N'skriptonit-kazan-arena-2026',       N'kazan', N'Kazan Arena',             N'Скриптонит — Kazan Arena',
            CAST(N'2026-08-15T20:00:00+03:00' AS DATETIMEOFFSET(0)),
            N'https://picsum.photos/seed/rurave-kzn-c01/800/450', N'Большой сольный концерт на Kazan Arena.', N'skriptonit'),
        (N'zivert-tavrida-kazan-2026',         N'kazan', N'Клуб «Таврида»',         N'Zivert Live',
            CAST(N'2026-06-20T19:00:00+03:00' AS DATETIMEOFFSET(0)),
            N'https://picsum.photos/seed/rurave-kzn-c02/800/450', N'Поп-шоу в клубе «Таврида».', N'zivert'),
        (N'nina-kraviz-pyramid-kazan-2026',    N'kazan', N'Pyramid RTC',             N'Nina Kraviz — Pyramid',
            CAST(N'2026-10-10T23:00:00+03:00' AS DATETIMEOFFSET(0)),
            N'https://picsum.photos/seed/rurave-kzn-c03/800/450', N'Техно-ночь в Pyramid RTC.', N'nina-kraviz'),
        (N'basta-kazan-arena-2026',            N'kazan', N'Kazan Arena',             N'Баста — Arena Show',
            CAST(N'2026-11-28T19:00:00+03:00' AS DATETIMEOFFSET(0)),
            N'https://picsum.photos/seed/rurave-kzn-c04/800/450', N'Арена-шоу Басты в Казани.', N'basta'),
        (N'dk-tavrida-kazan-2026',             N'kazan', N'Клуб «Таврида»',         N'DK — Kazan Night',
            CAST(N'2026-09-05T22:00:00+03:00' AS DATETIMEOFFSET(0)),
            N'https://picsum.photos/seed/rurave-kzn-c05/800/450', N'Электронный сет DK в «Тавриде».', N'dk'),

        /* Екатеринбург */
        (N'husky-uralochka-ekb-2026',          N'ekaterinburg', N'Дворец спорта «Уралочка»', N'Хаски — Уралочка',
            CAST(N'2026-07-18T20:00:00+05:00' AS DATETIMEOFFSET(0)),
            N'https://picsum.photos/seed/rurave-ekb-c01/800/450', N'Сольный концерт Хаски во Дворце спорта.', N'husky'),
        (N'zemfira-philharmonic-ekb-2026',     N'ekaterinburg', N'Свердловская филармония',   N'Земфира. Акустика',
            CAST(N'2026-09-14T19:00:00+05:00' AS DATETIMEOFFSET(0)),
            N'https://picsum.photos/seed/rurave-ekb-c02/800/450', N'Акустический вечер в филармонии.', N'zemfira'),
        (N'mot-teleclub-ekb-2026',             N'ekaterinburg', N'Tele-Club',                 N'MOT Live',
            CAST(N'2026-06-08T20:00:00+05:00' AS DATETIMEOFFSET(0)),
            N'https://picsum.photos/seed/rurave-ekb-c03/800/450', N'Живой концерт MOT в Tele-Club.', N'mot'),
        (N'lsp-uralochka-ekb-2026',            N'ekaterinburg', N'Дворец спорта «Уралочка»', N'ЛСП — Екатеринбург',
            CAST(N'2026-10-25T19:00:00+05:00' AS DATETIMEOFFSET(0)),
            N'https://picsum.photos/seed/rurave-ekb-c04/800/450', N'Сольник ЛСП на большой площадке.', N'lsp'),
        (N'nina-kraviz-teleclub-ekb-2026',     N'ekaterinburg', N'Tele-Club',                 N'Nina Kraviz — Ural Session',
            CAST(N'2026-12-12T23:30:00+05:00' AS DATETIMEOFFSET(0)),
            N'https://picsum.photos/seed/rurave-ekb-c05/800/450', N'Ночная техно-сессия в Tele-Club.', N'nina-kraviz'),

        /* Нижний Новгород */
        (N'lida-stalker-nn-2026',               N'nizhniy-novgorod', N'Club Stalker',            N'Lida SuperStar',
            CAST(N'2026-07-05T19:30:00+03:00' AS DATETIMEOFFSET(0)),
            N'https://picsum.photos/seed/rurave-nn-c01/800/450', N'Сольный концерт Lida в Club Stalker.', N'lida'),
        (N'feduk-philharmonic-nn-2026',        N'nizhniy-novgorod', N'Нижегородская филармония', N'Feduk Live',
            CAST(N'2026-08-22T20:00:00+03:00' AS DATETIMEOFFSET(0)),
            N'https://picsum.photos/seed/rurave-nn-c02/800/450', N'Концерт Feduk в филармонии.', N'feduk'),
        (N'miyagi-nagorny-nn-2026',            N'nizhniy-novgorod', N'Дворец спорта «Нагорный»', N'Miyagi & Эндшпиль',
            CAST(N'2026-09-27T19:00:00+03:00' AS DATETIMEOFFSET(0)),
            N'https://picsum.photos/seed/rurave-nn-c03/800/450', N'Хип-хоп вечер на «Нагорном».', N'miyagi'),
        (N'pharaoh-stalker-nn-2026',           N'nizhniy-novgorod', N'Club Stalker',            N'Pharaoh Live',
            CAST(N'2026-11-01T20:00:00+03:00' AS DATETIMEOFFSET(0)),
            N'https://picsum.photos/seed/rurave-nn-c04/800/450', N'Рэп-концерт Pharaoh.', N'pharaoh'),
        (N'mukka-philharmonic-nn-2026',       N'nizhniy-novgorod', N'Нижегородская филармония', N'Мукка',
            CAST(N'2026-05-24T19:00:00+03:00' AS DATETIMEOFFSET(0)),
            N'https://picsum.photos/seed/rurave-nn-c05/800/450', N'Поп-концерт Мукка в филармонии.', N'mukka'),

        /* Краснодар */
        (N'skriptonit-expo-krasnodar-2026',    N'krasnodar', N'Краснодар Expo',              N'Скриптонит — Expo',
            CAST(N'2026-08-02T20:00:00+03:00' AS DATETIMEOFFSET(0)),
            N'https://picsum.photos/seed/rurave-krd-c01/800/450', N'Сольник Скриптонита на Expo.', N'skriptonit'),
        (N'kis-kis-baskethall-krasnodar-2026', N'krasnodar', N'Баскет-холл',                 N'Кис-Кис. Акустика',
            CAST(N'2026-06-12T20:00:00+03:00' AS DATETIMEOFFSET(0)),
            N'https://picsum.photos/seed/rurave-krd-c02/800/450', N'Камерный концерт в Баскет-холле.', N'kis-kis'),
        (N'basta-expo-krasnodar-2026',         N'krasnodar', N'Краснодар Expo',              N'Баста — Юг',
            CAST(N'2026-10-17T19:00:00+03:00' AS DATETIMEOFFSET(0)),
            N'https://picsum.photos/seed/rurave-krd-c03/800/450', N'Большое шоу Басты в Краснодаре.', N'basta'),
        (N'zivert-philharmonic-krasnodar-2026', N'krasnodar', N'Филармония',                 N'Zivert — Super Tour',
            CAST(N'2026-07-26T19:00:00+03:00' AS DATETIMEOFFSET(0)),
            N'https://picsum.photos/seed/rurave-krd-c04/800/450', N'Поп-шоу Zivert в филармонии.', N'zivert'),
        (N'dk-baskethall-krasnodar-2026',      N'krasnodar', N'Баскет-холл',                 N'DK — Krasnodar Rave',
            CAST(N'2026-11-21T22:00:00+03:00' AS DATETIMEOFFSET(0)),
            N'https://picsum.photos/seed/rurave-krd-c05/800/450', N'Ночной электронный сет DK.', N'dk');

    DECLARE @InsertedConcerts TABLE (
        [ConcertId]   INT            NOT NULL PRIMARY KEY,
        [Slug]        NVARCHAR(300)  NOT NULL,
        [ArtistSlug]  NVARCHAR(200)  NOT NULL
    );

    INSERT INTO dbo.[Concerts] (
        [Title], [Slug], [StartsAt], [VenueId], [ImageUrl], [Description], [Status]
    )
    SELECT
        s.[Title],
        s.[Slug],
        s.[StartsAt],
        v.[VenueId],
        s.[ImageUrl],
        s.[Description],
        1 /* Published */
    FROM @ConcertSeed AS s
    INNER JOIN @VenueIds AS v
        ON v.[CitySlug] = s.[CitySlug]
       AND v.[VenueName] = s.[VenueName]
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.[Concerts] AS c WHERE c.[Slug] = s.[Slug]
    );

    SET @ConcertsAdded = @@ROWCOUNT;

    INSERT INTO @InsertedConcerts ([ConcertId], [Slug], [ArtistSlug])
    SELECT c.[Id], c.[Slug], s.[ArtistSlug]
    FROM dbo.[Concerts] AS c
    INNER JOIN @ConcertSeed AS s ON s.[Slug] = c.[Slug];

    INSERT INTO dbo.[ConcertArtists] ([ConcertId], [ArtistId], [DisplayOrder], [IsHeadliner])
    SELECT ic.[ConcertId], a.[Id], 0, 1
    FROM @InsertedConcerts AS ic
    INNER JOIN dbo.[Artists] AS a ON a.[Slug] = ic.[ArtistSlug]
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.[ConcertArtists] AS ca
        WHERE ca.[ConcertId] = ic.[ConcertId]
          AND ca.[ArtistId] = a.[Id]
    );

    SET @ArtistLinksAdded = @@ROWCOUNT;

    INSERT INTO dbo.[TicketCategories] ([ConcertId], [Name], [Price], [SortOrder], [IsActive])
    SELECT ic.[ConcertId], N'Стандарт', 2800.00, 1, 1
    FROM @InsertedConcerts AS ic
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.[TicketCategories] AS tc
        WHERE tc.[ConcertId] = ic.[ConcertId] AND tc.[SortOrder] = 1
    );

    SET @TicketRowsAdded = @@ROWCOUNT;

    INSERT INTO dbo.[TicketCategories] ([ConcertId], [Name], [Price], [SortOrder], [IsActive])
    SELECT ic.[ConcertId], N'Партер', 4200.00, 2, 1
    FROM @InsertedConcerts AS ic
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.[TicketCategories] AS tc
        WHERE tc.[ConcertId] = ic.[ConcertId] AND tc.[SortOrder] = 2
    );

    SET @TicketRowsAdded += @@ROWCOUNT;

    COMMIT TRANSACTION;

    PRINT N'';
    PRINT N'RuRave — SeedAdditionalCities: успешно.';
    PRINT N'  Городов добавлено:     ' + CAST(@CitiesAdded AS NVARCHAR(10));
    PRINT N'  Площадок добавлено:    ' + CAST(@VenuesAdded AS NVARCHAR(10));
    PRINT N'  Концертов добавлено:   ' + CAST(@ConcertsAdded AS NVARCHAR(10));
    PRINT N'  Связей с артистами:    ' + CAST(@ArtistLinksAdded AS NVARCHAR(10));
    PRINT N'  Категорий билетов:     ' + CAST(@TicketRowsAdded AS NVARCHAR(10));
    PRINT N'';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
    DECLARE @ErrNum INT = ERROR_NUMBER();
    DECLARE @ErrLine INT = ERROR_LINE();

    PRINT N'';
    PRINT N'RuRave — SeedAdditionalCities: ошибка, откат транзакции.';
    PRINT N'  Номер: ' + CAST(@ErrNum AS NVARCHAR(10)) + N', строка: ' + CAST(@ErrLine AS NVARCHAR(10));
    PRINT N'  ' + @ErrMsg;
    PRINT N'';

    THROW;
END CATCH;
GO
