from pydantic import BaseSettings, PostgresDsn, Field

class DatabaseSettings(BaseSettings):
    database_url: PostgresDsn = Field(..., env='DATABASE_URL')

    class Config:
        env_file = '.env'
        env_file_encoding = 'utf-8'

