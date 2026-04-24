from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Optional


# --- Order Item Schemas ---

class OrderItemInput(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    price: Decimal
    quantity: int

    model_config = {"from_attributes": True}


# --- Order Schemas ---

class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=200)
    customer_phone: str = Field(..., min_length=1, max_length=20)
    customer_address: str = Field(..., min_length=1)
    comment: Optional[str] = None
    items: list[OrderItemInput] = Field(..., min_length=1)


class OrderResponse(BaseModel):
    id: int
    order_number: str
    customer_name: str
    customer_phone: str
    customer_address: str
    status: str
    total: Decimal
    comment: Optional[str]
    items: list[OrderItemResponse]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderListItem(BaseModel):
    id: int
    order_number: str
    customer_name: str
    status: str
    total: Decimal
    created_at: datetime

    model_config = {"from_attributes": True}


class PaginatedOrders(BaseModel):
    items: list[OrderListItem]
    total: int
    page: int
    per_page: int
    pages: int


class StatusUpdate(BaseModel):
    status: str = Field(..., min_length=1)
