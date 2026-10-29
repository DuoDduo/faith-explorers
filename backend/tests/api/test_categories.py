def test_categories_have_published_counts(client):
    cats = {c["slug"]: c for c in client.get("/api/categories").json()}
    assert len(cats) == 13
    assert cats["spiritual-disciplines"]["post_count"] == 7
    assert cats["worship"]["cover_url"] == "/media/images/broisrael-3.jpg"
    assert client.get("/api/categories/worship").json()["post_count"] == 5
    assert client.get("/api/categories/nope").status_code == 404
