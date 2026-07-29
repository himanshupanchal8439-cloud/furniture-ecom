import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password
from app.db.session import Base, engine, get_db
from app.main import app
from app.models.product import Category, Product, ProductVariant
from app.models.user import User, UserRole


@pytest.fixture(scope="session", autouse=True)
def _create_tables():
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture()
def db_session():
    connection = engine.connect()
    trans = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")

    yield session

    session.close()
    trans.rollback()
    connection.close()


@pytest.fixture()
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def _unique(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


@pytest.fixture()
def make_user(db_session):
    def _make(role: UserRole = UserRole.customer, password: str = "Password123!"):
        user = User(
            email=f"{_unique('user')}@example.com",
            hashed_password=hash_password(password),
            full_name="Test User",
            role=role,
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        return user, password

    return _make


@pytest.fixture()
def auth_headers(make_user):
    def _headers(role: UserRole = UserRole.customer):
        user, _ = make_user(role=role)
        token = create_access_token(str(user.id), user.role.value)
        return {"Authorization": f"Bearer {token}"}, user

    return _headers


@pytest.fixture()
def make_product(db_session):
    def _make(price: str = "199.00", stock: int = 10):
        category = Category(name=_unique("Category"), slug=_unique("category"))
        db_session.add(category)
        db_session.flush()

        product = Product(
            name=_unique("Product"),
            slug=_unique("product"),
            description="A test product",
            base_price=price,
            category_id=category.id,
        )
        db_session.add(product)
        db_session.flush()

        variant = ProductVariant(
            product_id=product.id,
            color="Black",
            sku=_unique("SKU"),
            price_delta="0",
            stock_quantity=stock,
        )
        db_session.add(variant)
        db_session.commit()
        db_session.refresh(product)
        return product, variant

    return _make
