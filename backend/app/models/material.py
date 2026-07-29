import enum
import uuid

from sqlalchemy import Boolean, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.mixins import TimestampMixin, UUIDPKMixin


class MaterialType(str, enum.Enum):
    wood = "wood"
    plywood = "plywood"


class QuoteRequestStatus(str, enum.Enum):
    new = "new"
    contacted = "contacted"


class Material(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "materials"

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True, nullable=False)
    type: Mapped[MaterialType] = mapped_column(Enum(MaterialType), nullable=False, index=True)
    subtype: Mapped[str | None] = mapped_column(String(120), nullable=True)
    short_description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    details: Mapped[str | None] = mapped_column(Text, nullable=True)
    best_use: Mapped[str | None] = mapped_column(String(255), nullable=True)
    finish: Mapped[str | None] = mapped_column(String(120), nullable=True)
    price_min: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    price_max: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    durability_rating: Mapped[str | None] = mapped_column(String(80), nullable=True)
    waterproof: Mapped[bool] = mapped_column(Boolean, default=False)
    warranty_info: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    position: Mapped[int] = mapped_column(Integer, default=0)

    quote_requests: Mapped[list["MaterialQuoteRequest"]] = relationship(back_populates="material")


class MaterialQuoteRequest(UUIDPKMixin, TimestampMixin, Base):
    __tablename__ = "material_quote_requests"

    material_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("materials.id"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    phone: Mapped[str] = mapped_column(String(32), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[QuoteRequestStatus] = mapped_column(Enum(QuoteRequestStatus), default=QuoteRequestStatus.new)

    material: Mapped["Material | None"] = relationship(back_populates="quote_requests")
