# RuRave Frontend

Главная страница сервиса концертов (React + Vite). Данные с RuRave API.

## Требования

- Node.js 18+
- Запущенный [RuRave API](../rurave-api/README.md) с применёнными миграциями и seed

## Быстрый старт

### 1. Настройка API URL

```bash
cd ruravefront
copy .env.example .env
```

В `.env` укажите URL бэкенда (как в консоли при `dotnet run` / Visual Studio):

```
# профиль https (часто по умолчанию в VS):
VITE_API_BASE_URL=https://localhost:7097

# профиль http:
# VITE_API_BASE_URL=http://localhost:5080
```

Порт **7097** = HTTPS, **5080** = HTTP. Должен совпадать с `launchSettings.json`.

### 2. Установка зависимостей

```bash
npm install
```

### 3. Порядок запуска (важно)

1. **БД** — миграции + seed на бэкенде (`dotnet ef database update`, `scripts/seed.ps1`)
2. **API** — `dotnet run --project src/RuRave.Api` (из `rurave-api`)
3. **Фронт** — `npm run dev` → http://localhost:5173

```bash
npm run dev
```

## Проверка MVP

- При открытии загружаются города; по умолчанию выбрана **Москва**
- Список концертов меняется при смене города
- «Найти» отправляет `search` на API (например `DK`, `Lida`)
- Карточки: дата, площадка, артисты, «от N руб.»

При ошибке CORS проверьте, что API запущен и в `rurave-api` включён CORS для `http://localhost:5173`.

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер Vite |
| `npm run build` | Production-сборка |
| `npm run preview` | Просмотр сборки |

## Структура (главная)

- `src/api/client.js` — запросы к API
- `src/pages/HomePage/` — состояние загрузки, город, концерты
- `src/components/Search/`, `CitySelector/`, `EventList/`, `EventCard/`

Страница деталей концерта («Подробнее») — не реализована (см. roadmap в README API).
