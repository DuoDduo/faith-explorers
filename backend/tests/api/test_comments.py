def test_comments(client):
    latest = client.get("/api/comments/latest").json()
    assert len(latest) == 4
    assert latest[0]["user"]["name"] == "Akinsanya Adeniyi"

    thread = client.get(
        "/api/posts/7-keys-to-building-a-christ-centered-relationship/comments"
    ).json()
    assert [c["user"]["name"] for c in thread] == ["Blessing James"]
