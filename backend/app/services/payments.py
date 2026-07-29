from decimal import Decimal

import razorpay
import stripe

from app.core.config import settings

stripe.api_key = settings.stripe_secret_key


def create_stripe_payment_intent(amount: Decimal, currency: str = "usd") -> dict:
    intent = stripe.PaymentIntent.create(
        amount=int(amount * 100),
        currency=currency,
        automatic_payment_methods={"enabled": True},
    )
    return {"client_secret": intent.client_secret, "id": intent.id}


def create_razorpay_order(amount: Decimal, currency: str = "INR") -> dict:
    client = razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))
    order = client.order.create(
        {"amount": int(amount * 100), "currency": currency, "payment_capture": 1}
    )
    return order


def refund_stripe_payment(payment_intent_id: str) -> dict:
    return stripe.Refund.create(payment_intent=payment_intent_id)


def refund_razorpay_payment(payment_id: str) -> dict:
    client = razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))
    return client.payment.refund(payment_id, {})
