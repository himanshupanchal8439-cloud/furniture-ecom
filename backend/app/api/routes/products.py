import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.models.product import Category, Product, ProductImage, ProductVariant
from app.schemas.product import PaginatedProducts, ProductCreate, ProductOut, ProductUpdate

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("/admin/all", response_model=PaginatedProducts, dependencies=[Depends(get_current_admin)])
def admin_list_products(
    db: Session = Depends(get_db),
    q: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    query = db.query(Product).options(joinedload(Product.category), joinedload(Product.images))
    if q:
        like = f"%{q}%"
        query = query.filter(or_(Product.name.ilike(like), Product.description.ilike(like)))
    query = query.order_by(Product.created_at.desc())

    total = query.distinct().count()
    items = query.distinct().offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedProducts(items=items, total=total, page=page, page_size=page_size)


@router.get("/admin/{product_id}", response_model=ProductOut, dependencies=[Depends(get_current_admin)])
def admin_get_product(product_id: uuid.UUID, db: Session = Depends(get_db)):
    product = (
        db.query(Product)
        .options(joinedload(Product.category), joinedload(Product.images), joinedload(Product.variants))
        .filter(Product.id == product_id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("", response_model=PaginatedProducts)
def list_products(
    db: Session = Depends(get_db),
    q: str | None = Query(default=None, description="Search query"),
    category: str | None = Query(default=None, description="Category slug"),
    min_price: Decimal | None = Query(default=None),
    max_price: Decimal | None = Query(default=None),
    color: str | None = Query(default=None),
    material: str | None = Query(default=None),
    sort: str = Query(default="newest", pattern="^(newest|price_asc|price_desc)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=48),
):
    query = db.query(Product).options(
        joinedload(Product.category), joinedload(Product.images)
    ).filter(Product.is_active.is_(True))

    if q:
        like = f"%{q}%"
        query = query.filter(or_(Product.name.ilike(like), Product.description.ilike(like)))
    if category:
        query = query.join(Category).filter(Category.slug == category)
    if min_price is not None:
        query = query.filter(Product.base_price >= min_price)
    if max_price is not None:
        query = query.filter(Product.base_price <= max_price)
    if material:
        query = query.filter(Product.material.ilike(f"%{material}%"))
    if color:
        query = query.join(ProductVariant).filter(ProductVariant.color.ilike(f"%{color}%"))

    if sort == "price_asc":
        query = query.order_by(Product.base_price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.base_price.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    total = query.distinct().count()
    items = query.distinct().offset((page - 1) * page_size).limit(page_size).all()

    return PaginatedProducts(items=items, total=total, page=page, page_size=page_size)


@router.get("/{slug}", response_model=ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = (
        db.query(Product)
        .options(joinedload(Product.category), joinedload(Product.images), joinedload(Product.variants))
        .filter(Product.slug == slug)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("/{slug}/recommendations", response_model=list[ProductOut])
def get_recommendations(slug: str, db: Session = Depends(get_db), limit: int = Query(default=4, ge=1, le=20)):
    product = db.query(Product).filter(Product.slug == slug).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return (
        db.query(Product)
        .options(joinedload(Product.category), joinedload(Product.images), joinedload(Product.variants))
        .filter(Product.category_id == product.category_id, Product.id != product.id, Product.is_active.is_(True))
        .limit(limit)
        .all()
    )


@router.post("", response_model=ProductOut, dependencies=[Depends(get_current_admin)])
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude={"variants", "images"})
    product = Product(**data)
    for variant_data in payload.variants:
        product.variants.append(ProductVariant(**variant_data.model_dump()))
    for image_data in payload.images:
        product.images.append(ProductImage(**image_data.model_dump(exclude={"id"})))
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.patch("/{product_id}", response_model=ProductOut, dependencies=[Depends(get_current_admin)])
def update_product(product_id: uuid.UUID, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    data = payload.model_dump(exclude={"variants", "images"}, exclude_unset=True)
    for field, value in data.items():
        setattr(product, field, value)

    if payload.variants is not None:
        incoming_ids = {v.id for v in payload.variants if v.id}
        for variant in list(product.variants):
            if variant.id not in incoming_ids:
                product.variants.remove(variant)
        existing_by_id = {v.id: v for v in product.variants}
        for variant_data in payload.variants:
            if variant_data.id and variant_data.id in existing_by_id:
                for field, value in variant_data.model_dump(exclude={"id"}).items():
                    setattr(existing_by_id[variant_data.id], field, value)
            else:
                product.variants.append(ProductVariant(**variant_data.model_dump(exclude={"id"})))

    if payload.images is not None:
        incoming_ids = {i.id for i in payload.images if i.id}
        for image in list(product.images):
            if image.id not in incoming_ids:
                product.images.remove(image)
        existing_by_id = {i.id: i for i in product.images}
        for image_data in payload.images:
            if image_data.id and image_data.id in existing_by_id:
                for field, value in image_data.model_dump(exclude={"id"}).items():
                    setattr(existing_by_id[image_data.id], field, value)
            else:
                product.images.append(ProductImage(**image_data.model_dump(exclude={"id"})))

    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", dependencies=[Depends(get_current_admin)], status_code=204)
def delete_product(product_id: uuid.UUID, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
