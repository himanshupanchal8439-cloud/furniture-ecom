import logging
import uuid
from decimal import Decimal

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_admin, get_current_user
from app.db.session import get_db
from app.models.cart import Cart, CartItem
from app.models.order import Coupon, Order, OrderItem, OrderStatus
from app.models.user import Address, User
from app.schemas.order import AdminOrderOut, CheckoutRequest, OrderOut, OrderStatusUpdate
from app.services.email import send_order_confirmation_email, send_order_status_email
from app.services.payments import (
    create_razorpay_order,
    create_stripe_payment_intent,
    refund_razorpay_payment,
    refund_stripe_payment,
)

router = APIRouter(prefix="/api/orders", tags=["orders"])
logger = logging.getLogger(__name__)


@router.get("", response_model=list[OrderOut])
def list_my_orders(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.user_id == user.id)
        .order_by(Order.created_at.desc())
        .all()
    )


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order or (order.user_id != user.id and user.role.value != "admin"):
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/checkout", response_model=OrderOut)
def checkout(
    payload: CheckoutRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    cart = db.query(Cart).options(joinedload(Cart.items).joinedload(CartItem.variant)).filter(Cart.user_id == user.id).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    address = db.get(Address, payload.address_id)
    if not address or address.user_id != user.id:
        raise HTTPException(status_code=404, detail="Address not found")

    subtotal = Decimal("0")
    order_items: list[OrderItem] = []
    for item in cart.items:
        if item.quantity > item.variant.stock_quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for SKU {item.variant.sku}")
        unit_price = item.variant.product.base_price + item.variant.price_delta
        subtotal += unit_price * item.quantity
        order_items.append(
            OrderItem(
                variant_id=item.variant_id,
                product_name=item.variant.product.name,
                variant_label=", ".join(filter(None, [item.variant.color, item.variant.material, item.variant.size])),
                unit_price=unit_price,
                quantity=item.quantity,
            )
        )

    discount_total = Decimal("0")
    coupon = None
    if payload.coupon_code:
        coupon = db.query(Coupon).filter(Coupon.code == payload.coupon_code, Coupon.is_active.is_(True)).first()
        if not coupon:
            raise HTTPException(status_code=400, detail="Invalid coupon code")
        if coupon.max_redemptions and coupon.times_redeemed >= coupon.max_redemptions:
            raise HTTPException(status_code=400, detail="Coupon redemption limit reached")
        if coupon.percent_off:
            discount_total = subtotal * Decimal(coupon.percent_off) / Decimal(100)
        elif coupon.amount_off:
            discount_total = Decimal(coupon.amount_off)

    shipping_total = Decimal("0") if subtotal >= Decimal("500") else Decimal("49")
    grand_total = subtotal - discount_total + shipping_total

    order = Order(
        user_id=user.id,
        address_id=address.id,
        subtotal=subtotal,
        discount_total=discount_total,
        shipping_total=shipping_total,
        grand_total=grand_total,
        coupon_code=payload.coupon_code,
        payment_provider=payload.payment_provider,
        status=OrderStatus.pending,
        items=order_items,
    )

    for item in cart.items:
        item.variant.stock_quantity -= item.quantity

    if coupon:
        coupon.times_redeemed += 1

    db.add(order)
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()
    db.refresh(order)

    if payload.payment_provider.value == "stripe":
        payment = create_stripe_payment_intent(grand_total)
        order.payment_reference = payment["id"]
    else:
        payment = create_razorpay_order(grand_total)
        order.payment_reference = payment["id"]
    db.commit()
    db.refresh(order)

    background_tasks.add_task(send_order_confirmation_email, user.email, str(order.id), str(order.grand_total))

    return order


@router.get("/admin/all", response_model=list[AdminOrderOut], dependencies=[Depends(get_current_admin)])
def list_all_orders(db: Session = Depends(get_db), status: OrderStatus | None = None):
    query = db.query(Order).options(joinedload(Order.items), joinedload(Order.user), joinedload(Order.address))
    if status:
        query = query.filter(Order.status == status)
    return query.order_by(Order.created_at.desc()).all()


@router.patch("/{order_id}/status", response_model=OrderOut, dependencies=[Depends(get_current_admin)])
def update_order_status(
    order_id: uuid.UUID,
    payload: OrderStatusUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    newly_refunded = payload.status == OrderStatus.refunded and order.status != OrderStatus.refunded
    order.status = payload.status
    if payload.tracking_number:
        order.tracking_number = payload.tracking_number
    db.commit()
    db.refresh(order)

    if newly_refunded and order.payment_reference:
        try:
            if order.payment_provider and order.payment_provider.value == "stripe":
                refund_stripe_payment(order.payment_reference)
            elif order.payment_provider and order.payment_provider.value == "razorpay":
                refund_razorpay_payment(order.payment_reference)
        except Exception:
            logger.exception("Failed to issue refund for order %s via %s", order.id, order.payment_provider)

    background_tasks.add_task(send_order_status_email, order.user.email, str(order.id), order.status.value)
    return order
