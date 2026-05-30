# RuRave — Design System (UI)

Документ фиксирует **ключевые решения по интерфейсу** для масштабирования фронтенда.  
При добавлении страниц и компонентов опирайтесь на этот файл, а не на разовые договорённости в чате.

**Статус:** базовая линия (текущий код + запланированные этапы 0–11).  
**Стек:** React + Vite, CSS Modules не используются — **один CSS-файл на компонент** + глобальные токены в `src/App.css`.

---

## 1. Принципы

| Принцип | Решение |
|---------|---------|
| Бренд | Тёмная «клубная» эстетика: **фиолетовый + зелёный + синий акцент** |
| Стабильность hue | **Не менять оттенки** брендовых цветов при рефакторинге; менять только светлоту/роли (фон vs текст) |
| Токены | Примитивы `--c-*` + семантика `--bg-*`, `--text-*` (этап 0) |
| Темы | Dark (default) + Light с той же гаммой (этап 11) |
| Именование CSS | BEM-подобное: `block__element--modifier` (как в `event-card`, `header__page-link`) |
| Анимации | Сдержанные: `0.3s ease`, без тяжёлых parallax |
| Доступность | Видимый `:focus-visible`, модалки с Escape, контраст не ниже практики WCAG AA где возможно |
| Язык UI | Русский (`lang="ru"`), шрифт **Rubik** |

---

## 2. Цвета

### 2.1. Примитивы (не удалять)

Определены в `src/App.css`. Используются напрямую только там, где семантика ещё не внедрена; **новый код** — через семантику.

| Token | HEX | Роль в бренде |
|-------|-----|----------------|
| `--c-black` | `#0a0a0f` | Глубокий фон, header |
| `--c-dark` | `#0f0f1a` | Поверхности (карточки) |
| `--c-darker` | `#07070d` | Самый глубокий акцент фона |
| `--c-light` | `#e8eaf6` | Основной текст на тёмном |
| `--c-lighter` | `#a0a4b8` | Вторичный текст, границы |
| `--c-violet-dark` | `#2a1a3a` | Фон страницы / поля ввода |
| `--c-violet-light` | `#9b59b6` | Primary accent, hover nav |
| `--c-green` | `#2ecc71` | Цена, success |
| `--c-green-dark` | `#0e6b2e` | Pressed / тёмный вариант зелёного |
| `--c-blue-accent` | `#3498db` | Hover-тень карточек, ссылки-акцент |
| `--c-blue-dark` | `#1a4d6b` | Вторичный синий (резерв) |

### 2.2. Семантические токены (целевая модель, этап 0+)

Компоненты ссылаются на **роль**, не на «фиолетовый как фон страницы»:

| Token | Dark (default) | Назначение |
|-------|----------------|------------|
| `--bg-page` | violet-dark / `#1e1428` | Фон страницы |
| `--bg-surface` | `--c-dark` | Карточки, панели |
| `--bg-elevated` | `--c-black` | Header, приподнятые блоки |
| `--text-primary` | `--c-light` | Заголовки, основной текст |
| `--text-secondary` | `--c-lighter` | Мета, placeholder, подписи |
| `--border-default` | lighter @ 35% opacity | Рамки input, разделители |
| `--accent-primary` | `--c-violet-light` | CTA, active nav, focus ring |
| `--accent-success` | `--c-green` | Цена, успех |
| `--accent-link` | `--c-blue-accent` | Ссылки, hover glow |
| `--shadow-color` | black @ 50% | Базовая тень |

### 2.3. Тёмная и светлая тема (этап 11)

Переключение: `document.documentElement.setAttribute('data-theme', 'dark' | 'light')`.

**Правило гармонии:** в light не заменять бренд на «серый SaaS» — фон **лавандово-серый**, акценты те же hue, слегка затемнённые для контраста на белом.

| Элемент | Dark | Light |
|---------|------|-------|
| `--bg-page` | `#1e1428` / violet-dark | `#f0edf5` |
| `--bg-surface` | `#0f0f1a` | `#ffffff` |
| `--bg-elevated` | `#0a0a0f` | `#e8e4f0` |
| `--text-primary` | `#e8eaf6` | `#1a1225` |
| `--text-secondary` | `#a0a4b8` | `#5c5470` |
| `--accent-primary` | `#9b59b6` | `#7d3c98` |
| `--accent-success` | `#2ecc71` | `#27ae60` |
| `--accent-link` | `#3498db` | `#2980b9` |
| Тени | сильные, чёрные | мягкие, `rgba(42, 26, 58, 0.12)` |
| Overlay модалки | `rgba(0,0,0,0.7)` | `rgba(26,18,37,0.5)` |

**Персистентность:** `localStorage` ключ `rurave-theme`; при первом визите — `prefers-color-scheme`; anti-flash script в `index.html` до загрузки React.

**Где переключатель:** Header, `.header__theme-toggle`, `aria-pressed`, `aria-label`.

**Реализация:** `src/context/ThemeContext.jsx`, `ThemeProvider` в `main.jsx`.

**Доп. токены темы:** `--text-on-accent`, `--overlay-bg`, `--city-trigger-bg/text`, `--input-bg`, `--item-hover-bg`, `--bg-header`, `--card-border`, `--scrollbar-track/thumb`.

---

## 3. Типографика

| Token | Size | Использование |
|-------|------|----------------|
| `--fs-xs` | 0.75rem | Micro: бейджи, стрелка селектора |
| `--fs-sm` | 0.875rem | Caption: дата, место, артист в карточке |
| `--fs-md` | 1rem | Body, кнопки, inputs |
| `--fs-lg` | 1.125rem | Заголовок карточки, пункты nav |
| `--fs-xl` | 1.5rem | H1 секции, заголовок модалки города |

| Token | Значение | Использование |
|-------|----------|----------------|
| `--lh-tight` | 1.2 | Заголовки (секции, карточки, бренд) |
| `--lh-normal` | 1.5 | Body, caption, `body` |

**Решения:**
- Заголовок карточки: **не** `uppercase` на длинных названиях; допустим `font-weight: 600`, до 2 строк (`line-clamp`).
- Logo «Ru» + «Rave»: `--fs-xl` (desktop) / `--fs-lg` (mobile), `--lh-tight`, один блок `header__brand`.
- Nav links: `--fs-md`, body line-height.
- Placeholder всегда `--text-secondary`, не `--text-primary`.

---

## 4. Отступы, радиусы, layout

### Spacing

| Token | Value |
|-------|-------|
| `--r-spacing-xs` | 0.5rem |
| `--r-spacing-sm` | 0.75rem |
| `--r-spacing-md` | 1rem |
| `--r-spacing-lg` | 1.25rem |

**Правило:** для `gap` и `padding` использовать `--r-spacing-*`, не `--fs-*`.

### Radius

| Token | Value | Использование |
|-------|-------|----------------|
| `--r-radius` | 0.85rem | Карточки, кнопки, модалки, nav pills |

Исключения (устранить в этапе 4): мелкие `0.3rem` у search-кнопки → привести к `--r-radius`.

### Layout

| Класс / правило | Значение |
|-----------------|----------|
| `.layout-container` | `max-width: 1280px`, `margin: 0 auto`, `padding-inline: var(--r-spacing-md)` |
| `.section-spacing` | Вертикальные отступы между banner / search / list |
| Сетка концертов | `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` |
| Карточка | `width: 100%`, без фиксированных `20rem` |

### Breakpoints

| Token | px | Использование |
|-------|-----|----------------|
| `--bp-sm` | 480 | 1 колонка карточек |
| `--bp-md` | 768 | Search column, burger nav |
| `--bp-lg` | 1024 | (резерв) |

Touch: min-height **2.75rem (44px)** на nav, search, city trigger при `max-width: 768px`.
Header mobile: `.header__menu-toggle` + `.header__overlay` / `.header__mobile-nav`.

---

## 5. Тени и motion

| Token | Значение | Когда |
|-------|----------|-------|
| `--shadow-base` | тёмная, глубокая | Карточки, модалки |
| `--shadow-hover` | с оттенком `--c-blue-accent` | Hover карточки концерта |
| `--tr` | `0.3s ease` | color, background, transform, box-shadow |

**Карточка концерта hover:** `translateY(-0.25rem)` + `--shadow-hover` (не scale всей страницы).

**Кнопки:** опционально `:active { transform: scale(0.98) }` — единообразно на всех primary actions.

---

## 6. Компоненты

### 6.1. Header

| Решение | Деталь |
|---------|--------|
| Разметка | Семантический `<header>`, `<nav aria-label="Основная навигация">` |
| Бренд | Один `NavLink` на `/`: logo + «Ru»/«Rave» (`header__brand`) |
| Layout | Бренд слева, nav `flex: 1` по центру, LK справа (`margin-left: auto`) |
| Поведение | `position: sticky; top: 0; z-index: 100; border-bottom: 1px solid var(--border-default)` |
| Навигация | `NavLink`, `--active`: фон `--accent-primary`, текст `--c-dark`; Home с `end` |
| Hover / active | `transition`, `:active scale(0.98)`, `focus-visible` |
| Theme (этап 11) | `.header__theme-toggle` слева от Profile, сейчас `visibility: hidden` |
| Mobile | `<768px`: burger + slide-in nav; logo 3rem; touch 44px; Profile справа |

### 6.2. Banner

| Решение | Деталь |
|---------|--------|
| Высота | `clamp(12rem, 25vw, 20rem)` на img; `min-height` на контейнере |
| Изображение | `object-fit: cover`, `object-position: center`, `loading="lazy"` |
| Переход к контенту | `::after` gradient `transparent 40%` → `var(--bg-page) 100%` |
| Fallback | Контейнер `--bg-elevated`; при `onError` img скрывается |
| Alt | Prop с HomePage, default «RuRave — афиша» |

### 6.3. Search + CitySelector

| Решение | Деталь |
|---------|--------|
| Расположение | Одна полоса: город слева, поиск справа; на `<768px` — column |
| Поиск | Debounce ~400ms + submit; disabled без выбранного города |
| Input | `focus-within` на обводке контейнера; placeholder secondary |
| Город trigger | Светлая кнопка (light bg / dark text) на тёмной полосе — контрастный якорь |
| Модалка | Fixed overlay, blur, `slideUp` / `fadeIn`; список с кастомным scrollbar (violet) |
| Выбранный город в списке | Класс `--selected` (не путать с `--highlighted`) |

### 6.4. EventCard

| Решение | Деталь |
|---------|--------|
| Фон | `--bg-surface` |
| Постер | `aspect-ratio: 16/9`, `object-fit: cover` |
| Цена | `--accent-success`, `font-weight: 600`, префикс «от … руб.» |
| CTA | «Подробнее» — outline violet; hover/focus обязательны |
| Иконки мета | Декоративные, `alt=""` |

### 6.5. EventList

| Решение | Деталь |
|---------|--------|
| Разметка | `<ul>` + grid; элементы — `EventCard`, не голый `div` в списке без стилей |
| Загрузка | Skeleton в той же grid (6 штук) |
| Секция | Заголовок «Концерты в {город}» + `totalCount` |

### 6.6. Состояния страницы (HomePage)

Компонент **`HomeMessage`**: карточка `--bg-surface`, SVG-иконка `--text-secondary`, title, hint, опционально retry.

| Состояние | UI |
|-----------|-----|
| Loading concerts | `EventCardSkeletonList` (6 шт.), grid `concerts__list`, `aria-busy` |
| Error cities/concerts | `HomeMessage` variant error + `loadCities` / `loadConcerts` retry |
| Empty search | `HomeMessage` icon search + hint «Измените запрос…» |
| Empty city | `HomeMessage` icon calendar + hint «Смените город…» |

Skeleton: `EventCardSkeleton` — структура как у карточки, shimmer `--bg-surface` → `--bg-elevated`.

### 6.7. Вторичные страницы (About, Profile)

Компонент **`PageLayout`**: `title` + children в `.page__card`.

| Решение | Деталь |
|---------|--------|
| Обёртка | `.page` (`--bg-page`), `.layout-container`, `min-height: calc(100vh - var(--header-height))` |
| Карточка | `--bg-surface`, `--r-radius`, `--shadow-base`, padding `--r-spacing-lg`, max-width 40rem |
| Типографика | `.page__title` `--fs-xl`; `.page__text` `--fs-md`; `.page__hint` `--fs-sm` secondary |
| CTA | `.page__link` — outline accent, как кнопки карточки |
| About | Описание RuRave + Link на `/` |
| Profile | Placeholder авторизации + hint |

---

## 7. Доступность

| Требование | Реализация |
|------------|------------|
| Focus | Глобальный `:focus-visible` в `App.css`; мышь — `:focus:not(:focus-visible)` |
| Утилиты | `.sr-only`, `.skip-link` → `#main-content` |
| Разметка | `<main id="main-content" tabIndex={-1}>` в `App.jsx` |
| Модалка города | `dialog` + `aria-labelledby`; Escape; focus search / return trigger; города — `<button role="option">` |
| Search | `sr-only` label + `aria-label` на `<form>` |
| EventCard | Иконки `alt=""`; кнопка — `aria-label` с названием концерта |
| Touch | Min height **44px** на mobile (этап 9) |

---

## 8. Файловая структура стилей

```
src/
  App.css              # Примитивы, семантика, темы [data-theme], глобальный focus
  App.jsx              # ThemeProvider (этап 11)
  components/
    ComponentName/
      ComponentName.jsx
      ComponentName.css   # Только стили этого блока
  pages/
    PageName/
      PageName.jsx
      PageName.css
  docs/                # Эта папка
```

**Правила:**
1. Импорт `App.css` в корневых компонентах — как сейчас (или один раз в `main.jsx` после рефакторинга).
2. Не дублировать HEX в компонентах — только `var(--…)`.
3. Новый компонент = новая папка + BEM-префикс по имени компонента.
4. Общие утилиты (`.layout-container`, `.sr-only`) — только в `App.css`.

---

## 9. Чего избегать

- Новые «случайные» цвета вне палитры и семантики.
- Фиксированная ширина карточек в px без grid.
- Placeholder того же цвета, что и введённый текст.
- `window.location.reload()` как единственный UX при ошибке, если есть API retry.
- Inline styles для цветов (кроме динамических poster URL).
- Смешение английского и русского в UI без причины (nav сейчас EN — допустимо сменить на RU при product-решении; зафиксировать одно).

---

## 10. Связь с этапами внедрения

| Этап | Что добавляет в систему |
|------|-------------------------|
| 0 | Семантические токены, layout-container |
| 1 | Багфиксы, no-results, selected city |
| 2 | Grid карточек, aspect-ratio |
| 3 | Skeleton, empty/error pattern |
| 4 | Search UX, единый radius |
| 5 | Sticky header, NavLink |
| 6 | Banner gradient + clamp |
| 7 | Типографическая иерархия, lang ru |
| 8 | a11y контракт |
| 9 | Breakpoints, mobile nav |
| 10 | Page layout для About/Profile |
| 11 | Light theme + toggle + anti-flash |

Промпты: `Desktop\RuRave-UI-Этапы\`.

---

## 11. Changelog дизайн-системы

Крупные изменения токенов и правил — в [UI-IMPLEMENTATION-LOG.md](./UI-IMPLEMENTATION-LOG.md).  
Этот файл (`UI-DESIGN-SYSTEM.md`) обновлять, когда решение становится **стандартом**, а не экспериментом одного PR.

---

*Версия документа: 1.0 — май 2026, синхронизировано с планом RuRave-UI-Этапы.*
