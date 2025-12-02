from pydantic import BaseSettings, Field
from .settings import DatabaseSettings

class Settings(BaseSettings):
    app_env: str = Field("dev", env='APP_ENV')
    jwt_secret_key: str = Field(..., env='JWT_SECRET_KEY')
    jwt_algorithm: str = Field("HS256", env='JWT_ALGORITHM')
    access_token_expire_minutes: int = Field(60, env='ACCESS_TOKEN_EXPIRE_MINUTES')

    database: DatabaseSettings = DatabaseSettings()

    class Config:
        env_file = '.env'
        env_file_encoding = 'utf-8'

settings = Settings()