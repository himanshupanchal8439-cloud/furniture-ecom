from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

from app.core.config import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.mail_username or "",
    MAIL_PASSWORD=settings.mail_password or "",
    MAIL_FROM=settings.mail_from,
    MAIL_SERVER=settings.mail_server,
    MAIL_PORT=settings.mail_port,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=bool(settings.mail_username),
)


async def send_order_status_email(to_email: str, order_id: str, status: str) -> None:
    if not settings.mail_username:
        return
    message = MessageSchema(
        subject=f"Your Maison order {order_id} is now {status}",
        recipients=[to_email],
        body=f"<p>Your order <strong>{order_id}</strong> status has been updated to <strong>{status}</strong>.</p>",
        subtype=MessageType.html,
    )
    await FastMail(conf).send_message(message)


async def send_material_quote_email(name: str, phone: str, material_name: str | None) -> None:
    recipient = settings.admin_notification_email or settings.mail_username
    if not settings.mail_username or not recipient:
        return
    subject_material = f" for {material_name}" if material_name else ""
    message = MessageSchema(
        subject=f"New sample/quote request{subject_material}",
        recipients=[recipient],
        body=(
            f"<p>New material sample/quote request{subject_material} from "
            f"<strong>{name}</strong> ({phone}). Check the admin panel for details.</p>"
        ),
        subtype=MessageType.html,
    )
    await FastMail(conf).send_message(message)


async def send_order_confirmation_email(to_email: str, order_id: str, grand_total: str) -> None:
    if not settings.mail_username:
        return
    message = MessageSchema(
        subject=f"Your Maison order {order_id} is confirmed",
        recipients=[to_email],
        body=(
            f"<p>Thank you for your order! Order <strong>{order_id}</strong> "
            f"for <strong>{grand_total}</strong> has been received and is being processed. "
            "We'll email you again once it ships.</p>"
        ),
        subtype=MessageType.html,
    )
    await FastMail(conf).send_message(message)
