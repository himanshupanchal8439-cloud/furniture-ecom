from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.cart import Cart, CartItem, WishlistItem
from app.models.product import Product, ProductVariant
from app.models.user import User
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartOut, WishlistItemOut

router = APIRouter(prefix="/api/cart", tags=["cart"])


def _get_or_create_cart(db: Session, user: User) -> Cart:
    cart = db.query(Cart).options(joinedload(Cart.items).joinedload(CartItem.variant)).filter(Cart.user_id == user.id).first()
    if not cart:
        cart = Cart(user_id=user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


@router.get("", response_model=CartOut)
def get_cart(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _get_or_create_cart(db, user)


@router.post("/items", response_model=CartOut)
def add_item(payload: CartItemCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    variant = db.get(ProductVariant, payload.variant_id)
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")

    cart = _get_or_create_cart(db, user)
    existing = next((i for i in cart.items if i.variant_id == payload.variant_id), None)
    if existing:
        existing.quantity += payload.quantity
    else:
        cart.items.append(CartItem(variant_id=payload.variant_id, quantity=payload.quantity))
    db.commit()
    db.refresh(cart)
    return cart


@router.patch("/items/{item_id}", response_model=CartOut)
def update_item(item_id: str, payload: CartItemUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cart = _get_or_create_cart(db, user)
    item = next((i for i in cart.items if str(i.id) == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    if payload.quantity <= 0:
        db.delete(item)
    else:
        item.quantity = payload.quantity
    db.commit()
    db.refresh(cart)
    return cart


@router.delete("/items/{item_id}", response_model=CartOut)
def remove_item(item_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cart = _get_or_create_cart(db, user)
    item = next((i for i in cart.items if str(i.id) == item_id), None)
    if item:
        db.delete(item)
        db.commit()
        db.refresh(cart)
    return cart


wishlist_router = APIRouter(prefix="/api/wishlist", tags=["wishlist"])


@wishlist_router.get("", response_model=list[WishlistItemOut])
def get_wishlist(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(WishlistItem).filter(WishlistItem.user_id == user.id).all()


@wishlist_router.post("/{product_id}", response_model=WishlistItemOut)
def add_to_wishlist(product_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not db.get(Product, product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    existing = db.query(WishlistItem).filter(WishlistItem.user_id == user.id, WishlistItem.product_id == product_id).first()
    if existing:
        return existing
    item = WishlistItem(user_id=user.id, product_id=product_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@wishlist_router.delete("/{product_id}", status_code=204)
def remove_from_wishlist(product_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = db.query(WishlistItem).filter(WishlistItem.user_id == user.id, WishlistItem.product_id == product_id).first()
    if item:
        db.delete(item)
        db.commit()
