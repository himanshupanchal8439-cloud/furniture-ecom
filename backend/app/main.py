from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.routes import addresses, admin, auth, cart, categories, coupons, materials, orders, products, reviews, webhooks
from app.core.config import settings
from app.core.limiter import limiter

app = FastAPI(title="Maison Furniture API", version="1.0.0")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(materials.router)
app.include_router(cart.router)
app.include_router(cart.wishlist_router)
app.include_router(orders.router)
app.include_router(reviews.router)
app.include_router(coupons.router)
app.include_router(addresses.router)
app.include_router(admin.router)
app.include_router(webhooks.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
