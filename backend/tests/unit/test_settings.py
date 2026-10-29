import pytest

from app.core.config import Settings
from app.core.startup import check_production_settings


@pytest.mark.parametrize(
    "url",
    [
        "postgres://u:p@db:5432/x",
        "postgresql://u:p@db:5432/x",
        "postgresql+psycopg://u:p@db:5432/x",
    ],
)
def test_database_urls_use_psycopg(url):
    assert Settings(database_url=url).database_url == "postgresql+psycopg://u:p@db:5432/x"


def test_production_requires_an_internal_key():
    with pytest.raises(RuntimeError, match="INTERNAL_API_KEY"):
        check_production_settings(Settings(environment="production", internal_api_key=""))
    with pytest.raises(RuntimeError):
        check_production_settings(Settings(environment="production", internal_api_key="change-me"))
    check_production_settings(
        Settings(environment="production", internal_api_key="x" * 40, site_url="https://a.org")
    )


def test_development_is_not_checked():
    check_production_settings(Settings(environment="development", internal_api_key=""))
