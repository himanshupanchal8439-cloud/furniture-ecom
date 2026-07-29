import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.schemas.product import ProductVariantOut


class CartItemCreate(BaseModel):
    variant_id: uuid.UUID
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    variant: ProductVariantOut
    quantity: int


class CartOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    items: list[CartItemOut]


class WishlistItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    product_id: uuid.UUID
