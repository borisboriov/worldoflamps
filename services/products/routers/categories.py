from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import get_db
from models import Category, Product
from schemas import CategoryCreate, CategoryUpdate, CategoryResponse

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=list[CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Получить все категории."""
    result = await db.execute(select(Category).order_by(Category.name))
    return result.scalars().all()


@router.get("/{slug}", response_model=CategoryResponse)
async def get_category_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    """Получить категорию по slug."""
    result = await db.execute(select(Category).where(Category.slug == slug))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    return category


@router.post("", response_model=CategoryResponse, status_code=201)
async def create_category(data: CategoryCreate, db: AsyncSession = Depends(get_db)):
    """Создать категорию."""
    # Check uniqueness
    existing = await db.execute(
        select(Category).where((Category.slug == data.slug) | (Category.name == data.name))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Категория с таким именем или slug уже существует")

    category = Category(name=data.name, slug=data.slug)
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(category_id: int, data: CategoryUpdate, db: AsyncSession = Depends(get_db)):
    """Обновить категорию."""
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Категория не найдена")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(category, key, value)

    await db.commit()
    await db.refresh(category)
    return category


@router.delete("/{category_id}")
async def delete_category(category_id: int, db: AsyncSession = Depends(get_db)):
    """Удалить категорию (нельзя, если есть товары)."""
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Категория не найдена")

    # Check if products exist
    count_result = await db.execute(
        select(func.count()).select_from(Product).where(Product.category_id == category_id)
    )
    count = count_result.scalar()
    if count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Нельзя удалить категорию, к которой привязано {count} товаров"
        )

    await db.delete(category)
    await db.commit()
    return {"message": "Категория удалена"}
