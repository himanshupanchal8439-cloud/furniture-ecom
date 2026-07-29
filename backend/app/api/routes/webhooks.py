import json
import logging

import razorpay
import stripe
from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.order import Order, OrderStatus
from app.services.email import send_order_status_email

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])
logger = logging.getLogger(__name__)


def _mark_paid(db: Session, payment_reference: str, background_tasks: BackgroundTasks) -> None:
    order = db.query(Order).filter(Order.payment_reference == payment_reference).first()
    if not order or order.status != OrderStatus.pending:
        return
    order.status = OrderStatus.paid
    db.commit()
    background_tasks.add_task(send_order_status_email, order.user.email, str(order.id), order.status.value)


@router.post("/stripe")
async def stripe_webhook(request: Request, background_tasks: BackgroundTasks, stripe_signature: str = Header(default="")):
    payload = await request.body()
    if not settings.stripe_webhook_secret:
        raise HTTPException(status_code=503, detail="Stripe webhook secret is not configured")
    try:
        event = stripe.Webhook.construct_event(payload, stripe_signature, settings.stripe_webhook_secret)
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(status_code=400, detail="Invalid Stripe webhook signature")

    if event["type"] == "payment_intent.succeeded":
        payment_intent_id = event["data"]["object"]["id"]
        db = SessionLocal()
        try:
            _mark_paid(db, payment_intent_id, background_tasks)
        finally:
            db.close()

    return {"received": True}


@router.post("/razorpay")
async def razorpay_webhook(
    request: Request, background_tasks: BackgroundTasks, x_razorpay_signature: str = Header(default="")
):
    payload = await request.body()
    if not settings.razorpay_webhook_secret:
        raise HTTPException(status_code=503, detail="Razorpay webhook secret is not configured")

    client = razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))
    try:
        client.utility.verify_webhook_signature(
            payload.decode(), x_razorpay_signature, settings.razorpay_webhook_secret
        )
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid Razorpay webhook signature")

    event = json.loads(payload)
    if event.get("event") == "order.paid":
        razorpay_order_id = event["payload"]["order"]["entity"]["id"]
        db = SessionLocal()
        try:
            _mark_paid(db, razorpay_order_id, background_tasks)
        finally:
            db.close()

    return {"received": True}
