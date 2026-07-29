def test_signup_login_me(client):
    payload = {"email": "newcustomer@example.com", "password": "Password123!", "full_name": "New Customer"}
    signup_res = client.post("/api/auth/signup", json=payload)
    assert signup_res.status_code == 201
    assert signup_res.json()["email"] == payload["email"]

    login_res = client.post("/api/auth/login", json={"email": payload["email"], "password": payload["password"]})
    assert login_res.status_code == 200
    tokens = login_res.json()
    assert tokens["access_token"]

    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {tokens['access_token']}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == payload["email"]


def test_signup_duplicate_email_rejected(client):
    payload = {"email": "dupe@example.com", "password": "Password123!", "full_name": "Dupe"}
    client.post("/api/auth/signup", json=payload)
    res = client.post("/api/auth/signup", json=payload)
    assert res.status_code == 400


def test_login_wrong_password_rejected(client):
    payload = {"email": "wrongpass@example.com", "password": "Password123!", "full_name": "Wrong Pass"}
    client.post("/api/auth/signup", json=payload)
    res = client.post("/api/auth/login", json={"email": payload["email"], "password": "not-the-password"})
    assert res.status_code == 401


def test_me_requires_auth(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401
