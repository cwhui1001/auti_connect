import json
import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch
from uuid import UUID

import httpx
import jwt
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app

PROJECT = "https://auticonnect-tests.supabase.co"
SIGNING_KEY = "fake-provider-signing-key-for-tests-only"
ALPHA = UUID("26f85902-a005-4792-a7d2-38a0e5598c41")
BETA = UUID("2b999cc5-60a4-4e5d-9b7a-f25bf5f8990b")


def access_token(subject: UUID, signing_key: str = SIGNING_KEY, **overrides) -> str:
    now = datetime.now(timezone.utc)
    return jwt.encode({
        "sub": str(subject),
        "aud": "authenticated",
        "role": "authenticated",
        "iss": f"{PROJECT}/auth/v1",
        "exp": now + timedelta(minutes=10),
        **overrides,
    }, signing_key, algorithm="HS256")


def auth(subject: UUID = ALPHA) -> dict[str, str]:
    return {"Authorization": f"Bearer {access_token(subject)}"}


class FakeSupabase:
    def __init__(self) -> None:
        self.auth_calls = 0
        self.data_calls = 0
        self.rows: dict[str, dict] = {}
        self.override_data = None
        self.override_subject = None

    def __call__(self, request: httpx.Request) -> httpx.Response:
        assert request.headers["apikey"] == "sb_publishable_fake"
        assert "cookie" not in request.headers
        token = request.headers["Authorization"].removeprefix("Bearer ")
        try:
            claims = jwt.decode(token, SIGNING_KEY, algorithms=["HS256"], audience="authenticated")
        except jwt.PyJWTError:
            return httpx.Response(401)
        user_id = claims["sub"]

        if request.url.path == "/auth/v1/user":
            self.auth_calls += 1
            return httpx.Response(
                200,
                headers={"Set-Cookie": "upstream_cookie=fixture; Path=/; Secure"},
                json={"id": self.override_subject or user_id},
            )

        assert request.url.path == "/rest/v1/profiles"
        self.data_calls += 1
        if self.override_data is not None:
            return self.override_data
        if request.method == "GET":
            assert request.url.params["user_id"] == f"eq.{user_id}"
            return httpx.Response(200, json=[self.rows[user_id]] if user_id in self.rows else [])

        assert request.method == "POST"
        assert request.url.params["on_conflict"] == "user_id"
        assert request.headers["Prefer"] == "resolution=merge-duplicates,return=representation"
        payload = json.loads(request.content)
        assert payload["user_id"] == user_id
        result = {**payload, "created_at": "2026-11-25T00:00:00Z", "updated_at": "2026-11-25T00:00:00Z"}
        self.rows[user_id] = result
        return httpx.Response(201, json=[result])


class ApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.supabase = FakeSupabase()
        self.client = self.enterContext(TestClient(create_app(
            Settings(PROJECT, "sb_publishable_fake"),
            transport=httpx.MockTransport(self.supabase),
        )))

    def test_health_is_public_and_does_not_depend_on_supabase(self) -> None:
        response = self.client.get("/api/v1/health")
        self.assertEqual(response.json(), {"status": "ok"})
        self.assertEqual(response.headers["cache-control"], "no-store")
        self.assertEqual(self.supabase.auth_calls, 0)

    def test_profile_rejects_missing_and_forged_bearer_tokens(self) -> None:
        forged = access_token(ALPHA, signing_key="different-provider-key-for-forgery-test")
        for headers in ({}, {"Authorization": f"Bearer {forged}"}):
            with self.subTest(has_token=bool(headers)):
                response = self.client.get("/api/v1/profile", headers=headers)
                self.assertEqual(response.status_code, 401)
                self.assertEqual(response.headers["www-authenticate"], "Bearer")
        self.assertEqual(self.supabase.data_calls, 0)

    def test_rejects_bad_claims_before_calling_provider(self) -> None:
        for invalid in (
            {"iss": "https://other.supabase.co/auth/v1"},
            {"aud": "other"},
            {"exp": datetime.now(timezone.utc) - timedelta(minutes=1)},
            {"role": "service_role"},
            {"is_anonymous": True},
        ):
            with self.subTest(invalid=invalid):
                response = self.client.get(
                    "/api/v1/profile", headers={"Authorization": f"Bearer {access_token(ALPHA, **invalid)}"}
                )
                self.assertEqual(response.status_code, 401)
        self.assertEqual(self.supabase.auth_calls, 0)

    def test_verified_subject_must_match_token(self) -> None:
        self.supabase.override_subject = str(BETA)
        self.assertEqual(self.client.get("/api/v1/profile", headers=auth()).status_code, 401)
        self.assertEqual(self.supabase.data_calls, 0)

    def test_profiles_stay_owned_during_create_update_and_read(self) -> None:
        self.assertEqual(self.client.get("/api/v1/profile", headers=auth()).json(), {"profile": None})
        self.assertEqual(self.client.put("/api/v1/profile", headers=auth(), json={"display_name": " Alpha "}).status_code, 200)
        self.assertEqual(self.client.put("/api/v1/profile", headers=auth(BETA), json={"display_name": "Beta"}).status_code, 200)
        updated = self.client.put("/api/v1/profile", headers=auth(), json={"display_name": "Alpha revised"})
        self.assertEqual(updated.json()["profile"]["display_name"], "Alpha revised")
        result = self.client.get("/api/v1/profile", headers=auth(BETA), params={"user_id": str(ALPHA)})
        self.assertEqual(result.json()["profile"]["user_id"], str(BETA))
        self.assertEqual(result.json()["profile"]["display_name"], "Beta")

    def test_validation_blocks_injected_owner_and_invalid_display_names(self) -> None:
        for body in (
            {"display_name": "Alpha", "user_id": str(BETA)},
            {"display_name": "   "},
            {"display_name": "one\ntwo"},
            {"display_name": "x" * 81},
        ):
            with self.subTest(body=body):
                response = self.client.put("/api/v1/profile", headers=auth(), json=body)
                self.assertEqual(response.status_code, 422)
                self.assertEqual(response.json()["error"]["code"], "invalid_request")
        self.assertEqual(self.supabase.data_calls, 0)

    def test_unowned_upstream_profile_is_not_exposed(self) -> None:
        self.supabase.override_data = httpx.Response(200, json=[{
            "user_id": str(BETA),
            "display_name": "Foreign",
            "created_at": "2026-11-25T00:00:00Z",
            "updated_at": "2026-11-25T00:00:00Z",
        }])
        response = self.client.get("/api/v1/profile", headers=auth())
        self.assertEqual(response.status_code, 503)
        self.assertNotIn("Foreign", response.text)

    def test_upstream_errors_and_request_logs_exclude_private_data(self) -> None:
        self.supabase.override_data = httpx.Response(500, text="private provider payload")
        headers = auth()
        with patch("app.main.logger.info") as log:
            response = self.client.get("/api/v1/profile?email=sample@example.test", headers=headers)
        self.assertEqual(response.status_code, 503)
        self.assertNotIn("private provider payload", response.text)
        entry = json.loads(log.call_args.args[0])
        self.assertEqual(entry["route"], "/api/v1/profile")
        self.assertEqual(entry["request_id"], response.headers["x-request-id"])
        self.assertNotIn("sample@example.test", str(entry))
        self.assertNotIn(headers["Authorization"], str(entry))

    def test_missing_hosted_configuration_keeps_liveness_available(self) -> None:
        with TestClient(create_app(Settings())) as local:
            self.assertEqual(local.get("/api/v1/health").status_code, 200)
            self.assertEqual(local.get("/api/v1/profile", headers=auth()).status_code, 503)


if __name__ == "__main__":
    unittest.main()
