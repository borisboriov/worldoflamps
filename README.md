# WorldOfLamps 💡

Интернет-магазин завода лампочек — микросервисная архитектура.

## Стек

- **Backend:** Python 3.12, FastAPI, SQLAlchemy (async)
- **Database:** PostgreSQL 16
- **Containerization:** Docker, Docker Compose

## Микросервисы

| Сервис | Порт | Описание |
|--------|------|----------|
| Products Service | 8001 | Управление товарами и категориями |
| Orders Service | 8002 | Управление заказами |
| PostgreSQL | 5432 | База данных |

## Быстрый старт

```bash
# Клонировать репозиторий
git clone https://github.com/<username>/worldoflamps.git
cd worldoflamps

# Запустить всё
docker-compose up --build

# Проверить здоровье сервисов
curl http://localhost:8001/health
curl http://localhost:8002/health
```

## API Documentation

После запуска доступна автогенерируемая документация (Swagger UI):

- Products Service: http://localhost:8001/docs
- Orders Service: http://localhost:8002/docs

## Эндпоинты

### Products Service (`:8001`)

**Категории:**
- `GET /api/products/categories` — список категорий
- `GET /api/products/categories/{slug}` — категория по slug
- `POST /api/products/categories` — создать категорию
- `PUT /api/products/categories/{id}` — обновить категорию
- `DELETE /api/products/categories/{id}` — удалить категорию

**Товары:**
- `GET /api/products/products` — список товаров (фильтрация, поиск, пагинация)
- `GET /api/products/products/search?q=...` — поиск
- `GET /api/products/products/{id}` — товар по ID
- `POST /api/products/products` — создать товар
- `PUT /api/products/products/{id}` — обновить товар
- `DELETE /api/products/products/{id}` — деактивировать товар
- `POST /api/products/products/{id}/upload` — загрузить изображение

### Orders Service (`:8002`)

- `POST /api/orders` — создать заказ
- `GET /api/orders/{id}` — получить заказ (по ID или номеру LMP-XXXX)
- `GET /api/orders` — список заказов (фильтр по статусу, пагинация)
- `PATCH /api/orders/{id}/status` — сменить статус заказа

## Seed-данные

При первом запуске автоматически создаются:
- 4 категории (LED, Накаливания, Галогенные, Люминесцентные)
- 20 товаров (по 5 в каждой категории)
