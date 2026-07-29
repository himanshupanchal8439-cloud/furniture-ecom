import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.models.order import OrderStatus, PaymentProvider
from app.schemas.user import AddressOut


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    variant_id: uuid.UUID
    product_name: str
    variant_label: str | None
    unit_price: Decimal
    quantity: int


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    status: OrderStatus
    subtotal: Decimal
    discount_total: Decimal
    shipping_total: Decimal
    grand_total: Decimal
    coupon_code: str | None
    payment_provider: PaymentProvider | None
    payment_reference: str | None
    tracking_number: str | None
    created_at: datetime
    items: list[OrderItemOut]


class OrderCustomer(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    email: str


class AdminOrderOut(OrderOut):
    user: OrderCustomer
    address: AddressOut


class CheckoutRequest(BaseModel):
    address_id: uuid.UUID
    coupon_code: str | None = None
    payment_provider: PaymentProvider


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    tracking_number: str | None = None
