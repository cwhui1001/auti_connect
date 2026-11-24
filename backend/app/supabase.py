from dataclasses import dataclass, field
from uuid import UUID

import httpx
import jwt
from pydantic import TypeAdapter

from .config import Settings
from .errors import authentication_required, dependency_unavailable
from .schemas import Profile

_profile_rows = TypeAdapter(list[Profile])


@dataclass(frozen=True)
class Actor:
    user_id: UUID
    token: str = field(repr=False)


class Supabase:
    def __init__(self, settings: Settings, client: httpx.AsyncClient) -> None:
        self.settings = settings
        self.client = client

    async def request(self, method: str, path: str, token: str, **kwargs) -> httpx.Response:
        headers = {
            "apikey": self.settings.supabase_publishable_key,
            "Authorization": f"Bearer {token}",
            **kwargs.pop("headers", {}),
        }
        try:
            # A fresh request keeps a shared client's upstream cookies out of user-scoped calls.
            request = httpx.Request(
                method, f"{self.settings.supabase_url}{path}", headers=headers, **kwargs
            )
            return await self.client.send(request)
        except httpx.RequestError:
            raise dependency_unavailable() from None

    async def authenticate(self, token: str) -> Actor:
        if not self.settings.supabase_configured:
            raise dependency_unavailable()
        try:
            # Use these claims for early rejection only. Hosted Auth must verify the JWT
            # signature and return the matching subject before creating an Actor.
            claims = jwt.decode(
                token,
                issuer=f"{self.settings.supabase_url}/auth/v1",
                audience="authenticated",
                options={
                    "verify_signature": False,
                    "verify_exp": True,
                    "verify_nbf": True,
                    "verify_iss": True,
                    "verify_aud": True,
                    "require": ["exp", "sub", "aud", "iss"],
                },
            )
            subject = UUID(claims["sub"])
        except (jwt.PyJWTError, ValueError, TypeError, AttributeError, OverflowError):
            raise authentication_required() from None
        if claims.get("role") != "authenticated" or claims.get("is_anonymous") is True:
            raise authentication_required()

        response = await self.request("GET", "/auth/v1/user", token)
        if response.status_code in (400, 401, 403):
            raise authentication_required()
        if not response.is_success:
            raise dependency_unavailable()
        try:
            verified_id = UUID(response.json()["id"])
        except (ValueError, KeyError, TypeError, AttributeError):
            raise dependency_unavailable() from None
        if verified_id != subject:
            raise authentication_required()
        return Actor(subject, token)

    async def get_profile(self, actor: Actor) -> Profile | None:
        response = await self.request(
            "GET",
            "/rest/v1/profiles",
            actor.token,
            params={"select": "user_id,display_name,created_at,updated_at", "user_id": f"eq.{actor.user_id}"},
        )
        rows = self.profile_rows(response, actor)
        return rows[0] if rows else None

    async def save_profile(self, actor: Actor, display_name: str) -> Profile:
        response = await self.request(
            "POST",
            "/rest/v1/profiles",
            actor.token,
            params={"on_conflict": "user_id", "select": "user_id,display_name,created_at,updated_at"},
            headers={"Prefer": "resolution=merge-duplicates,return=representation"},
            json={"user_id": str(actor.user_id), "display_name": display_name},
        )
        rows = self.profile_rows(response, actor)
        if not rows:
            raise dependency_unavailable()
        return rows[0]

    @staticmethod
    def profile_rows(response: httpx.Response, actor: Actor) -> list[Profile]:
        if response.status_code == 401:
            raise authentication_required()
        if not response.is_success:
            raise dependency_unavailable()
        try:
            rows = _profile_rows.validate_json(response.content)
        except ValueError:
            raise dependency_unavailable() from None
        if len(rows) > 1 or (rows and rows[0].user_id != actor.user_id):
            raise dependency_unavailable()
        return rows
