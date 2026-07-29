import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    product_id: uuid.UUID
    rating: int = Field(ge=1, le=5)
    title: str | None = None
    body: str | None = None


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    product_id: uuid.UUID
    rating: int
    title: str | None
    body: str | None
    created_at: datetime


class AdminReviewOut(ReviewOut):
    user_name: str
    product_name: str


class ProductReviewOut(ReviewOut):
    user_name: str


class CouponOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    code: str
    percent_off: int | None
    amount_off: float | None
    is_active: bool
    max_redemptions: int | None
    times_redeemed: int


class CouponCreate(BaseModel):
    code: str
    percent_off: int | None = None
    amount_off: float | None = None
    max_redemptions: int | None = None


class CouponUpdate(BaseModel):
    percent_off: int | None = None
    amount_off: float | None = None
    max_redemptions: int | None = None
    is_active: bool | None = None
