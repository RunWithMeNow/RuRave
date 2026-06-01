-- Обновление ImageUrl для всех городов с фото в public/cities/
SET NOCOUNT ON;

UPDATE [Cities] SET [ImageUrl] = N'/cities/moskva.webp'          WHERE [Slug] = N'moskva';
UPDATE [Cities] SET [ImageUrl] = N'/cities/sankt-peterburg.webp' WHERE [Slug] = N'sankt-peterburg';
UPDATE [Cities] SET [ImageUrl] = N'/cities/novosibirsk.webp'     WHERE [Slug] = N'novosibirsk';
UPDATE [Cities] SET [ImageUrl] = N'/cities/kazan.jpg'            WHERE [Slug] = N'kazan';
UPDATE [Cities] SET [ImageUrl] = N'/cities/ekaterinburg.jpg'    WHERE [Slug] = N'ekaterinburg';
UPDATE [Cities] SET [ImageUrl] = N'/cities/nizhniy-novgorod.jpg' WHERE [Slug] = N'nizhniy-novgorod';
UPDATE [Cities] SET [ImageUrl] = N'/cities/krasnodar.webp'       WHERE [Slug] = N'krasnodar';

SELECT [Id], [Name], [Slug], [ImageUrl] FROM [Cities] ORDER BY [Id];
