/*
  RuRave — тестовые данные для RuRaveDB
  Запуск: SSMS или scripts/seed.ps1

  Перед вставкой очищает таблицы (порядок по FK).
  Статусы концертов: Draft=0, Published=1, Cancelled=2
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

USE [RuRaveDB];
GO

BEGIN TRANSACTION;

DELETE FROM [TicketCategories];
DELETE FROM [ConcertArtists];
DELETE FROM [Concerts];
DELETE FROM [Artists];
DELETE FROM [Venues];
DELETE FROM [Cities];

DBCC CHECKIDENT ('Cities', RESEED, 0);
DBCC CHECKIDENT ('Venues', RESEED, 0);
DBCC CHECKIDENT ('Artists', RESEED, 0);
DBCC CHECKIDENT ('Concerts', RESEED, 0);
DBCC CHECKIDENT ('TicketCategories', RESEED, 0);

-- Cities
SET IDENTITY_INSERT [Cities] ON;
INSERT INTO [Cities] ([Id], [Name], [Slug], [TimeZoneId]) VALUES
(1, N'Москва',              N'moskva',           N'Europe/Moscow'),
(2, N'Санкт-Петербург',     N'sankt-peterburg',  N'Europe/Moscow'),
(3, N'Новосибирск',         N'novosibirsk',      N'Asia/Novosibirsk');
SET IDENTITY_INSERT [Cities] OFF;

-- Venues
SET IDENTITY_INSERT [Venues] ON;
INSERT INTO [Venues] ([Id], [CityId], [Name], [Address]) VALUES
(1, 1, N'Циркус',           N'Цветной бульвар, 13, Москва'),
(2, 1, N'Stadium Live',     N'Ленинградский проспект, 80, Москва'),
(3, 1, N'ВТБ Арена',        N'Ленинградский проспект, 36, Москва'),
(4, 2, N'Эрмитаж',          N'Дворцовая наб., 2, Санкт-Петербург'),
(5, 2, N'А2',               N'пр. Медиков, 3, Санкт-Петербург'),
(6, 3, N'LUXOR',            N'ул. Челюскинцев, 21, Новосибирск');
SET IDENTITY_INSERT [Venues] OFF;

-- Artists
SET IDENTITY_INSERT [Artists] ON;
INSERT INTO [Artists] ([Id], [Name], [Slug]) VALUES
(1, N'DK',           N'dk'),
(2, N'Lida',         N'lida'),
(3, N'Скриптонит',   N'skriptonit'),
(4, N'Земфира',      N'zemfira'),
(5, N'MORGENSHTERN', N'morgenshtern');
SET IDENTITY_INSERT [Artists] OFF;

-- Concerts (StartsAt с offset по часовому поясу города)
SET IDENTITY_INSERT [Concerts] ON;
INSERT INTO [Concerts] ([Id], [Title], [Slug], [StartsAt], [VenueId], [ImageUrl], [Status]) VALUES
(1,  N'DCOnTour',              N'dc-on-tour-moscow-2026',       '2026-12-12T20:00:00+03:00', 1, N'https://picsum.photos/seed/dcontour/800/450',   1),
(2,  N'LidaSuperStar',         N'lida-superstar-spb-2026',      '2026-07-17T19:30:00+03:00', 4, N'https://picsum.photos/seed/lida/800/450',       1),
(3,  N'Скриптонит Live',       N'skriptonit-moscow-2026',       '2026-09-20T20:00:00+03:00', 2, N'https://picsum.photos/seed/skriptonit/800/450', 1),
(4,  N'Земфира. Акустика',     N'zemfira-spb-2026',            '2026-10-05T19:00:00+03:00', 5, N'https://picsum.photos/seed/zemfira/800/450',      1),
(5,  N'DK — Новосибирск',      N'dk-novosibirsk-2027',         '2027-01-15T19:00:00+07:00', 6, N'https://picsum.photos/seed/dk-nsk/800/450',      1),
(6,  N'Festival Night',        N'festival-night-moscow',       '2026-08-30T18:00:00+03:00', 3, N'https://picsum.photos/seed/festival/800/450',     1),
(7,  N'Черновик (не в ленте)', N'draft-internal',              '2026-11-01T20:00:00+03:00', 1, N'https://picsum.photos/seed/draft/800/450',        0),
(8,  N'Отменённый концерт',   N'cancelled-show',              '2026-06-01T20:00:00+03:00', 2, N'https://picsum.photos/seed/cancelled/800/450',    2);
SET IDENTITY_INSERT [Concerts] OFF;

-- ConcertArtists (несколько артистов на концерт 6)
INSERT INTO [ConcertArtists] ([ConcertId], [ArtistId], [DisplayOrder], [IsHeadliner]) VALUES
(1, 1, 0, 1),
(2, 2, 0, 1),
(3, 3, 0, 1),
(4, 4, 0, 1),
(5, 1, 0, 1),
(6, 1, 0, 1),
(6, 5, 1, 0),
(7, 3, 0, 1),
(8, 2, 0, 1);

-- TicketCategories (minPrice = min активных Price)
INSERT INTO [TicketCategories] ([ConcertId], [Name], [Price], [SortOrder], [IsActive]) VALUES
-- DCOnTour: min 3000
(1, N'Танцпол',  3000.00, 1, 1),
(1, N'Партер',   5000.00, 2, 1),
(1, N'VIP',      8000.00, 3, 1),
(1, N'Backstage',10000.00, 4, 0),
-- LidaSuperStar
(2, N'Стандарт', 3000.00, 1, 1),
(2, N'Партер',   4500.00, 2, 1),
-- Скриптонит
(3, N'Фан-зона', 2500.00, 1, 1),
(3, N'Трибуна',  4000.00, 2, 1),
-- Земфира
(4, N'Партер',   3500.00, 1, 1),
-- DK Новосибирск
(5, N'Стандарт', 2800.00, 1, 1),
(5, N'VIP',      6000.00, 2, 1),
-- Festival (два артиста)
(6, N'Танцпол',  4000.00, 1, 1),
(6, N'Партер',   7000.00, 2, 1),
(6, N'VIP',      12000.00, 3, 1);

COMMIT TRANSACTION;

PRINT N'Готово: тестовые данные загружены в RuRaveDB.';
PRINT N'  Города: 3, площадки: 6, артисты: 5, концерты: 8 (6 Published, 1 Draft, 1 Cancelled)';
GO
