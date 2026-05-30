# RuRave API

Бэкенд сервиса концертов RuRave (ASP.NET Core 8, Clean Architecture, EF Core, MSSQL).

## Требования

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- SQL Server: **LocalDB**, полноценный MSSQL или Docker (см. ниже)
- [dotnet-ef](https://learn.microsoft.com/en-us/ef/core/cli/dotnet) 8.x:
  ```bash
  dotnet tool install --global dotnet-ef
  ```

## Быстрый старт (< 15 мин)

```bash
cd rurave-api
dotnet restore
```

1. Укажите строку подключения в `src/RuRave.Api/appsettings.Development.json` (см. [Настройка БД](#настройка-бд)).
2. Примените миграции и seed:
   ```bash
   dotnet ef database update --project src/RuRave.Infrastructure --startup-project src/RuRave.Api
   cd scripts
   .\seed.ps1
   ```
3. Запустите API:
   ```bash
   dotnet run --project src/RuRave.Api
   ```
4. Откройте Swagger: **https://localhost:7097/swagger** (профиль `https`, по умолчанию в VS) или **http://localhost:5080/swagger** (профиль `http`).
5. Запустите фронт с тем же URL в `VITE_API_BASE_URL` (см. `ruravefront/.env.example`).

## Структура solution

| Проект | Назначение |
|--------|------------|
| `RuRave.Domain` | Сущности, enum |
| `RuRave.Application` | DTO, интерфейсы read-сервисов, валидация |
| `RuRave.Infrastructure` | EF Core, миграции, `CityReadService`, `ConcertReadService` |
| `RuRave.Api` | HTTP host, контроллеры, CORS, Swagger |
| `tests/RuRave.Tests` | Интеграционные тесты (SQL Server) |

## Настройка БД

`ConnectionStrings:DefaultConnection` в `src/RuRave.Api/appsettings.Development.json`.

**Пример (Windows Auth, локальный сервер):**

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=DESKTOP-G67DLTD;Database=RuRaveDB;Trusted_Connection=true;TrustServerCertificate=true;MultipleActiveResultSets=true"
}
```

**LocalDB:**

```json
"DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=RuRave;Trusted_Connection=True;MultipleActiveResultSets=true"
```

**Docker MSSQL:**

```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=Your_password123" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest
```

```json
"DefaultConnection": "Server=localhost,1433;Database=RuRave;User Id=sa;Password=Your_password123;TrustServerCertificate=True"
```

### Миграции

```bash
dotnet ef database update --project src/RuRave.Infrastructure --startup-project src/RuRave.Api
```

Новая миграция после изменения модели:

```bash
dotnet ef migrations add <Name> --project src/RuRave.Infrastructure --startup-project src/RuRave.Api --output-dir Persistence/Migrations
```

### Индексы (производительность)

Созданы в миграции `InitialCreate` (отдельная миграция не требуется):

| Таблица | Индекс |
|---------|--------|
| `Venues` | `CityId` |
| `Concerts` | `(Status, StartsAt)` |
| `ConcertArtists` | `ArtistId` |
| `TicketCategories` | `ConcertId` |

Дополнительно: уникальные `Slug` на `Cities`, `Artists`, `Concerts`.

## Тестовые данные (seed)

`scripts/SeedTestData.sql` — T-SQL: table variables, `TRY/CATCH`, `DATETIMEOFFSET`; очищает таблицы и вставляет демо-данные. В SSMS выберите базу **RuRaveDB** (или раскомментируйте `USE [RuRaveDB]` в скрипте). Удобнее: `seed.ps1`.

**Города:** Москва, Санкт-Петербург, Новосибирск (+ данные для тестов в seed).

**Примеры концертов:** DCOnTour (DK, Циркус), LidaSuperStar (Эрмитаж), Festival Night (2 артиста), черновики и отменённые (не в API-ленте).

```powershell
cd scripts
.\seed.ps1
.\seed.ps1 -Server "YOUR_SERVER" -Database "RuRaveDB"
```

Требуется `sqlcmd` (флаги `-C`, для кириллицы скрипт сам задаёт UTF-8 через `-f i:65001`).

**Кириллица в БД «кракозябрами»:** перезапустите seed через `.\seed.ps1` — не вызывайте `sqlcmd -i SeedTestData.sql` без кодовой страницы UTF-8. В SSMS открывайте `.sql` как UTF-8 with signature.

## Запуск API

```bash
dotnet build
dotnet run --project src/RuRave.Api
# или явно:
dotnet run --project src/RuRave.Api --launch-profile https
dotnet run --project src/RuRave.Api --launch-profile http
```

| Профиль | Swagger | API base |
|---------|---------|----------|
| **https** (по умолчанию) | https://localhost:7097/swagger | `https://localhost:7097` |
| **http** | http://localhost:5080/swagger | `http://localhost:5080` |

Порты в `src/RuRave.Api/Properties/launchSettings.json`. Для HTTPS: `dotnet dev-certs https --trust`.

## HTTP API

JSON — **camelCase** (`id`, `imageUrl`, `startsAt`, `minPrice`, …).

### `GET /api/cities`

Список городов, сортировка по `name`.

**Ответ 200:**

```json
[
  { "id": 1, "name": "Москва", "slug": "moskva" }
]
```

### `GET /api/concerts`

| Query | Обязательный | По умолчанию | Описание |
|-------|--------------|--------------|----------|
| `cityId` | **Да** | — | ID города (> 0) |
| `search` | Нет | — | Поиск по `title` и имени артиста (регистронезависимо, `LIKE`) |
| `page` | Нет | `1` | Номер страницы (≥ 1) |
| `pageSize` | Нет | `20` | Размер страницы (1–50) |

Только концерты со статусом **Published** и хотя бы одной активной категорией билетов. `minPrice` — минимум цен активных `TicketCategories`.

**Ответ 200:**

```json
{
  "items": [
    {
      "id": 1,
      "imageUrl": "https://...",
      "title": "DCOnTour",
      "startsAt": "2026-12-12T20:00:00+03:00",
      "place": "Циркус",
      "artists": ["DK"],
      "artistDisplay": "DK",
      "minPrice": 3000
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 1
}
```

**Ошибки:** RFC 7807 Problem Details — **400** (нет/неверный `cityId`, `page`, `pageSize`), **404** (город не найден).

### `GET /api/concerts/{id}`

Один опубликованный концерт с активными категориями билетов (те же правила, что у списка).

**Ответ 200:**

```json
{
  "id": 1,
  "imageUrl": "https://...",
  "title": "DCOnTour",
  "description": "Тур DK по клубам Москвы...",
  "startsAt": "2026-12-12T20:00:00+03:00",
  "place": "Циркус",
  "venueAddress": "Цветной бульвар, 13, Москва",
  "mapSearchQuery": "Москва, Цветной бульвар, 13, Москва",
  "cityId": 1,
  "cityName": "Москва",
  "artists": ["DK"],
  "artistDisplay": "DK",
  "minPrice": 3000,
  "ticketCategories": [
    { "name": "Танцпол", "price": 3000, "sortOrder": 1 }
  ]
}
```

**Ошибки:** **404** (концерт не найден, черновик, отменён, нет активных билетов).

## CORS и фронтенд

Разрешены origin Vite dev-сервера: `localhost` / `127.0.0.1` на портах **5173**, 5174, 4173.

Фронт: `VITE_API_BASE_URL` должен **совпадать** с профилем API (часто `https://localhost:7097`, см. `ruravefront/.env.example`).

Если CORS с кодом `(null)` — API не запущен или неверный URL в `.env`. Проверьте Swagger на том же host/port, что в `.env`.

## Тесты

```bash
dotnet test
```

18+ тестов: read-сервисы + HTTP (`/api/cities`, `/api/concerts`, `/api/concerts/{id}`). Используют SQL Server; сервер по умолчанию в `tests/RuRave.Tests/appsettings.test.json` (`TestConnection:Server`). На каждый прогон — отдельная БД `RuRave_Test_*` / `RuRave_ApiTest_*`.

## Roadmap (вне MVP)

- Баннеры с API
- Админка CRUD
- Аутентификация и заказы
