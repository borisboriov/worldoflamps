# WorldOfLamps 💡

Интернет-магазин завода лампочек. Микросервисный бэкенд на FastAPI + React-фронтенд.

## Стек

- **Frontend:** React 18, React Router DOM v6, Vite, CSS Modules
- **Backend:** Python 3.12, FastAPI, SQLAlchemy (async)
- **Database:** PostgreSQL 16
- **Containerization:** Docker, Docker Compose

## Быстрый старт

### Фронтенд (без бэкенда, на mock-данных)

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Полный стек

```bash
# Запустить бэкенд
docker-compose up --build

# Запустить фронтенд (в отдельном терминале)
cd frontend && npm run dev
```

Фронтенд автоматически подключается к бэкенду. Если бэкенд не запущен — работает на встроенных mock-данных.

## Страницы фронтенда

| URL | Страница |
|-----|----------|
| `/` | Главная (баннер, категории, популярные товары) |
| `/catalog` | Каталог с фильтрами, поиском и пагинацией |
| `/products/:slug` | Карточка товара |
| `/cart` | Корзина |
| `/checkout` | Оформление заказа |
| `/confirmation` | Подтверждение заказа |

## Микросервисы

| Сервис | Порт | Описание |
|--------|------|----------|
| Products Service | 8001 | Управление товарами и категориями |
| Orders Service | 8002 | Управление заказами |
| PostgreSQL | 5432 | База данных |

API документация (Swagger UI): http://localhost:8001/docs и http://localhost:8002/docs

## Seed-данные

При первом запуске автоматически создаются:
- 4 категории: LED, Лампы накаливания, Галогенные, Люминесцентные
- 20 товаров (по 5 в каждой категории)
