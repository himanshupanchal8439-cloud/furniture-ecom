import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.material import MaterialType, QuoteRequestStatus


class MaterialOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    type: MaterialType
    subtype: str | None = None
    short_description: str
    details: str | None = None
    best_use: str | None = None
    finish: str | None = None
    price_min: Decimal | None = None
    price_max: Decimal | None = None
    image_url: str | None = None
    durability_rating: str | None = None
    waterproof: bool
    warranty_info: str | None = None
    is_active: bool
    position: int


class MaterialListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    type: MaterialType
    subtype: str | None = None
    short_description: str
    best_use: str | None = None
    finish: str | None = None
    price_min: Decimal | None = None
    price_max: Decimal | None = None
    image_url: str | None = None
    waterproof: bool


class MaterialCreate(BaseModel):
    name: str
    slug: str
    type: MaterialType
    subtype: str | None = None
    short_description: str
    details: str | None = None
    best_use: str | None = None
    finish: str | None = None
    price_min: Decimal | None = Field(default=None, ge=0)
    price_max: Decimal | None = Field(default=None, ge=0)
    image_url: str | None = None
    durability_rating: str | None = None
    waterproof: bool = False
    warranty_info: str | None = None
    is_active: bool = True
    position: int = 0


class MaterialUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    type: MaterialType | None = None
    subtype: str | None = None
    short_description: str | None = None
    details: str | None = None
    best_use: str | None = None
    finish: str | None = None
    price_min: Decimal | None = Field(default=None, ge=0)
    price_max: Decimal | None = Field(default=None, ge=0)
    image_url: str | None = None
    durability_rating: str | None = None
    waterproof: bool | None = None
    warranty_info: str | None = None
    is_active: bool | None = None
    position: int | None = None


class PaginatedMaterials(BaseModel):
    items: list[MaterialListItem]
    total: int
    page: int
    page_size: int


class QuoteRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    material_id: uuid.UUID | None = None
    name: str
    phone: str
    email: str | None = None
    message: str | None = None
    status: QuoteRequestStatus


class QuoteRequestCreate(BaseModel):
    material_id: uuid.UUID | None = None
    name: str
    phone: str
    email: str | None = None
    message: str | None = None


class QuoteRequestUpdate(BaseModel):
    status: QuoteRequestStatus
