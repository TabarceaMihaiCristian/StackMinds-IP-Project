from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from .settings.database_settings import DatabaseSettings

class Settings(BaseSettings):
    APP_ENV: str = "APP_ENV"
    JWT_SECRET_KEY: str = 'JWT_SECRET_KEY'
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    DATABASE: DatabaseSettings = DatabaseSettings()

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore", 
    )

settings = Settings() #type: ignore