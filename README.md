# WorldOfLamps 💡

Интернет-магазин завода лампочек. Микросервисный бэкенд на FastAPI + два React-фронтенда (покупательский и админский).

## Стек

- **Frontend (клиент и админка):** React 19, Redux Toolkit, React Router DOM v6, Vite, CSS Modules
- **Backend:** Python 3.12, FastAPI, SQLAlchemy (async)
- **Auth:** JWT (HS256, общий секрет между сервисами), passlib + bcrypt
- **Database:** PostgreSQL 16
- **Containerization:** Docker, Docker Compose

## Быстрый старт

```bash
# 1. Запустить бэкенд (auth + products + orders + postgres)
docker-compose up --build -d

# 2. Покупательский фронт
cd frontend && npm install && npm run dev
# → http://localhost:5173

# 3. Админ-панель (в отдельном терминале)
cd admin && npm install && npm run dev
# → http://localhost:5174
# Логин: admin / admin123
```

Покупательский фронт работает и без бэкенда (на mock-данных). Админка требует живой бэк.

## Микросервисы

| Сервис | Порт | Описание |
|--------|------|----------|
| auth-service     | 8003 | Логин админов, выдача JWT (`POST /api/auth/login`, `GET /api/auth/me`) |
| products-service | 8001 | Товары и категории. GET — публично, POST/PUT/DELETE — только с JWT |
| orders-service   | 8002 | Заказы. POST и GET по номеру — публично, list и PATCH /status — только с JWT |
| PostgreSQL       | 5432 | Общая база данных |

Все три сервиса делят `JWT_SECRET` через переменные окружения и валидируют подпись токена локально (stateless JWT, без походов в auth).

API-документация (Swagger UI): http://localhost:8001/docs · http://localhost:8002/docs · http://localhost:8003/docs

## Страницы покупательского фронта (`frontend/`)

| URL | Страница |
|-----|----------|
| `/` | Главная (баннер, категории, популярные товары) |
| `/catalog` | Каталог с фильтрами, поиском и пагинацией |
| `/products/:slug` | Карточка товара |
| `/cart` | Корзина |
| `/checkout` | Оформление заказа |
| `/confirmation` | Подтверждение заказа |
| `/orders` | Мои заказы (с актуальным статусом) |

## Страницы админ-панели (`admin/`)

| URL | Страница |
|-----|----------|
| `/login` | Вход (логин/пароль → JWT) |
| `/products` | CRUD товаров (создание, редактирование, мягкое удаление) |
| `/orders` | Просмотр заказов, смена статуса по state-машине |

Все защищённые роуты обёрнуты в `ProtectedRoute` — без валидного токена редирект на `/login`. На 401 от любого API токен сбрасывается и пользователь выкидывается.

## Управление состоянием

**Покупательский фронт** — Redux Toolkit, три слайса: `productsSlice`, `cartSlice` (persist в localStorage), `ordersSlice`.

**Админка** — Redux Toolkit, три слайса: `authSlice` (token + user persist в localStorage), `productsSlice`, `ordersSlice`.

## Учётные записи

| Логин | Пароль | Роль | Где |
|-------|--------|------|-----|
| `admin` | `admin123` | admin | сидится в `init.sql` |

## Seed-данные

При первом запуске автоматически создаются:
- 1 администратор (admin / admin123)
- 4 категории: LED, Лампы накаливания, Галогенные, Люминесцентные
- 20 товаров (по 5 в каждой категории)
