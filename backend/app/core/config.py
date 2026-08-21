from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://taskmanager:taskmanager_secret@localhost:5432/taskmanager"
    SECRET_KEY: str = "dev-secret-key-change-in-production-minimum-32-chars-long"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    CORS_ORIGINS: str = "http://localhost:5173"
    EXTERNAL_API_TIMEOUT: int = 10
    EXTERNAL_API_CACHE_TTL: int = 60

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
