import time
from typing import Any, Dict, List, Optional
import httpx
from app.core.config import settings

# Simple in-memory cache
_cache: Dict[str, tuple[float, Any]] = {}


def _get_cached(key: str) -> Optional[Any]:
    if key in _cache:
        cached_at, data = _cache[key]
        if time.time() - cached_at < settings.EXTERNAL_API_CACHE_TTL:
            return data
        del _cache[key]
    return None


def _set_cache(key: str, data: Any) -> None:
    _cache[key] = (time.time(), data)


JSONPLACEHOLDER_BASE = "https://jsonplaceholder.typicode.com"


async def fetch_external_users() -> List[Dict]:
    cache_key = "external_users"
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached

    try:
        async with httpx.AsyncClient(timeout=settings.EXTERNAL_API_TIMEOUT) as client:
            response = await client.get(f"{JSONPLACEHOLDER_BASE}/users")
            response.raise_for_status()
            raw_users = response.json()

            # Clean/transform the response — only expose relevant fields
            users = [
                {
                    "id": u["id"],
                    "name": u["name"],
                    "email": u["email"],
                    "company": u.get("company", {}).get("name", ""),
                    "website": u.get("website", ""),
                    "city": u.get("address", {}).get("city", ""),
                }
                for u in raw_users
            ]

            _set_cache(cache_key, users)
            return users

    except httpx.TimeoutException:
        raise RuntimeError("External API request timed out. Please try again later.")
    except httpx.HTTPStatusError as e:
        raise RuntimeError(f"External API returned an error: {e.response.status_code}")
    except httpx.RequestError as e:
        raise RuntimeError(f"Could not connect to external API: {str(e)}")
