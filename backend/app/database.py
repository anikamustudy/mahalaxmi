from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.core.config import settings

# Convert PostgreSQL URL to async version
ASYNC_DATABASE_URL = settings.DATABASE_URL.replace('postgresql://', 'postgresql+asyncpg://')

# Create async engine
engine = create_async_engine(ASYNC_DATABASE_URL)

# Create async session factory
async_session_maker = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()


async def get_async_session():
    async with async_session_maker() as session:
        yield session


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
