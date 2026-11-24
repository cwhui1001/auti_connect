"""Opt-in test against a hosted Supabase development project and two synthetic accounts."""

import os
import unittest

import httpx
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


class HostedSupabaseTests(unittest.TestCase):
    def test_authenticated_api_and_database_isolation(self) -> None:
        settings = Settings.from_environment()
        credentials = [(os.getenv(f"TEST_USER_{account}_EMAIL"), os.getenv(f"TEST_USER_{account}_PASSWORD"))
                       for account in ("A", "B")]
        if not settings.supabase_configured or not all(email and password for email, password in credentials):
            self.skipTest("Set the hosted development project and both synthetic account credentials.")

        def safe_status(response: httpx.Response, allowed: set[int], operation: str) -> None:
            self.assertIn(response.status_code, allowed, operation)

        with httpx.Client(
            base_url=settings.supabase_url,
            headers={"apikey": settings.supabase_publishable_key},
            timeout=10,
        ) as hosted, TestClient(create_app(settings)) as api:
            sessions = []
            for email, password in credentials:
                login = hosted.post("/auth/v1/token", params={"grant_type": "password"},
                                    json={"email": email, "password": password})
                safe_status(login, {200}, "Synthetic account sign-in")
                session = login.json()
                sessions.append((session["user"]["id"], {"Authorization": f"Bearer {session['access_token']}"}))

            (first_id, first_headers), (second_id, second_headers) = sessions
            self.assertNotEqual(first_id, second_id, "Use two distinct synthetic users.")
            safe_status(api.get("/api/v1/profile"), {401}, "Anonymous protected endpoint")

            for (_, headers), name in zip(sessions, ("Synthetic Alpha", "Synthetic Beta"), strict=True):
                saved = api.put("/api/v1/profile", headers=headers, json={"display_name": name})
                safe_status(saved, {200}, "Own profile upsert through FastAPI")
                check = api.get("/api/v1/profile", headers=headers)
                safe_status(check, {200}, "Own profile read through FastAPI")
                self.assertEqual(check.json()["profile"]["display_name"], name)

            foreign = hosted.get("/rest/v1/profiles", headers=first_headers, params={"user_id": f"eq.{second_id}"})
            safe_status(foreign, {200}, "Foreign profile RLS read")
            self.assertEqual(foreign.json(), [], "Foreign rows must be hidden.")

            attempted = hosted.patch(
                "/rest/v1/profiles",
                headers={**first_headers, "Prefer": "return=representation"},
                params={"user_id": f"eq.{second_id}"},
                json={"display_name": "Unauthorised edit"},
            )
            safe_status(attempted, {200, 403}, "Foreign profile RLS mutation")
            if attempted.is_success:
                self.assertEqual(attempted.json(), [], "Foreign rows must be unmodifiable.")

            attempted_upsert = hosted.post(
                "/rest/v1/profiles",
                headers={**first_headers, "Prefer": "resolution=merge-duplicates,return=representation"},
                params={"on_conflict": "user_id"},
                json={"user_id": second_id, "display_name": "Unauthorised upsert"},
            )
            safe_status(attempted_upsert, {403}, "Foreign profile RLS upsert")

            checked = api.get("/api/v1/profile", headers=second_headers)
            safe_status(checked, {200}, "Unmodified owner profile")
            self.assertEqual(checked.json()["profile"]["display_name"], "Synthetic Beta")
