from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .errors import authentication_required
from .schemas import Health, ProfileResult, ProfileUpdate
from .supabase import Actor, Supabase

router = APIRouter(prefix="/api/v1")
bearer = HTTPBearer(auto_error=False)


def get_supabase(request: Request) -> Supabase:
    return request.app.state.supabase


Gateway = Annotated[Supabase, Depends(get_supabase)]


async def current_actor(
    gateway: Gateway,
    credential: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
) -> Actor:
    if credential is None:
        raise authentication_required()
    return await gateway.authenticate(credential.credentials)


CurrentActor = Annotated[Actor, Depends(current_actor)]


@router.get("/health", tags=["system"])
async def health() -> Health:
    return Health()


@router.get("/profile", tags=["profile"])
async def get_profile(actor: CurrentActor, gateway: Gateway) -> ProfileResult:
    return ProfileResult(profile=await gateway.get_profile(actor))


@router.put("/profile", tags=["profile"])
async def save_profile(body: ProfileUpdate, actor: CurrentActor, gateway: Gateway) -> ProfileResult:
    return ProfileResult(profile=await gateway.save_profile(actor, body.display_name))
