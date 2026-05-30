# UI — журнал внедрения

Фиксируйте здесь **фактические** решения при выполнении этапов: отклонения от плана, уточнённые значения токенов, product-выборы.

Формат записи:

```markdown
## YYYY-MM-DD — Этап N: краткое название

**Контекст:** что делали  
**Решения:**
- …
**Отклонения от UI-DESIGN-SYSTEM.md:** нет / описание  
**Файлы:** список  
```

---

## Записи

## 2026-05-30 — Этап 0: семантические токены и layout

**Контекст:** фундамент дизайн-системы перед этапами 1–11.

**Решения:**
- Примитивы `--c-*` остаются в `:root`; семантика — в `[data-theme="dark"]`.
- На `<html>` выставлен `data-theme="dark"` (переключатель — этап 11).
- `--border-default` через `rgba(160, 164, 184, 0.35)`, не сплошной `--c-lighter`.
- Добавлен `--accent-link` для этапа 11.
- Утилиты `.layout-container`, `.section-spacing`; контент HomePage (кроме Banner) в обёртке.
- `body` и `.App` — flex column, `min-height: 100vh`.
- HomePage переведён на `--bg-page`, `--text-primary` для статусов и retry.

**Отклонения от UI-DESIGN-SYSTEM.md:** нет. Остальные компоненты пока на `--c-*` (постепенная миграция).

**Файлы:** `src/App.css`, `index.html`, `src/pages/HomePage/HomePage.jsx`, `src/pages/HomePage/HomePage.css`

## 2026-05-30 — Этап 1: быстрые исправления

**Контекст:** баги CSS и мелкий UX без сетки/skeleton/тем.

**Решения:**
- Header: `flex` — logo слева, nav `flex: 1` по центру, Profile `margin-left: auto`; фон `--bg-elevated`, ссылки на семантических токенах.
- CitySelector: стили `.city-selector__item--selected` (фон `--accent-primary`, текст `--c-dark`).
- `.no-results` — карточка на `--bg-surface`, центр, max-width 28rem.
- Search: placeholder `--text-secondary`, ввод `--text-primary`.
- EventCard button: hover (заливка accent), `focus-visible`, `cursor: pointer`.
- `.home__retry`: hover/focus/active.

**Отклонения от UI-DESIGN-SYSTEM.md:** нет.

**Файлы:** `Header.css`, `CitySelector.css`, `Search.css`, `EventCard.css`, `HomePage.css`

## 2026-05-30 — Этап 2: карточки и адаптивная сетка

**Контекст:** EventCard, EventList, секция концертов на HomePage.

**Решения:**
- Grid: `repeat(auto-fill, minmax(280px, 1fr))`, gap `--r-spacing-lg`.
- Карточка `width: 100%`, `height: 100%` в ячейке; семантика `--bg-surface`, `--text-*`, `--accent-success`.
- Постер: `aspect-ratio: 16/9`, `object-fit: cover`; fallback `--bg-elevated` + класс `--fallback` при `onError`.
- Заголовок: без uppercase, `line-clamp: 2`, weight 600.
- Мета: `--fs-sm`, `--text-secondary`; иконки `alt=""`, постер `alt={title}`.
- EventList: валидная разметка `ul > li > article`.
- HomePage: секция «Концерты в {город}» + склонение count (1/2-4/5+ концертов); список только при `totalCount > 0`.

**Отклонения от UI-DESIGN-SYSTEM.md:** нет. `minmax(280px)` как в гайде.

**Файлы:** `EventCard.jsx`, `EventCard.css`, `EventList.jsx`, `EventList.css`, `HomePage.jsx`, `HomePage.css`

## 2026-05-30 — Этап 3: loading и пустые экраны

**Контекст:** skeleton вместо «Загрузка...», единый UI для empty/error.

**Решения:**
- `EventCardSkeleton` + `EventCardSkeletonList` (6 шт.) — та же grid `concerts__list`, shimmer `--bg-surface` / `--bg-elevated`.
- Loading: секция с `aria-busy`, без текста «Загрузка...».
- `HomeMessage` — общий блок для empty/error (SVG monochrome, title + hint + retry).
- Empty: поиск → hint «Измените запрос…»; город → «Смените город…».
- Error: `loadCities` через `useCallback`, retry без `window.location.reload()`.
- Удалены `.home__status`, `.no-results`, `.home__retry` из HomePage.css (стили в `HomeMessage`).

**Отклонения от UI-DESIGN-SYSTEM.md:** нет.

**Файлы:** `EventCardSkeleton/*`, `HomeMessage/*`, `HomePage.jsx`, `HomePage.css`

## 2026-05-30 — Этап 4: Search

**Контекст:** UX поиска, focus, debounce, адаптивная заготовка.

**Решения:**
- Debounce 400ms → `onSearch` при вводе; submit сразу + `clearTimeout`.
- Radius `--r-radius` на контейнере, input, button.
- `focus-within` на контейнере; `focus-visible` на кнопке.
- Disabled: `opacity: 0.6`, `cursor: not-allowed`.
- Layout: row desktop; `@media (max-width: 768px)` column; модификаторы `--row` / `--stacked`.
- `type="search"`, `aria-label="Поиск исполнителя"`.
- Фон полосы поиска: `--bg-page`, border `--border-default`.

**Отклонения от UI-DESIGN-SYSTEM.md:** нет.

**Файлы:** `Search.jsx`, `Search.css`

## 2026-05-30 — Этап 5: Header и навигация

**Контекст:** sticky, NavLink, разметка, заготовка под theme toggle.

**Решения:**
- `<header>` + `position: sticky`, `border-bottom: var(--border-default)`.
- `NavLink` с `header__page-link--active` (фон accent, текст `--c-dark`); Home с `end`.
- Бренд: один `NavLink` — logo + «Ru»/«Rave» в `<span>`.
- Nav без `<p>`; `<nav aria-label>`.
- `:active scale(0.98)`, `focus-visible` на ссылках.
- `header__theme-toggle` — скрытый placeholder 2.5rem (этап 11).
- Mobile: уменьшенные fs logo/title/nav.

**Отклонения от UI-DESIGN-SYSTEM.md:** нет.

**Файлы:** `Header.jsx`, `Header.css`

## 2026-05-30 — Этап 6: Banner

**Контекст:** адаптив, градиент к `--bg-page`, a11y.

**Решения:**
- Высота `clamp(12rem, 25vw, 20rem)` на image и `min-height` контейнера.
- Overlay `::after`: gradient → `var(--bg-page)`.
- `loading="lazy"`, `alt` из props (default «RuRave — афиша»).
- `onError`: скрыть img, остаётся `--bg-elevated`.
- `object-position: center`.

**Отклонения от UI-DESIGN-SYSTEM.md:** нет.

**Файлы:** `Banner.jsx`, `Banner.css`, `HomePage.jsx`

## 2026-05-30 — Этап 7: типографика

**Контекст:** единая шкала fs/lh, lang, title.

**Решения:**
- В `App.css`: комментарий ролей, `--lh-tight`, `--lh-normal`; body `--fs-md` + `--lh-normal`.
- Header brand: `--fs-xl` desktop, `--fs-lg` mobile; nav `--fs-md`.
- EventCard: title `--fs-lg`/`--lh-tight`, meta `--fs-sm`/`--lh-normal`.
- HomePage H1 секции: `--fs-xl`/`--lh-tight`, count `--fs-sm`.
- CitySelector arrow → `--fs-xs`.
- `index.html`: `lang="ru"`, title «RuRave — концерты».

**Отклонения от UI-DESIGN-SYSTEM.md:** нет.

**Файлы:** `App.css`, `Header.css`, `EventCard.css`, `HomePage.css`, `CitySelector.css`, `index.html`

## 2026-05-30 — Этап 8: доступность

**Контекст:** focus, модалка городов, skip link, семантика форм.

**Решения:**
- Глобальные `:focus-visible` / `:focus:not(:focus-visible)`; утилиты `.sr-only`, `.skip-link`.
- `App.jsx`: skip link → `#main-content`, `<main tabIndex={-1}>`.
- CitySelector: dialog ARIA, Escape, focus search on open / trigger on close, `aria-expanded`, пункты — `<button role="option">`.
- Search: `sr-only` label + `aria-label` на form; id `artist-search`.
- EventCard: `aria-label` на кнопке «Подробнее» (иконки уже `alt=""`).

**Отклонения от UI-DESIGN-SYSTEM.md:** нет.

**Файлы:** `App.css`, `App.jsx`, `CitySelector.jsx`, `CitySelector.css`, `Search.jsx`, `EventCard.jsx`

## 2026-05-30 — Этап 9: адаптивная вёрстка

**Контекст:** breakpoints, mobile header/search/grid.

**Решения:**
- `--bp-sm/md/lg` в `:root`; `overflow-x: hidden` на `.App`.
- Search `<768px`: column, city trigger 100% width, touch 2.75rem (44px).
- Header: burger + slide-in panel (overlay как CitySelector), desktop nav скрыт; Profile + theme справа; Escape.
- EventList `<480px`: `grid-template-columns: 1fr`.
- Banner `<480px`: clamp `12rem–16rem`, проверка 320px.

**Отклонения от UI-DESIGN-SYSTEM.md:** нет.

**Файлы:** `App.css`, `Header.jsx`, `Header.css`, `Search.css`, `EventList.css`, `Banner.css`

## 2026-05-30 — Этап 10: About и Profile

**Контекст:** второстепенные страницы в едином стиле с Home.

**Решения:**
- `PageLayout`: `.page` + `.layout-container` + `.page__card`; `min-height: calc(100vh - var(--header-height))`.
- `--header-height: 4.5rem` в `:root`; `#main-content` flex 1.
- About: текст о сервисе (RU), ссылка «На главную».
- Profile: placeholder входа + hint; та же карточка.
- Роуты в `pages/AboutPage/`, `pages/ProfilePage/`.

**Отклонения от UI-DESIGN-SYSTEM.md:** нет.

**Файлы:** `PageLayout/*`, `AboutPage/*`, `ProfilePage/*`, `App.jsx`, `App.css`

## 2026-05-30 — Этап 11: тёмная и светлая тема

**Контекст:** `data-theme` dark/light, ThemeContext, переключатель в Header.

**Решения:**
- `ThemeContext`: localStorage `rurave-theme`, prefers-color-scheme, meta theme-color.
- Anti-flash script в `index.html` до React.
- Dark: `--bg-page #1e1428` (чуть светлее violet-dark); light: лавандовый `#f0edf5`, акценты затемнены.
- Семантика расширена: `--text-on-accent`, `--overlay-bg`, `--city-trigger-*`, `--input-bg`, `--card-border`, `--bg-header`.
- CitySelector, EventCard, Search, Header, overlays мигрированы на токены.
- Header: кнопка ☀️/🌙, `aria-pressed`, `aria-label`.

**Отклонения от UI-DESIGN-SYSTEM.md:** dark `--bg-page` обновлён до `#1e1428` по спецификации этапа (было `--c-violet-dark`).

**Файлы:** `context/ThemeContext.jsx`, `App.css`, `index.html`, `main.jsx`, `Header.jsx`, `Header.css`, `CitySelector.css`, `EventCard.css`, `Search.css`, `HomeMessage.css`, `PageLayout.css`

## 2026-05-30 — MVP: страница концерта и покупка (заглушка)

**Контекст:** ядро MVP — сквозной сценарий афиша → детали → «купить билет».

**Решения:**
- `ConcertPage` `/concert/:id`: hero 16/9, мета, описание, список билетов, CTA; skeleton и `HomeMessage` при ошибке.
- `getConcertById` + `mapConcertDetailToView` в `client.js`.
- `EventCard`: `Link` на `/concert/${id}` с классом кнопки.
- `BuyTicketModal`: overlay как у CitySelector, Escape, focus на «Понятно».
- Header nav: Афиша / О проекте / Профиль; About — текст про MVP.

**Отклонения от UI-DESIGN-SYSTEM.md:** CTA «Купить билет» — зелёный filled (accent-success), не outline violet — выделение primary action на странице деталей.

**Файлы:** `ConcertPage/*`, `BuyTicketModal/*`, `client.js`, `EventCard.jsx`, `EventCard.css`, `App.jsx`, `Header.jsx`, `AboutPage.jsx`

## 2026-05-30 — Этап 7: карта OpenStreetMap на странице концерта

**Контекст:** post-MVP — виджет карты по адресу площадки, без админки и геокодинга на бэкенде.

**Решения:**
- API: `venueAddress`, `mapSearchQuery` в `ConcertDetailDto`; сборка строки в `ConcertMapSearchQuery.Build`.
- Frontend: `VenueMap` — Leaflet + react-leaflet, тайлы OSM, Nominatim с `User-Agent` и кэшем `sessionStorage`.
- Fallback: ссылка «Открыть в OpenStreetMap» при ошибке/пустом ответе геокодера.
- Блок «На карте» на `ConcertPage` после мета, перед описанием.
- `BuyTicketModal` не менялся.

**Отклонения от UI-DESIGN-SYSTEM.md:** тайлы OSM светлые и в тёмной теме (приемлемо для MVP).

**Файлы:** `ConcertDetailDto.cs`, `ConcertMapSearchQuery.cs`, `ConcertReadService.cs`, тесты API, `VenueMap/*`, `geocode.js`, `ConcertPage.jsx`, `client.js`, `package.json`, `.env.example`, `rurave-api/README.md`
