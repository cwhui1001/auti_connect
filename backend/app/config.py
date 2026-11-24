import os
from dataclasses import dataclass, field
from pathlib import Path
from urllib.parse import urlsplit

from dotenv import load_dotenv


@dataclass(frozen=True)
class Settings:
    supabase_url: str = ""
    supabase_publishable_key: str = field(default="", repr=False)

    @classmethod
    def from_environment(cls) -> "Settings":
        load_dotenv(Path(__file__).parent.parent / ".env")
        return cls(
            supabase_url=os.getenv("SUPABASE_URL", "").strip().rstrip("/"),
            supabase_publishable_key=os.getenv("SUPABASE_PUBLISHABLE_KEY", "").strip(),
        )

    @property
    def supabase_configured(self) -> bool:
        try:
            url = urlsplit(self.supabase_url)
        except ValueError:
            return False
        return bool(
            url.scheme == "https"
            and url.hostname
            and not (url.username or url.password or url.path or url.query or url.fragment)
            and self.supabase_publishable_key.startswith("sb_publishable_")
        )
