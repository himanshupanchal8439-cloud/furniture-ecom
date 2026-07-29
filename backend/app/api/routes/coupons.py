from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.models.order import Coupon
from app.schemas.review import CouponCreate, CouponOut, CouponUpdate

router = APIRouter(prefix="/api/coupons", tags=["coupons"])


@router.get("/{code}", response_model=CouponOut)
def get_coupon(code: str, db: Session = Depends(get_db)):
    coupon = db.query(Coupon).filter(Coupon.code == code, Coupon.is_active.is_(True)).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return coupon


@router.get("", response_model=list[CouponOut], dependencies=[Depends(get_current_admin)])
def list_coupons(db: Session = Depends(get_db)):
    return db.query(Coupon).all()


@router.post("", response_model=CouponOut, dependencies=[Depends(get_current_admin)])
def create_coupon(payload: CouponCreate, db: Session = Depends(get_db)):
    coupon = Coupon(**payload.model_dump())
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon


@router.patch("/{code}", response_model=CouponOut, dependencies=[Depends(get_current_admin)])
def update_coupon(code: str, payload: CouponUpdate, db: Session = Depends(get_db)):
    coupon = db.query(Coupon).filter(Coupon.code == code).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(coupon, field, value)
    db.commit()
    db.refresh(coupon)
    return coupon


@router.delete("/{code}", dependencies=[Depends(get_current_admin)], status_code=204)
def delete_coupon(code: str, db: Session = Depends(get_db)):
    coupon = db.query(Coupon).filter(Coupon.code == code).first()
    if coupon:
        db.delete(coupon)
        db.commit()
