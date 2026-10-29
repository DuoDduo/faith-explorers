from pydantic import BaseModel, EmailStr


class SubscribeIn(BaseModel):
    email: EmailStr
