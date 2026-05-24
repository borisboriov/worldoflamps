import os
import time
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from database import get_db
from models import Product, Category
from schemas import (
    ProductCreate, ProductUpdate, ProductResponse,
    ProductListItem, PaginatedProducts,
)
from slugify import slugify
from datetime import datetime
from auth_deps import require_admin

router = APIRouter(prefix="/products", tags=["Products"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/app/uploads")
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.get("", response_model=PaginatedProducts)
async def list_products(
    category: str | None = Query(None, description="Фильтр по slug категории"),
    min_price: float | None = Query(None, description="Минимальная цена"),
    max_price: float | None = Query(None, description="Максимальная цена"),
    search: str | None = Query(None, description="Поиск по названию"),
    page: int = Query(1, ge=1, description="Номер страницы"),
    per_page: int = Query(12, ge=1, le=100, description="Товаров на страницу"),
    sort: str = Query("name", description="Сортировка: name, price, -price"),
    db: AsyncSession = Depends(get_db),
):
    """Список активных товаров с фильтрацией, поиском, сортировкой и пагинацией."""
    query = select(Product).where(Product.is_active == True).options(selectinload(Product.category))

    # Filter by category
    if category:
        query = query.join(Category).where(Category.slug == category)

    # Filter by price
    if min_price is not None:
        query = query.where(Product.price >= min_price)
    if max_price is not None:
        query = query.where(Product.price <= max_price)

    # Search by name
    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Sorting
    if sort == "price":
        query = query.order_by(Product.price)
    elif sort == "-price":
        query = query.order_by(desc(Product.price))
    else:
        query = query.order_by(Product.name)

    # Pagination
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)

    result = await db.execute(query)
    products = result.scalars().all()

    pages = (total + per_page - 1) // per_page if total > 0 else 1

    return PaginatedProducts(
        items=products,
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.get("/search")
async def search_products(
    q: str = Query(..., min_length=1, description="Поисковый запрос"),
    db: AsyncSession = Depends(get_db),
):
    """Поиск товаров по названию."""
    query = (
        select(Product)
        .where(Product.is_active == True)
        .where(Product.name.ilike(f"%{q}%"))
        .options(selectinload(Product.category))
        .limit(20)
    )
    result = await db.execute(query)
    products = result.scalars().all()

    items = [ProductListItem.model_validate(p) for p in products]
    return {"items": items, "total": len(items)}


@router.get("/{key}", response_model=ProductResponse)
async def get_product(key: str, db: AsyncSession = Depends(get_db)):
    """Получить товар по ID или slug."""
    query = select(Product).options(selectinload(Product.category))
    if key.isdigit():
        query = query.where(Product.id == int(key))
    else:
        query = query.where(Product.slug == key)
    result = await db.execute(query)
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return product


@router.post("", response_model=ProductResponse, status_code=201)
async def create_product(data: ProductCreate, db: AsyncSession = Depends(get_db), _: dict = Depends(require_admin)):
    """Создать товар."""
    # Check category exists
    cat_result = await db.execute(select(Category).where(Category.id == data.category_id))
    if not cat_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Категория не найдена")

    # Generate slug
    slug = slugify(data.name)
    # Ensure uniqueness
    existing = await db.execute(select(Product).where(Product.slug == slug))
    if existing.scalar_one_or_none():
        slug = f"{slug}-{int(time.time())}"

    product = Product(
        name=data.name,
        slug=slug,
        category_id=data.category_id,
        description=data.description,
        price=data.price,
        stock=data.stock,
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)

    # Load category relationship
    result = await db.execute(
        select(Product).where(Product.id == product.id).options(selectinload(Product.category))
    )
    return result.scalar_one()


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, data: ProductUpdate, db: AsyncSession = Depends(get_db), _: dict = Depends(require_admin)):
    """Обновить товар."""
    result = await db.execute(
        select(Product).where(Product.id == product_id).options(selectinload(Product.category))
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")

    update_data = data.model_dump(exclude_unset=True)

    # If category_id changed, validate it
    if "category_id" in update_data:
        cat_result = await db.execute(select(Category).where(Category.id == update_data["category_id"]))
        if not cat_result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Категория не найдена")

    # If name changed, update slug
    if "name" in update_data:
        new_slug = slugify(update_data["name"])
        existing = await db.execute(
            select(Product).where(Product.slug == new_slug, Product.id != product_id)
        )
        if existing.scalar_one_or_none():
            new_slug = f"{new_slug}-{int(time.time())}"
        update_data["slug"] = new_slug

    update_data["updated_at"] = datetime.utcnow()

    for key, value in update_data.items():
        setattr(product, key, value)

    await db.commit()
    await db.refresh(product)

    # Reload with category
    result = await db.execute(
        select(Product).where(Product.id == product.id).options(selectinload(Product.category))
    )
    return result.scalar_one()


@router.delete("/{product_id}")
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db), _: dict = Depends(require_admin)):
    """Мягкое удаление товара (is_active = false)."""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")

    product.is_active = False
    product.updated_at = datetime.utcnow()
    await db.commit()
    return {"message": "Товар деактивирован"}


@router.post("/{product_id}/upload")
async def upload_product_image(
    product_id: int,
    image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    """Загрузить изображение товара."""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")

    # Validate extension
    ext = image.filename.rsplit(".", 1)[-1].lower() if image.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Допустимые форматы: {', '.join(ALLOWED_EXTENSIONS)}")

    # Read and check size
    content = await image.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Файл слишком большой (макс. 5 МБ)")

    # Save file
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    filename = f"{product_id}_{int(time.time())}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(content)

    # Update product
    product.image_url = f"/uploads/{filename}"
    product.updated_at = datetime.utcnow()
    await db.commit()

    return {"image_url": product.image_url, "message": "Изображение загружено"}
