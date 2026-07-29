def test_list_products_includes_new_product(client, make_product):
    product, _ = make_product()
    res = client.get("/api/products", params={"page_size": 48})
    assert res.status_code == 200
    body = res.json()
    slugs = [item["slug"] for item in body["items"]]
    assert product.slug in slugs


def test_get_product_by_slug(client, make_product):
    product, variant = make_product()
    res = client.get(f"/api/products/{product.slug}")
    assert res.status_code == 200
    body = res.json()
    assert body["name"] == product.name
    assert body["rating_avg"] == 0
    assert body["rating_count"] == 0
    assert body["variants"][0]["sku"] == variant.sku


def test_get_product_not_found(client):
    res = client.get("/api/products/does-not-exist")
    assert res.status_code == 404


def test_search_query_filters_results(client, make_product):
    product, _ = make_product()
    res = client.get("/api/products", params={"q": product.name})
    assert res.status_code == 200
    body = res.json()
    assert body["total"] >= 1
    assert all(product.name.lower() in item["name"].lower() for item in body["items"])
