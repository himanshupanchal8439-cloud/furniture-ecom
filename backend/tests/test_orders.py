import app.api.routes.orders as orders_module


def _add_address(client, headers):
    res = client.post(
        "/api/addresses",
        json={
            "label": "Home",
            "line1": "1 Test Street",
            "line2": None,
            "city": "Testville",
            "state": "TS",
            "postal_code": "12345",
            "country": "Testland",
            "is_default": True,
        },
        headers=headers,
    )
    assert res.status_code in (200, 201)
    return res.json()


def test_checkout_requires_auth(client):
    res = client.post("/api/orders/checkout", json={"address_id": "00000000-0000-0000-0000-000000000000", "payment_provider": "stripe"})
    assert res.status_code == 401


def test_checkout_empty_cart_rejected(client, auth_headers):
    headers, _ = auth_headers()
    address = _add_address(client, headers)
    res = client.post(
        "/api/orders/checkout",
        json={"address_id": address["id"], "payment_provider": "stripe"},
        headers=headers,
    )
    assert res.status_code == 400


def test_checkout_creates_order_and_reduces_stock(client, make_product, auth_headers, monkeypatch):
    monkeypatch.setattr(orders_module, "create_stripe_payment_intent", lambda amount: {"id": "pi_test_123"})
    monkeypatch.setattr(orders_module, "create_razorpay_order", lambda amount: {"id": "order_test_123"})

    product, variant = make_product(price="100.00", stock=5)
    headers, _ = auth_headers()
    address = _add_address(client, headers)

    add_item_res = client.post(
        "/api/cart/items", json={"variant_id": str(variant.id), "quantity": 2}, headers=headers
    )
    assert add_item_res.status_code == 200

    checkout_res = client.post(
        "/api/orders/checkout",
        json={"address_id": address["id"], "payment_provider": "stripe"},
        headers=headers,
    )
    assert checkout_res.status_code == 200
    order = checkout_res.json()
    assert order["status"] == "pending"
    assert order["subtotal"] == "200.00"
    assert order["payment_reference"] == "pi_test_123"

    my_orders_res = client.get("/api/orders", headers=headers)
    assert my_orders_res.status_code == 200
    assert any(o["id"] == order["id"] for o in my_orders_res.json())

    product_res = client.get(f"/api/products/{product.slug}")
    remaining_stock = product_res.json()["variants"][0]["stock_quantity"]
    assert remaining_stock == 3


def test_checkout_insufficient_stock_rejected(client, make_product, auth_headers, monkeypatch):
    monkeypatch.setattr(orders_module, "create_stripe_payment_intent", lambda amount: {"id": "pi_test"})
    monkeypatch.setattr(orders_module, "create_razorpay_order", lambda amount: {"id": "order_test"})

    _, variant = make_product(price="50.00", stock=1)
    headers, _ = auth_headers()
    address = _add_address(client, headers)

    client.post("/api/cart/items", json={"variant_id": str(variant.id), "quantity": 2}, headers=headers)

    res = client.post(
        "/api/orders/checkout",
        json={"address_id": address["id"], "payment_provider": "razorpay"},
        headers=headers,
    )
    assert res.status_code == 400
