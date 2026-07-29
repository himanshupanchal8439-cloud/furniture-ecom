import uuid
from decimal import Decimal

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.limiter import limiter
from app.db.session import get_db
from app.models.material import Material, MaterialQuoteRequest, MaterialType
from app.schemas.material import (
    MaterialCreate,
    MaterialOut,
    MaterialUpdate,
    PaginatedMaterials,
    QuoteRequestCreate,
    QuoteRequestOut,
    QuoteRequestUpdate,
)
from app.services.email import send_material_quote_email

router = APIRouter(prefix="/api/materials", tags=["materials"])


@router.get("/admin/all", response_model=list[MaterialOut], dependencies=[Depends(get_current_admin)])
def admin_list_materials(db: Session = Depends(get_db)):
    return db.query(Material).order_by(Material.position.asc(), Material.created_at.desc()).all()


@router.get("/quote-requests", response_model=list[QuoteRequestOut], dependencies=[Depends(get_current_admin)])
def list_quote_requests(db: Session = Depends(get_db)):
    return db.query(MaterialQuoteRequest).order_by(MaterialQuoteRequest.created_at.desc()).all()


@router.patch(
    "/quote-requests/{request_id}",
    response_model=QuoteRequestOut,
    dependencies=[Depends(get_current_admin)],
)
def update_quote_request(request_id: uuid.UUID, payload: QuoteRequestUpdate, db: Session = Depends(get_db)):
    quote_request = db.get(MaterialQuoteRequest, request_id)
    if not quote_request:
        raise HTTPException(status_code=404, detail="Quote request not found")
    quote_request.status = payload.status
    db.commit()
    db.refresh(quote_request)
    return quote_request


@router.post("/quote-requests", response_model=QuoteRequestOut, status_code=201)
@limiter.limit("5/minute")
def create_quote_request(
    request: Request,
    payload: QuoteRequestCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    material = None
    if payload.material_id:
        material = db.get(Material, payload.material_id)
        if not material:
            raise HTTPException(status_code=404, detail="Material not found")

    quote_request = MaterialQuoteRequest(**payload.model_dump())
    db.add(quote_request)
    db.commit()
    db.refresh(quote_request)

    background_tasks.add_task(
        send_material_quote_email, quote_request.name, quote_request.phone, material.name if material else None
    )
    return quote_request


@router.get("", response_model=PaginatedMaterials)
def list_materials(
    db: Session = Depends(get_db),
    type: MaterialType | None = Query(default=None),
    finish: str | None = Query(default=None),
    q: str | None = Query(default=None),
    min_price: Decimal | None = Query(default=None),
    max_price: Decimal | None = Query(default=None),
    sort: str = Query(default="position", pattern="^(position|price_asc|price_desc|newest)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=24, ge=1, le=48),
):
    query = db.query(Material).filter(Material.is_active.is_(True))

    if type:
        query = query.filter(Material.type == type)
    if finish:
        query = query.filter(Material.finish.ilike(f"%{finish}%"))
    if q:
        like = f"%{q}%"
        query = query.filter(Material.name.ilike(like) | Material.short_description.ilike(like))
    if min_price is not None:
        query = query.filter(Material.price_max >= min_price)
    if max_price is not None:
        query = query.filter(Material.price_min <= max_price)

    if sort == "price_asc":
        query = query.order_by(Material.price_min.asc())
    elif sort == "price_desc":
        query = query.order_by(Material.price_min.desc())
    elif sort == "newest":
        query = query.order_by(Material.created_at.desc())
    else:
        query = query.order_by(Material.position.asc(), Material.created_at.desc())

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedMaterials(items=items, total=total, page=page, page_size=page_size)


@router.get("/{slug}", response_model=MaterialOut)
def get_material(slug: str, db: Session = Depends(get_db)):
    material = db.query(Material).filter(Material.slug == slug, Material.is_active.is_(True)).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material


@router.post("", response_model=MaterialOut, dependencies=[Depends(get_current_admin)])
def create_material(payload: MaterialCreate, db: Session = Depends(get_db)):
    material = Material(**payload.model_dump())
    db.add(material)
    db.commit()
    db.refresh(material)
    return material


@router.patch("/{material_id}", response_model=MaterialOut, dependencies=[Depends(get_current_admin)])
def update_material(material_id: uuid.UUID, payload: MaterialUpdate, db: Session = Depends(get_db)):
    material = db.get(Material, material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(material, field, value)
    db.commit()
    db.refresh(material)
    return material


@router.delete("/{material_id}", dependencies=[Depends(get_current_admin)], status_code=204)
def delete_material(material_id: uuid.UUID, db: Session = Depends(get_db)):
    material = db.get(Material, material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    db.delete(material)
    db.commit()
