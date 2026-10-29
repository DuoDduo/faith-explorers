from pydantic import BaseModel, Field, field_validator


class ProfileUpdateIn(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    bio: str | None = Field(default=None, max_length=500)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Name can't be empty")
        return value

    @field_validator("bio")
    @classmethod
    def strip_bio(cls, value: str | None) -> str | None:
        return value.strip() if value is not None else None


class PasswordChangeIn(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class AccountDeleteIn(BaseModel):
    password: str = Field(min_length=1, max_length=128)
