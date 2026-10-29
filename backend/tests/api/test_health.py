def test_health(client):
    assert client.get("/api/health").json() == {"status": "ok"}


def test_media_files_are_served(client):
    res = client.get("/media/images/uche.jpg")
    assert res.status_code == 200
    assert res.headers["content-type"] == "image/jpeg"
