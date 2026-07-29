import uuid
from datetime import date, timedelta

import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_admin
from app.core.config import settings
from app.db.session import get_db
from app.models.order import Order, OrderStatus
from app.models.product import Product, ProductVariant
from app.models.review import Review
from app.models.user import User
from app.schemas.order import OrderOut
from app.schemas.review import AdminReviewOut
from app.schemas.user import UserOut, UserUpdateActive, UserUpdateRole

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(get_current_admin)])

cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
)


@router.get("/stats")
def dashboard_stats(db: Session = Depends(get_db)):
    revenue = db.query(func.coalesce(func.sum(Order.grand_total), 0)).filter(
        Order.status.in_([OrderStatus.paid, OrderStatus.processing, OrderStatus.shipped, OrderStatus.delivered])
    ).scalar()

    return {
        "total_orders": db.query(func.count(Order.id)).scalar(),
        "pending_orders": db.query(func.count(Order.id)).filter(Order.status == OrderStatus.pending).scalar(),
        "total_revenue": float(revenue),
        "total_products": db.query(func.count(Product.id)).scalar(),
        "total_users": db.query(func.count(User.id)).scalar(),
        "low_stock_variants": db.query(func.count(ProductVariant.id)).filter(ProductVariant.stock_quantity <= 5).scalar(),
    }


@router.get("/stats/revenue-trend")
def revenue_trend(db: Session = Depends(get_db), days: int = Query(default=14, ge=1, le=90)):
    since = date.today() - timedelta(days=days - 1)
    paid_statuses = [OrderStatus.paid, OrderStatus.processing, OrderStatus.shipped, OrderStatus.delivered]

    rows = (
        db.query(func.date(Order.created_at).label("day"), func.sum(Order.grand_total).label("revenue"))
        .filter(Order.status.in_(paid_statuses), func.date(Order.created_at) >= since)
        .group_by("day")
        .all()
    )
    by_day = {row.day.isoformat(): float(row.revenue) for row in rows}

    return [
        {"date": (since + timedelta(days=i)).isoformat(), "revenue": by_day.get((since + timedelta(days=i)).isoformat(), 0.0)}
        for i in range(days)
    ]


@router.get("/orders/recent")
def recent_orders(db: Session = Depends(get_db), limit: int = Query(default=5, ge=1, le=20)):
    orders = (
        db.query(Order)
        .options(joinedload(Order.user))
        .order_by(Order.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": str(o.id),
            "status": o.status.value,
            "grand_total": float(o.grand_total),
            "created_at": o.created_at.isoformat(),
            "user": {"full_name": o.user.full_name, "email": o.user.email},
        }
        for o in orders
    ]


@router.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), q: str | None = Query(default=None)):
    query = db.query(User)
    if q:
        like = f"%{q}%"
        query = query.filter((User.email.ilike(like)) | (User.full_name.ilike(like)))
    return query.order_by(User.created_at.desc()).all()


@router.patch("/users/{user_id}/role", response_model=UserOut)
def update_user_role(user_id: uuid.UUID, payload: UserUpdateRole, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = payload.role
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/active", response_model=UserOut)
def update_user_active(user_id: uuid.UUID, payload: UserUpdateActive, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    return user


@router.get("/users/{user_id}/orders", response_model=list[OrderOut])
def get_user_orders(user_id: uuid.UUID, db: Session = Depends(get_db)):
    if not db.get(User, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
        .all()
    )


@router.get("/reviews", response_model=list[AdminReviewOut])
def list_all_reviews(db: Session = Depends(get_db)):
    reviews = (
        db.query(Review)
        .options(joinedload(Review.user), joinedload(Review.product))
        .order_by(Review.created_at.desc())
        .all()
    )
    return [
        AdminReviewOut(
            id=r.id,
            user_id=r.user_id,
            product_id=r.product_id,
            rating=r.rating,
            title=r.title,
            body=r.body,
            created_at=r.created_at,
            user_name=r.user.full_name,
            product_name=r.product.name,
        )
        for r in reviews
    ]


@router.delete("/reviews/{review_id}", status_code=204)
def delete_any_review(review_id: uuid.UUID, db: Session = Depends(get_db)):
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()


@router.post("/uploads")
def upload_image(file: UploadFile):
    if not settings.cloudinary_cloud_name:
        raise HTTPException(status_code=503, detail="Cloudinary is not configured on the server")
    result = cloudinary.uploader.upload(file.file, folder="maison")
    return {"url": result["secure_url"], "public_id": result["public_id"]}
