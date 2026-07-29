def test_create_review_requires_auth(client, make_product):
    product, _ = make_product()
    res = client.post("/api/reviews", json={"product_id": str(product.id), "rating": 5})
    assert res.status_code == 401


def test_create_review_and_rating_aggregates(client, make_product, auth_headers):
    product, _ = make_product()
    headers, user = auth_headers()

    res = client.post(
        "/api/reviews",
        json={"product_id": str(product.id), "rating": 4, "title": "Great", "body": "Loved it"},
        headers=headers,
    )
    assert res.status_code == 201
    assert res.json()["rating"] == 4

    product_res = client.get(f"/api/products/{product.slug}")
    assert product_res.json()["rating_avg"] == 4.0
    assert product_res.json()["rating_count"] == 1

    list_res = client.get(f"/api/reviews/product/{product.id}")
    assert list_res.status_code == 200
    reviews = list_res.json()
    assert len(reviews) == 1
    assert reviews[0]["user_name"] == user.full_name


def test_duplicate_review_by_same_user_rejected(client, make_product, auth_headers):
    product, _ = make_product()
    headers, _ = auth_headers()

    client.post("/api/reviews", json={"product_id": str(product.id), "rating": 3}, headers=headers)
    res = client.post("/api/reviews", json={"product_id": str(product.id), "rating": 5}, headers=headers)
    assert res.status_code == 400


def test_delete_review(client, make_product, auth_headers):
    product, _ = make_product()
    headers, _ = auth_headers()

    create_res = client.post("/api/reviews", json={"product_id": str(product.id), "rating": 5}, headers=headers)
    review_id = create_res.json()["id"]

    delete_res = client.delete(f"/api/reviews/{review_id}", headers=headers)
    assert delete_res.status_code == 204

    product_res = client.get(f"/api/products/{product.slug}")
    assert product_res.json()["rating_count"] == 0
