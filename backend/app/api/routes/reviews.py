from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.product import Product
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ProductReviewOut, ReviewCreate, ReviewOut

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


@router.get("/product/{product_id}", response_model=list[ProductReviewOut])
def list_product_reviews(product_id: str, db: Session = Depends(get_db)):
    reviews = (
        db.query(Review)
        .options(joinedload(Review.user))
        .filter(Review.product_id == product_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    return [
        ProductReviewOut(
            id=r.id,
            user_id=r.user_id,
            product_id=r.product_id,
            rating=r.rating,
            title=r.title,
            body=r.body,
            created_at=r.created_at,
            user_name=r.user.full_name,
        )
        for r in reviews
    ]


@router.post("", response_model=ReviewOut, status_code=201)
def create_review(payload: ReviewCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not db.get(Product, payload.product_id):
        raise HTTPException(status_code=404, detail="Product not found")

    existing = db.query(Review).filter(Review.user_id == user.id, Review.product_id == payload.product_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already reviewed this product")

    review = Review(user_id=user.id, **payload.model_dump())
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.delete("/{review_id}", status_code=204)
def delete_review(review_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    review = db.get(Review, review_id)
    if not review or review.user_id != user.id:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
