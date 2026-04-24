from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from database import get_db
from models import Order, OrderItem, Product
from schemas import (
    OrderCreate, OrderResponse, OrderListItem,
    PaginatedOrders, StatusUpdate, OrderItemResponse,
)
from datetime import datetime
from decimal import Decimal

router = APIRouter(prefix="/orders", tags=["Orders"])

# Valid status transitions
STATUS_TRANSITIONS = {
    "new": ["processing", "cancelled"],
    "processing": ["shipped", "cancelled"],
    "shipped": ["delivered"],
    "delivered": [],
    "cancelled": [],
}


@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(data: OrderCreate, db: AsyncSession = Depends(get_db)):
    """Создать заказ."""
    if not data.items:
        raise HTTPException(status_code=400, detail="Корзина не может быть пустой")

    # Collect product IDs
    product_ids = [item.product_id for item in data.items]

    # Fetch products
    result = await db.execute(select(Product).where(Product.id.in_(product_ids)))
    products = {p.id: p for p in result.scalars().all()}

    # Validate all products exist and are active
    for item in data.items:
        product = products.get(item.product_id)
        if not product:
            raise HTTPException(
                status_code=400,
                detail=f"Товар с ID {item.product_id} не найден"
            )
        if not product.is_active:
            raise HTTPException(
                status_code=400,
                detail=f"Товар '{product.name}' недоступен для заказа"
            )
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "INSUFFICIENT_STOCK",
                    "message": f"Недостаточно товара '{product.name}' на складе",
                    "product_id": item.product_id,
                    "requested": item.quantity,
                    "available": product.stock,
                }
            )

    # Calculate total and create order items
    total = Decimal("0")
    order_items = []
    for item in data.items:
        product = products[item.product_id]
        item_total = product.price * item.quantity
        total += item_total
        order_items.append(OrderItem(
            product_id=item.product_id,
            product_name=product.name,
            price=product.price,
            quantity=item.quantity,
        ))

    # Create order (order_number will be set after we get the ID)
    order = Order(
        order_number="TEMP",
        customer_name=data.customer_name,
        customer_phone=data.customer_phone,
        customer_address=data.customer_address,
        comment=data.comment,
        status="new",
        total=total,
        items=order_items,
    )
    db.add(order)
    await db.flush()  # Get the ID

    # Set order number
    order.order_number = f"LMP-{order.id:04d}"

    # Decrease stock
    for item in data.items:
        product = products[item.product_id]
        product.stock -= item.quantity

    await db.commit()
    await db.refresh(order)

    # Reload with items
    result = await db.execute(
        select(Order).where(Order.id == order.id).options(selectinload(Order.items))
    )
    return result.scalar_one()


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, db: AsyncSession = Depends(get_db)):
    """Получить заказ по ID или номеру заказа."""
    query = select(Order).options(selectinload(Order.items))

    # Try as order number first (LMP-XXXX), then as numeric ID
    if order_id.startswith("LMP-"):
        query = query.where(Order.order_number == order_id)
    else:
        try:
            numeric_id = int(order_id)
            query = query.where(Order.id == numeric_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Неверный формат ID заказа")

    result = await db.execute(query)
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    return order


@router.get("", response_model=PaginatedOrders)
async def list_orders(
    status: str | None = Query(None, description="Фильтр по статусу"),
    page: int = Query(1, ge=1, description="Номер страницы"),
    per_page: int = Query(20, ge=1, le=100, description="Заказов на страницу"),
    db: AsyncSession = Depends(get_db),
):
    """Список заказов с фильтрацией по статусу и пагинацией."""
    query = select(Order)

    if status:
        query = query.where(Order.status == status)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Sort by newest first
    query = query.order_by(desc(Order.created_at))

    # Paginate
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)

    result = await db.execute(query)
    orders = result.scalars().all()

    pages = (total + per_page - 1) // per_page if total > 0 else 1

    return PaginatedOrders(
        items=orders,
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(order_id: int, data: StatusUpdate, db: AsyncSession = Depends(get_db)):
    """Сменить статус заказа."""
    result = await db.execute(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    # Validate transition
    allowed = STATUS_TRANSITIONS.get(order.status, [])
    if data.status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Нельзя перевести заказ из статуса '{order.status}' в '{data.status}'. "
                   f"Допустимые переходы: {', '.join(allowed) if allowed else 'нет (финальный статус)'}"
        )

    order.status = data.status
    order.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(order)

    # Reload with items
    result = await db.execute(
        select(Order).where(Order.id == order.id).options(selectinload(Order.items))
    )
    return result.scalar_one()
