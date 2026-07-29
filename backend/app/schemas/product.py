import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    description: str | None = None
    image_url: str | None = None
    parent_id: uuid.UUID | None = None
    product_count: int = 0


class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: str | None = None
    image_url: str | None = None
    parent_id: uuid.UUID | None = None


class CategoryUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    image_url: str | None = None
    parent_id: uuid.UUID | None = None


class ProductImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    url: str
    alt_text: str | None = None
    position: int


class ProductVariantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    color: str | None = None
    material: str | None = None
    size: str | None = None
    sku: str
    price_delta: Decimal
    stock_quantity: int
    swatch_hex: str | None = None


class ProductVariantCreate(BaseModel):
    color: str | None = None
    material: str | None = None
    size: str | None = None
    sku: str
    price_delta: Decimal = Decimal("0")
    stock_quantity: int = Field(default=0, ge=0)
    swatch_hex: str | None = None


class ProductVariantUpdate(BaseModel):
    id: uuid.UUID | None = None
    color: str | None = None
    material: str | None = None
    size: str | None = None
    sku: str
    price_delta: Decimal = Decimal("0")
    stock_quantity: int = Field(default=0, ge=0)
    swatch_hex: str | None = None


class ProductImageCreate(BaseModel):
    id: uuid.UUID | None = None
    url: str
    alt_text: str | None = None
    position: int = 0


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    description: str
    base_price: Decimal
    category: CategoryOut
    dimensions: str | None = None
    material: str | None = None
    is_active: bool
    meta_title: str | None = None
    meta_description: str | None = None
    video_url: str | None = None
    images: list[ProductImageOut] = []
    variants: list[ProductVariantOut] = []
    rating_avg: float = 0
    rating_count: int = 0


class ProductListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    base_price: Decimal
    category: CategoryOut
    images: list[ProductImageOut] = []
    rating_avg: float = 0
    rating_count: int = 0


class ProductCreate(BaseModel):
    name: str
    slug: str
    description: str
    base_price: Decimal = Field(ge=0)
    category_id: uuid.UUID
    dimensions: str | None = None
    material: str | None = None
    meta_title: str | None = None
    meta_description: str | None = None
    video_url: str | None = None
    variants: list[ProductVariantCreate] = []
    images: list[ProductImageCreate] = []


class ProductUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    base_price: Decimal | None = Field(default=None, ge=0)
    category_id: uuid.UUID | None = None
    dimensions: str | None = None
    material: str | None = None
    is_active: bool | None = None
    meta_title: str | None = None
    meta_description: str | None = None
    video_url: str | None = None
    variants: list[ProductVariantUpdate] | None = None
    images: list[ProductImageCreate] | None = None


class PaginatedProducts(BaseModel):
    items: list[ProductListItem]
    total: int
    page: int
    page_size: int
