from pydantic_settings import BaseSettings
from typing import List  # Only need List for the CORS origins

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://username:password@localhost/mahalaxmi"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Application
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Mahalaxmi API"
    
    # Admin
    FIRST_ADMIN_EMAIL: str = "admin@mahalaxmi.com"
    FIRST_ADMIN_PASSWORD: str = "admin123"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()