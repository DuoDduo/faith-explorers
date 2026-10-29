from app.utils.text import read_time_minutes, slugify


def test_slugify():
    assert slugify("7 Keys to Building a Christ-Centered Relationship") == (
        "7-keys-to-building-a-christ-centered-relationship"
    )
    assert slugify("God's Plan: Trusting   Him!") == "gods-plan-trusting-him"
    assert slugify("HOE MAY-51") == "hoe-may-51"
    assert slugify("Café") == "cafe"


def test_read_time_rounds_up_and_has_a_minimum():
    assert read_time_minutes("") == 1
    assert read_time_minutes("word " * 200) == 1
    assert read_time_minutes("word " * 201) == 2
