from typing import Literal
from unicodedata import category
from uuid import UUID

from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, field_validator


class Health(BaseModel):
    status: Literal["ok"] = "ok"


class ProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    display_name: str = Field(min_length=1, max_length=80)

    @field_validator("display_name")
    @classmethod
    def single_line(cls, value: str) -> str:
        if any(category(character) in {"Cc", "Zl", "Zp"} for character in value):
            raise ValueError("Enter a single-line display name.")
        return value


class Profile(BaseModel):
    user_id: UUID
    display_name: str
    created_at: AwareDatetime
    updated_at: AwareDatetime


class ProfileResult(BaseModel):
    profile: Profile | None
