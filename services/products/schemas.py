from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Optional


# --- Category Schemas ---

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    slug: Optional[str] = Field(None, min_length=1, max_length=100)


class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    created_at: datetime

    model_config = {"from_attributes": True}


class CategoryShort(BaseModel):
    id: int
    name: str
    slug: str

    model_config = {"from_attributes": True}


# --- Product Schemas ---

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    category_id: int
    description: Optional[str] = None
    price: Decimal = Field(..., gt=0)
    stock: int = Field(0, ge=0)


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    category_id: Optional[int] = None
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str]
    price: Decimal
    image_url: Optional[str]
    stock: int
    is_active: bool
    category: CategoryShort
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProductListItem(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str]
    price: Decimal
    image_url: Optional[str]
    stock: int
    category: CategoryShort

    model_config = {"from_attributes": True}


class PaginatedProducts(BaseModel):
    items: list[ProductListItem]
    total: int
    page: int
    per_page: int
    pages: int
